import { NextRequest, NextResponse } from 'next/server';
import { getIdleSessions } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workSessionId = searchParams.get('workSessionId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!workSessionId) {
      return NextResponse.json(
        { error: 'Work Session ID is required' },
        { status: 400 }
      );
    }

    const startDateObj = startDate ? new Date(startDate) : undefined;
    const endDateObj = endDate ? new Date(endDate) : undefined;

    const idleSessions = await getIdleSessions(workSessionId, startDateObj, endDateObj);
    
    return NextResponse.json({
      success: true,
      data: idleSessions
    });
  } catch (error) {
    console.error('Error fetching idle sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch idle sessions' },
      { status: 500 }
    );
  }
}
