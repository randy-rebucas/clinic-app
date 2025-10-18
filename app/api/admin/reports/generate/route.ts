import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Employee } from '@/lib/models/Employee';
import { TimeEntry } from '@/lib/models/TimeEntry';
import { ScreenCapture } from '@/lib/models/ScreenCapture';
import { apiRateLimiter } from '@/lib/rateLimiter';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = apiRateLimiter(request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429 }
      );
    }

    const { reportId, dateRange, employeeIds } = await request.json();

    if (!reportId || !dateRange) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    await connectDB();

    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    endDate.setHours(23, 59, 59, 999); // End of day

    let reportData: Record<string, unknown> = {};

    switch (reportId) {
      case 'daily-attendance':
        reportData = await generateDailyAttendanceReport(startDate, endDate, employeeIds);
        break;
      case 'weekly-time-tracking':
        reportData = await generateWeeklyTimeTrackingReport(startDate, endDate, employeeIds);
        break;
      case 'employee-productivity':
        reportData = await generateEmployeeProductivityReport(startDate, endDate, employeeIds);
        break;
      case 'monthly-summary':
        reportData = await generateMonthlySummaryReport(startDate, endDate, employeeIds);
        break;
      case 'employee-activity':
        reportData = await generateEmployeeActivityReport(startDate, endDate, employeeIds);
        break;
      case 'overtime-analysis':
        reportData = await generateOvertimeAnalysisReport(startDate, endDate, employeeIds);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid report type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: reportData
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

async function generateDailyAttendanceReport(startDate: Date, endDate: Date, employeeIds?: string[]) {
  // Get all employees
  const employees = employeeIds && employeeIds.length > 0 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? await (Employee as any).find({ employeeId: { $in: employeeIds } }).select('_id name email role department employeeId')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    : await (Employee as any).find({}).select('_id name email role department employeeId');

  // Get time entries for the date range
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const timeEntries = await (TimeEntry as any).find({
    ...(employeeIds && employeeIds.length > 0 ? { employeeId: { $in: employeeIds } } : {}),
    timestamp: { $gte: startDate, $lte: endDate },
    type: { $in: ['clock_in', 'clock_out'] }
  }).sort({ timestamp: 1 });

  // Calculate attendance for each employee
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const attendanceData = employees.map((employee: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const employeeEntries = timeEntries.filter((entry: any) => 
      entry.employeeId === employee.employeeId
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clockIns = employeeEntries.filter((entry: any) => entry.type === 'clock_in');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clockOuts = employeeEntries.filter((entry: any) => entry.type === 'clock_out');

    const presentDays = new Set();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clockIns.forEach((clockIn: any) => {
      const date = clockIn.timestamp.toDateString();
      presentDays.add(date);
    });

    return {
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
      presentDays: presentDays.size,
      totalDays: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
      clockIns: clockIns.length,
      clockOuts: clockOuts.length
    };
  });

  const totalEmployees = employees.length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const presentToday = attendanceData.filter((emp: any) => {
    return emp.presentDays > 0;
  }).length;
  const absentToday = totalEmployees - presentToday;

  return {
    totalEmployees,
    presentToday,
    absentToday,
    attendanceData,
    dateRange: { startDate, endDate }
  };
}

async function generateWeeklyTimeTrackingReport(startDate: Date, endDate: Date, employeeIds?: string[]) {
  // Get time entries for the date range
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const timeEntries = await (TimeEntry as any).find({
    ...(employeeIds && employeeIds.length > 0 ? { employeeId: { $in: employeeIds } } : {}),
    timestamp: { $gte: startDate, $lte: endDate }
  }).sort({ timestamp: 1 });

  // Calculate total hours
  let totalHours = 0;
  let overtimeHours = 0;
  const employeeHours: { [key: string]: number } = {};

  // Group entries by employee and calculate hours
  const employeeEntries: { [key: string]: Array<{ employeeId: string; timestamp: Date; type: string }> } = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  timeEntries.forEach((entry: any) => {
    if (!employeeEntries[entry.employeeId]) {
      employeeEntries[entry.employeeId] = [];
    }
    employeeEntries[entry.employeeId].push(entry);
  });

  Object.keys(employeeEntries).forEach(employeeId => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entries = employeeEntries[employeeId].sort((a: any, b: any) => a.timestamp.getTime() - b.timestamp.getTime());
    let employeeTotalHours = 0;
    let clockInTime: Date | null = null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entries.forEach((entry: any) => {
      if (entry.type === 'clock_in') {
        clockInTime = entry.timestamp;
      } else if (entry.type === 'clock_out' && clockInTime) {
        const hours = (entry.timestamp.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
        employeeTotalHours += hours;
        clockInTime = null;
      }
    });

    employeeHours[employeeId] = employeeTotalHours;
    totalHours += employeeTotalHours;

    // Calculate overtime (assuming 8 hours per day is standard)
    const daysWorked = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const standardHours = daysWorked * 8;
    if (employeeTotalHours > standardHours) {
      overtimeHours += employeeTotalHours - standardHours;
    }
  });

  const activeEmployees = Object.keys(employeeHours).length;
  const averageHours = activeEmployees > 0 ? totalHours / activeEmployees : 0;

  return {
    totalHours: Math.round(totalHours * 100) / 100,
    averageHours: Math.round(averageHours * 100) / 100,
    overtimeHours: Math.round(overtimeHours * 100) / 100,
    activeEmployees,
    employeeHours,
    dateRange: { startDate, endDate }
  };
}

async function generateEmployeeProductivityReport(startDate: Date, endDate: Date, employeeIds?: string[]) {
  // Get employees
  const employees = employeeIds && employeeIds.length > 0 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? await (Employee as any).find({ employeeId: { $in: employeeIds } }).select('_id name email role department employeeId')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    : await (Employee as any).find({}).select('_id name email role department employeeId');

  // Get time entries
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const timeEntries = await (TimeEntry as any).find({
    ...(employeeIds && employeeIds.length > 0 ? { employeeId: { $in: employeeIds } } : {}),
    timestamp: { $gte: startDate, $lte: endDate }
  }).sort({ timestamp: 1 });

  // Get screen captures
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const screenCaptures = await (ScreenCapture as any).find({
    ...(employeeIds && employeeIds.length > 0 ? { employeeId: { $in: employeeIds } } : {}),
    timestamp: { $gte: startDate, $lte: endDate }
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const productivityData = employees.map((employee: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const employeeTimeEntries = timeEntries.filter((entry: any) => entry.employeeId === employee.employeeId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const employeeScreenCaptures = screenCaptures.filter((capture: any) => capture.employeeId === employee.employeeId);

    // Calculate hours worked
    let hoursWorked = 0;
    let clockInTime: Date | null = null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    employeeTimeEntries.forEach((entry: any) => {
      if (entry.type === 'clock_in') {
        clockInTime = entry.timestamp;
      } else if (entry.type === 'clock_out' && clockInTime) {
        const hours = (entry.timestamp.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
        hoursWorked += hours;
        clockInTime = null;
      }
    });

    // Calculate productivity score (simplified)
    const daysWorked = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const expectedHours = daysWorked * 8;
    const productivityScore = expectedHours > 0 ? Math.min(100, Math.round((hoursWorked / expectedHours) * 100)) : 0;

    return {
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
      hoursWorked: Math.round(hoursWorked * 100) / 100,
      productivityScore,
      screenCaptures: employeeScreenCaptures.length,
      status: hoursWorked > 0 ? 'active' : 'inactive'
    };
  });

  return {
    employees: productivityData,
    totalEmployees: employees.length,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activeEmployees: productivityData.filter((emp: any) => emp.status === 'active').length,
    averageProductivity: productivityData.length > 0 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? Math.round(productivityData.reduce((sum: number, emp: any) => sum + emp.productivityScore, 0) / productivityData.length)
      : 0,
    dateRange: { startDate, endDate }
  };
}

async function generateMonthlySummaryReport(startDate: Date, endDate: Date, employeeIds?: string[]) {
  // Get time entries
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const timeEntries = await (TimeEntry as any).find({
    ...(employeeIds && employeeIds.length > 0 ? { employeeId: { $in: employeeIds } } : {}),
    timestamp: { $gte: startDate, $lte: endDate }
  }).sort({ timestamp: 1 });

  // Calculate metrics
  const totalWorkDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  let totalHours = 0;
  const employeeEntries: { [key: string]: Array<{ employeeId: string; timestamp: Date; type: string }> } = {};
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  timeEntries.forEach((entry: any) => {
    if (!employeeEntries[entry.employeeId]) {
      employeeEntries[entry.employeeId] = [];
    }
    employeeEntries[entry.employeeId].push(entry);
  });

  Object.keys(employeeEntries).forEach(employeeId => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entries = employeeEntries[employeeId].sort((a: any, b: any) => a.timestamp.getTime() - b.timestamp.getTime());
    let employeeTotalHours = 0;
    let clockInTime: Date | null = null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entries.forEach((entry: any) => {
      if (entry.type === 'clock_in') {
        clockInTime = entry.timestamp;
      } else if (entry.type === 'clock_out' && clockInTime) {
        const hours = (entry.timestamp.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
        employeeTotalHours += hours;
        clockInTime = null;
      }
    });

    totalHours += employeeTotalHours;
  });

  const averageDailyHours = totalWorkDays > 0 ? totalHours / totalWorkDays : 0;
  
  // Calculate attendance rate
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uniqueEmployees = new Set(timeEntries.map((entry: any) => entry.employeeId));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalEmployees = await (Employee as any).countDocuments(
    employeeIds && employeeIds.length > 0 ? { employeeId: { $in: employeeIds } } : {}
  );
  const attendanceRate = totalEmployees > 0 ? Math.round((uniqueEmployees.size / totalEmployees) * 100) : 0;

  return {
    totalWorkDays,
    totalHours: Math.round(totalHours * 100) / 100,
    averageDailyHours: Math.round(averageDailyHours * 100) / 100,
    attendanceRate,
    activeEmployees: uniqueEmployees.size,
    totalEmployees,
    dateRange: { startDate, endDate }
  };
}

async function generateEmployeeActivityReport(startDate: Date, endDate: Date, employeeIds?: string[]) {
  // Get employees
  const employees = employeeIds && employeeIds.length > 0 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? await (Employee as any).find({ employeeId: { $in: employeeIds } }).select('_id name email role department employeeId')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    : await (Employee as any).find({}).select('_id name email role department employeeId');

  // Get time entries
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const timeEntries = await (TimeEntry as any).find({
    ...(employeeIds && employeeIds.length > 0 ? { employeeId: { $in: employeeIds } } : {}),
    timestamp: { $gte: startDate, $lte: endDate }
  }).sort({ timestamp: -1 });

  // Get screen captures
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const screenCaptures = await (ScreenCapture as any).find({
    ...(employeeIds && employeeIds.length > 0 ? { employeeId: { $in: employeeIds } } : {}),
    timestamp: { $gte: startDate, $lte: endDate }
  }).sort({ timestamp: -1 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activityData = employees.map((employee: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const employeeTimeEntries = timeEntries.filter((entry: any) => entry.employeeId === employee.employeeId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const employeeScreenCaptures = screenCaptures.filter((capture: any) => capture.employeeId === employee.employeeId);

    // Get last activity
    const lastTimeEntry = employeeTimeEntries[0];
    const lastScreenCapture = employeeScreenCaptures[0];
    
    let lastActivity = null;
    if (lastTimeEntry && lastScreenCapture) {
      lastActivity = lastTimeEntry.timestamp > lastScreenCapture.timestamp ? lastTimeEntry.timestamp : lastScreenCapture.timestamp;
    } else if (lastTimeEntry) {
      lastActivity = lastTimeEntry.timestamp;
    } else if (lastScreenCapture) {
      lastActivity = lastScreenCapture.timestamp;
    }

    return {
      employeeId: employee.employeeId,
      employeeName: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
      lastActivity,
      screenCaptures: employeeScreenCaptures.length,
      timeEntries: employeeTimeEntries.length,
      status: lastActivity && (Date.now() - lastActivity.getTime()) < 24 * 60 * 60 * 1000 ? 'active' : 'inactive'
    };
  });

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activities: activityData.sort((a: any, b: any) => {
      if (!a.lastActivity && !b.lastActivity) return 0;
      if (!a.lastActivity) return 1;
      if (!b.lastActivity) return -1;
      return b.lastActivity.getTime() - a.lastActivity.getTime();
    }),
    totalEmployees: employees.length,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activeEmployees: activityData.filter((emp: any) => emp.status === 'active').length,
    dateRange: { startDate, endDate }
  };
}

async function generateOvertimeAnalysisReport(startDate: Date, endDate: Date, employeeIds?: string[]) {
  // Get time entries
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const timeEntries = await (TimeEntry as any).find({
    ...(employeeIds && employeeIds.length > 0 ? { employeeId: { $in: employeeIds } } : {}),
    timestamp: { $gte: startDate, $lte: endDate }
  }).sort({ timestamp: 1 });

  // Calculate overtime for each employee
  const employeeEntries: { [key: string]: Array<{ employeeId: string; timestamp: Date; type: string }> } = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  timeEntries.forEach((entry: any) => {
    if (!employeeEntries[entry.employeeId]) {
      employeeEntries[entry.employeeId] = [];
    }
    employeeEntries[entry.employeeId].push(entry);
  });

  let totalOvertimeHours = 0;
  let employeesWithOvertime = 0;
  const overtimeData: Array<{
    employeeId: string;
    totalHours: number;
    standardHours: number;
    overtimeHours: number;
    overtimePercentage: number;
  }> = [];

  Object.keys(employeeEntries).forEach(employeeId => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entries = employeeEntries[employeeId].sort((a: any, b: any) => a.timestamp.getTime() - b.timestamp.getTime());
    let employeeTotalHours = 0;
    let clockInTime: Date | null = null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entries.forEach((entry: any) => {
      if (entry.type === 'clock_in') {
        clockInTime = entry.timestamp;
      } else if (entry.type === 'clock_out' && clockInTime) {
        const hours = (entry.timestamp.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
        employeeTotalHours += hours;
        clockInTime = null;
      }
    });

    // Calculate overtime (assuming 8 hours per day is standard)
    const daysWorked = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const standardHours = daysWorked * 8;
    const overtimeHours = Math.max(0, employeeTotalHours - standardHours);

    if (overtimeHours > 0) {
      employeesWithOvertime++;
      totalOvertimeHours += overtimeHours;
      
      overtimeData.push({
        employeeId,
        totalHours: Math.round(employeeTotalHours * 100) / 100,
        standardHours,
        overtimeHours: Math.round(overtimeHours * 100) / 100,
        overtimePercentage: Math.round((overtimeHours / standardHours) * 100)
      });
    }
  });

  const averageOvertime = employeesWithOvertime > 0 ? totalOvertimeHours / employeesWithOvertime : 0;

  return {
    totalOvertimeHours: Math.round(totalOvertimeHours * 100) / 100,
    employeesWithOvertime,
    averageOvertime: Math.round(averageOvertime * 100) / 100,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    overtimeData: overtimeData.sort((a: any, b: any) => b.overtimeHours - a.overtimeHours),
    dateRange: { startDate, endDate }
  };
}
