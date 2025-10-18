import { NextRequest, NextResponse } from 'next/server';
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

    const { reportId, format, data, dateRange } = await request.json();

    if (!reportId || !format || !data) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    let fileContent: string;
    let contentType: string;
    let filename: string;

    switch (format) {
      case 'csv':
        fileContent = generateCSV(data, reportId);
        contentType = 'text/csv';
        filename = `${reportId}-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'pdf':
        // For PDF, we'll return a simple text representation
        // In a real application, you'd use a library like puppeteer or jsPDF
        fileContent = generatePDFText(data, reportId, dateRange);
        contentType = 'text/plain';
        filename = `${reportId}-${new Date().toISOString().split('T')[0]}.txt`;
        break;
      case 'excel':
        // For Excel, we'll return CSV format (Excel can open CSV files)
        fileContent = generateCSV(data, reportId);
        contentType = 'application/vnd.ms-excel';
        filename = `${reportId}-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Unsupported export format' },
          { status: 400 }
        );
    }

    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Error exporting report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export report' },
      { status: 500 }
    );
  }
}

interface ReportData {
  attendanceData?: Array<{
    employeeId: string;
    name: string;
    email: string;
    role: string;
    department: string;
    presentDays: number;
    totalDays: number;
    clockIns: number;
    clockOuts: number;
  }>;
  employeeHours?: Record<string, number>;
  employees?: Array<{
    employeeId: string;
    name: string;
    email: string;
    role: string;
    department: string;
    hoursWorked: number;
    productivityScore: number;
    screenCaptures: number;
    status: string;
  }>;
  totalWorkDays?: number;
  totalHours?: number;
  averageDailyHours?: number;
  averageHours?: number;
  overtimeHours?: number;
  attendanceRate?: number;
  activeEmployees?: number;
  totalEmployees?: number;
  presentToday?: number;
  absentToday?: number;
  averageProductivity?: number;
  totalOvertimeHours?: number;
  employeesWithOvertime?: number;
  averageOvertime?: number;
  activities?: Array<{
    employeeId: string;
    employeeName: string;
    email: string;
    role: string;
    department: string;
    lastActivity?: Date;
    screenCaptures: number;
    timeEntries: number;
    status: string;
  }>;
  overtimeData?: Array<{
    employeeId: string;
    totalHours: number;
    standardHours: number;
    overtimeHours: number;
    overtimePercentage: number;
  }>;
}

function generateCSV(data: ReportData, reportId: string): string {
  let csv = '';
  
  switch (reportId) {
    case 'daily-attendance':
      csv = generateDailyAttendanceCSV(data);
      break;
    case 'weekly-time-tracking':
      csv = generateWeeklyTimeTrackingCSV(data);
      break;
    case 'employee-productivity':
      csv = generateEmployeeProductivityCSV(data);
      break;
    case 'monthly-summary':
      csv = generateMonthlySummaryCSV(data);
      break;
    case 'employee-activity':
      csv = generateEmployeeActivityCSV(data);
      break;
    case 'overtime-analysis':
      csv = generateOvertimeAnalysisCSV(data);
      break;
    default:
      csv = 'Report data not available';
  }
  
  return csv;
}

function generateDailyAttendanceCSV(data: ReportData): string {
  let csv = 'Employee ID,Name,Email,Role,Department,Present Days,Total Days,Clock Ins,Clock Outs\n';
  
  if (data.attendanceData) {
    data.attendanceData?.forEach((emp) => {
      csv += `${emp.employeeId},"${emp.name}","${emp.email}","${emp.role}","${emp.department}",${emp.presentDays},${emp.totalDays},${emp.clockIns},${emp.clockOuts}\n`;
    });
  }
  
  return csv;
}

function generateWeeklyTimeTrackingCSV(data: ReportData): string {
  let csv = 'Employee ID,Total Hours\n';
  
  if (data.employeeHours) {
    Object.entries(data.employeeHours).forEach(([employeeId, hours]) => {
      csv += `${employeeId},${hours}\n`;
    });
  }
  
  return csv;
}

function generateEmployeeProductivityCSV(data: ReportData): string {
  let csv = 'Employee ID,Name,Email,Role,Department,Hours Worked,Productivity Score,Screen Captures,Status\n';
  
  if (data.employees) {
    data.employees?.forEach((emp) => {
      csv += `${emp.employeeId},"${emp.name}","${emp.email}","${emp.role}","${emp.department}",${emp.hoursWorked},${emp.productivityScore},${emp.screenCaptures},${emp.status}\n`;
    });
  }
  
  return csv;
}

