import { NextRequest, NextResponse } from 'next/server';
import { getAllEmployees, getTimeEntries } from '@/lib/database';
import { apiRateLimiter } from '@/lib/rateLimiter';

interface RecentActivity {
  id: string;
  type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end';
  employeeName: string;
  employeeId: string;
  timestamp: Date;
  description: string;
  icon: string;
  color: string;
}

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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get all employees
    const { employees } = await getAllEmployees(0, 1000);

    // Get recent time entries from the last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const now = new Date();

    const allRecentActivities: RecentActivity[] = [];

    // Get time entries for each employee from the last 24 hours
    for (const employee of employees) {
      const { timeEntries } = await getTimeEntries(
        employee._id.toString(),
        last24Hours,
        now,
        0,
        50 // Limit per employee to avoid too much data
      );

      // Convert time entries to activity items
      for (const entry of timeEntries) {
        const activity = createActivityFromTimeEntry(entry, employee.name, employee._id.toString());
        if (activity) {
          allRecentActivities.push(activity);
        }
      }
    }

    // Sort by timestamp (most recent first) and limit results
    const recentActivities = allRecentActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      data: recentActivities
    }, {
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString()
      }
    });

  } catch (error) {
    console.error('Error fetching recent activity:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    return NextResponse.json(
      { error: 'Failed to fetch recent activity' },
      { status: 500 }
    );
  }
}

interface TimeEntry {
  _id: { toString(): string };
  timestamp: string | Date;
  type: string;
}

function createActivityFromTimeEntry(
  entry: TimeEntry, 
  employeeName: string, 
  employeeId: string
): RecentActivity | null {
  const timestamp = new Date(entry.timestamp);

  switch (entry.type) {
    case 'clock_in':
      return {
        id: entry._id.toString(),
        type: 'clock_in',
        employeeName,
        employeeId,
        timestamp,
        description: `${employeeName} clocked in`,
        icon: 'CheckCircle',
        color: 'text-green-500'
      };

    case 'clock_out':
      return {
        id: entry._id.toString(),
        type: 'clock_out',
        employeeName,
        employeeId,
        timestamp,
        description: `${employeeName} clocked out`,
        icon: 'XCircle',
        color: 'text-red-500'
      };

    case 'break_start':
      return {
        id: entry._id.toString(),
        type: 'break_start',
        employeeName,
        employeeId,
        timestamp,
        description: `${employeeName} started a break`,
        icon: 'Clock',
        color: 'text-yellow-500'
      };

    case 'break_end':
      return {
        id: entry._id.toString(),
        type: 'break_end',
        employeeName,
        employeeId,
        timestamp,
        description: `${employeeName} ended break`,
        icon: 'CheckCircle',
        color: 'text-green-500'
      };


    default:
      return null;
  }
}

// function getTimeAgo(date: Date): string {
//   const now = new Date();
//   const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

//   if (diffInSeconds < 60) {
//     return `${diffInSeconds}s ago`;
//   } else if (diffInSeconds < 3600) {
//     const minutes = Math.floor(diffInSeconds / 60);
//     return `${minutes}m ago`;
//   } else if (diffInSeconds < 86400) {
//     const hours = Math.floor(diffInSeconds / 3600);
//     return `${hours}h ago`;
//   } else {
//     const days = Math.floor(diffInSeconds / 86400);
//     return `${days}d ago`;
//   }
// }
