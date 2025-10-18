import { NextRequest, NextResponse } from 'next/server';
import { getAllEmployees, getTimeEntries } from '@/lib/database';
import { apiRateLimiter } from '@/lib/rateLimiter';

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimit = apiRateLimiter(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        }, 
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString()
          }
        }
      );
    }

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Get all employees
    const { employees, total: totalEmployees } = await getAllEmployees(0, 1000);

    // Calculate active employees today (those with time entries today)
    const activeEmployeeIds = new Set<string>();
    let totalWorkHours = 0;
    let totalTimeEntries = 0;

    // Get time entries for today for all employees
    for (const employee of employees) {
      const { timeEntries } = await getTimeEntries(
        employee._id.toString(),
        startOfDay,
        endOfDay,
        0,
        1000
      );

      if (timeEntries.length > 0) {
        activeEmployeeIds.add(employee._id.toString());
        totalTimeEntries += timeEntries.length;

        // Calculate work hours for this employee today
        let employeeWorkHours = 0;
        let clockInTime: Date | null = null;

        for (const entry of timeEntries) {
          if (entry.type === 'clock_in') {
            clockInTime = new Date(entry.timestamp);
          } else if (entry.type === 'clock_out' && clockInTime) {
            const workDuration = new Date(entry.timestamp).getTime() - clockInTime.getTime();
            employeeWorkHours += workDuration / (1000 * 60 * 60); // Convert to hours
            clockInTime = null;
          }
        }

        totalWorkHours += employeeWorkHours;
      }
    }

    const activeEmployees = activeEmployeeIds.size;
    const averageWorkHours = activeEmployees > 0 ? totalWorkHours / activeEmployees : 0;

    const stats = {
      totalEmployees,
      activeEmployees,
      totalWorkHours: Math.round(totalWorkHours * 100) / 100, // Round to 2 decimal places
      averageWorkHours: Math.round(averageWorkHours * 100) / 100,
      totalTimeEntries,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: stats
    }, {
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString()
      }
    });

  } catch (error) {
    console.error('Error fetching admin stats:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}