function generateMonthlySummaryCSV(data: ReportData): string {
  let csv = 'Metric,Value\n';
  csv += `Total Work Days,${data.totalWorkDays}\n`;
  csv += `Total Hours,${data.totalHours}\n`;
  csv += `Average Daily Hours,${data.averageDailyHours}\n`;
  csv += `Attendance Rate,${data.attendanceRate}%\n`;
  csv += `Active Employees,${data.activeEmployees}\n`;
  csv += `Total Employees,${data.totalEmployees}\n`;
  
  return csv;
}

function generateEmployeeActivityCSV(data: ReportData): string {
  let csv = 'Employee ID,Name,Email,Role,Department,Last Activity,Screen Captures,Time Entries,Status\n';
  
  if (data.activities) {
    data.activities?.forEach((activity) => {
      const lastActivity = activity.lastActivity ? new Date(activity.lastActivity).toLocaleString() : 'N/A';
      csv += `${activity.employeeId},"${activity.employeeName}","${activity.email}","${activity.role}","${activity.department}","${lastActivity}",${activity.screenCaptures},${activity.timeEntries},${activity.status}\n`;
    });
  }
  
  return csv;
}

function generateOvertimeAnalysisCSV(data: ReportData): string {
  let csv = 'Employee ID,Total Hours,Standard Hours,Overtime Hours,Overtime Percentage\n';
  
  if (data.overtimeData) {
    data.overtimeData?.forEach((emp) => {
      csv += `${emp.employeeId},${emp.totalHours},${emp.standardHours},${emp.overtimeHours},${emp.overtimePercentage}%\n`;
    });
  }
  
  return csv;
}

interface DateRange {
  startDate: string | Date;
  endDate: string | Date;
}

function generatePDFText(data: ReportData, reportId: string, dateRange?: DateRange): string {
  let text = '';
  
  const reportTitle = getReportTitle(reportId);
  text += `${reportTitle}\n`;
  text += `Generated on: ${new Date().toLocaleString()}\n`;
  if (dateRange) {
    text += `Date Range: ${new Date(dateRange.startDate).toLocaleDateString()} - ${new Date(dateRange.endDate).toLocaleDateString()}\n`;
  }
  text += '='.repeat(50) + '\n\n';
  
  switch (reportId) {
    case 'daily-attendance':
      text += generateDailyAttendanceText(data);
      break;
    case 'weekly-time-tracking':
      text += generateWeeklyTimeTrackingText(data);
      break;
    case 'employee-productivity':
      text += generateEmployeeProductivityText(data);
      break;
    case 'monthly-summary':
      text += generateMonthlySummaryText(data);
      break;
    case 'employee-activity':
      text += generateEmployeeActivityText(data);
      break;
    case 'overtime-analysis':
      text += generateOvertimeAnalysisText(data);
      break;
    default:
      text += 'Report data not available';
  }
  
  return text;
}

function getReportTitle(reportId: string): string {
  const titles: { [key: string]: string } = {
    'daily-attendance': 'Daily Attendance Report',
    'weekly-time-tracking': 'Weekly Time Tracking Report',
    'employee-productivity': 'Employee Productivity Report',
    'monthly-summary': 'Monthly Summary Report',
    'employee-activity': 'Employee Activity Report',
    'overtime-analysis': 'Overtime Analysis Report'
  };
  return titles[reportId] || 'Report';
}

function generateDailyAttendanceText(data: ReportData): string {
  let text = `SUMMARY\n`;
  text += `Total Employees: ${data.totalEmployees}\n`;
  text += `Present Today: ${data.presentToday}\n`;
  text += `Absent Today: ${data.absentToday}\n\n`;
  
  text += `DETAILED ATTENDANCE\n`;
  text += '-'.repeat(80) + '\n';
  
  if (data.attendanceData) {
    data.attendanceData?.forEach((emp) => {
      text += `${emp.name} (${emp.employeeId})\n`;
      text += `  Email: ${emp.email}\n`;
      text += `  Role: ${emp.role}\n`;
      text += `  Department: ${emp.department}\n`;
      text += `  Present Days: ${emp.presentDays}/${emp.totalDays}\n`;
      text += `  Clock Ins: ${emp.clockIns}, Clock Outs: ${emp.clockOuts}\n\n`;
    });
  }
  
  return text;
}

