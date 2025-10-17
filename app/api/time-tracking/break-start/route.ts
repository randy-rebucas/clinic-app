import { NextRequest, NextResponse } from 'next/server';
import { TimeTrackingService } from '@/lib/timeTracking';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workSessionId, notes } = body;

    if (!workSessionId) {
      return NextResponse.json(
        { error: 'Work Session ID is required' },
        { status: 400 }
      );
    }

    const result = await TimeTrackingService.startBreak({
      workSessionId,
      notes,
    });

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in break-start API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start break' },
      { status: 500 }
    );
  }
}
