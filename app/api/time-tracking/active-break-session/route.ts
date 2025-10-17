import { NextRequest, NextResponse } from 'next/server';
import { getActiveBreakSession } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workSessionId = searchParams.get('workSessionId');

    if (!workSessionId) {
      return NextResponse.json(
        { error: 'Work session ID is required' },
        { status: 400 }
      );
    }

    const breakSession = await getActiveBreakSession(workSessionId);

    if (!breakSession) {
      return NextResponse.json({ breakSession: null });
    }

    // Return break session data
    const breakSessionData = {
      id: breakSession._id.toString(),
      workSessionId: breakSession.workSessionId.toString(),
      startTime: breakSession.startTime,
      endTime: breakSession.endTime,
      duration: breakSession.duration,
      notes: breakSession.notes,
      status: breakSession.status
    };

    return NextResponse.json({ breakSession: breakSessionData });
  } catch (error) {
    console.error('Get active break session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