function generateWeeklyTimeTrackingText(data: ReportData): string {
  let text = `SUMMARY\n`;
  text += `Total Hours: ${data.totalHours}\n`;
  text += `Average Hours: ${data.averageHours}\n`;
  text += `Overtime Hours: ${data.overtimeHours}\n`;
  text += `Active Employees: ${data.activeEmployees}\n\n`;
  
  text += `EMPLOYEE HOURS\n`;
  text += '-'.repeat(40) + '\n';
  
  if (data.employeeHours) {
    Object.entries(data.employeeHours).forEach(([employeeId, hours]) => {
      text += `${employeeId}: ${hours} hours\n`;
    });
  }
  
  return text;
}

function generateEmployeeProductivityText(data: ReportData): string {
  let text = `SUMMARY\n`;
  text += `Total Employees: ${data.totalEmployees}\n`;
  text += `Active Employees: ${data.activeEmployees}\n`;
  text += `Average Productivity: ${data.averageProductivity}%\n\n`;
  
  text += `EMPLOYEE PRODUCTIVITY\n`;
  text += '-'.repeat(80) + '\n';
  
  if (data.employees) {
    data.employees?.forEach((emp) => {
      text += `${emp.name} (${emp.employeeId})\n`;
      text += `  Email: ${emp.email}\n`;
      text += `  Role: ${emp.role}\n`;
      text += `  Department: ${emp.department}\n`;
      text += `  Hours Worked: ${emp.hoursWorked}\n`;
      text += `  Productivity Score: ${emp.productivityScore}%\n`;
      text += `  Screen Captures: ${emp.screenCaptures}\n`;
      text += `  Status: ${emp.status}\n\n`;
    });
  }
  
  return text;
}

function generateMonthlySummaryText(data: ReportData): string {
  let text = `MONTHLY SUMMARY\n`;
  text += `Total Work Days: ${data.totalWorkDays}\n`;
  text += `Total Hours: ${data.totalHours}\n`;
  text += `Average Daily Hours: ${data.averageDailyHours}\n`;
  text += `Attendance Rate: ${data.attendanceRate}%\n`;
  text += `Active Employees: ${data.activeEmployees}\n`;
  text += `Total Employees: ${data.totalEmployees}\n`;
  
  return text;
}

function generateEmployeeActivityText(data: ReportData): string {
  let text = `SUMMARY\n`;
  text += `Total Employees: ${data.totalEmployees}\n`;
  text += `Active Employees: ${data.activeEmployees}\n\n`;
  
  text += `EMPLOYEE ACTIVITY\n`;
  text += '-'.repeat(80) + '\n';
  
  if (data.activities) {
    data.activities?.forEach((activity) => {
      const lastActivity = activity.lastActivity ? new Date(activity.lastActivity).toLocaleString() : 'N/A';
      text += `${activity.employeeName} (${activity.employeeId})\n`;
      text += `  Email: ${activity.email}\n`;
      text += `  Role: ${activity.role}\n`;
      text += `  Department: ${activity.department}\n`;
      text += `  Last Activity: ${lastActivity}\n`;
      text += `  Screen Captures: ${activity.screenCaptures}\n`;
      text += `  Time Entries: ${activity.timeEntries}\n`;
      text += `  Status: ${activity.status}\n\n`;
    });
  }
  
  return text;
}

function generateOvertimeAnalysisText(data: ReportData): string {
  let text = `SUMMARY\n`;
  text += `Total Overtime Hours: ${data.totalOvertimeHours}\n`;
  text += `Employees with Overtime: ${data.employeesWithOvertime}\n`;
  text += `Average Overtime: ${data.averageOvertime}\n\n`;
  
  text += `OVERTIME DETAILS\n`;
  text += '-'.repeat(80) + '\n';
  
  if (data.overtimeData) {
    data.overtimeData?.forEach((emp) => {
      text += `Employee ID: ${emp.employeeId}\n`;
      text += `  Total Hours: ${emp.totalHours}\n`;
      text += `  Standard Hours: ${emp.standardHours}\n`;
      text += `  Overtime Hours: ${emp.overtimeHours}\n`;
      text += `  Overtime Percentage: ${emp.overtimePercentage}%\n\n`;
    });
  }
  
  return text;
}
