import { NextRequest, NextResponse } from 'next/server';
import { getActiveBreakSession } from '@/lib/database';

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

    const activeBreak = await getActiveBreakSession(workSessionId);
    
    return NextResponse.json({
      success: true,
      data: activeBreak
    });
  } catch (error) {
    console.error('Error fetching active break session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active break session' },
      { status: 500 }
    );
  }
}