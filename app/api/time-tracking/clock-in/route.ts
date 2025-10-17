import { NextRequest, NextResponse } from 'next/server';
import { TimeTrackingService } from '@/lib/timeTracking';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, notes, location } = body;

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const result = await TimeTrackingService.clockIn({
      employeeId,
      notes,
      location,
    });

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in clock-in API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to clock in' },
      { status: 500 }
    );
  }
}
