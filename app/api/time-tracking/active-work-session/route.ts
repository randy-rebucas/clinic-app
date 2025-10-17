import { NextRequest, NextResponse } from 'next/server';
import { getActiveWorkSession } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const workSession = await getActiveWorkSession(employeeId);

    if (!workSession) {
      return NextResponse.json({ workSession: null });
    }

    // Return work session data
    const workSessionData = {
      id: workSession._id.toString(),
      employeeId: workSession.employeeId.toString(),
      clockInTime: workSession.clockInTime,
      totalBreakTime: workSession.totalBreakTime,
      totalWorkTime: workSession.totalWorkTime,
      status: workSession.status,
      createdAt: workSession.createdAt,
      updatedAt: workSession.updatedAt
    };

    return NextResponse.json({ workSession: workSessionData });
  } catch (error) {
    console.error('Get active work session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
