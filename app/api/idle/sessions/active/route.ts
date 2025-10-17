import { NextRequest, NextResponse } from 'next/server';
import { getActiveIdleSession } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workSessionId = searchParams.get('workSessionId');

    if (!workSessionId) {
      return NextResponse.json(
        { error: 'Work Session ID is required' },
        { status: 400 }
      );
    }

    const activeIdleSession = await getActiveIdleSession(workSessionId);
    
    return NextResponse.json({
      success: true,
      data: activeIdleSession
    });
  } catch (error) {
    console.error('Error fetching active idle session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active idle session' },
      { status: 500 }
    );
  }
}
