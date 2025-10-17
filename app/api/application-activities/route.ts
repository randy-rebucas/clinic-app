import { NextRequest, NextResponse } from 'next/server';
import { getApplicationActivities } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workSessionId = searchParams.get('workSessionId');

    if (!workSessionId) {
      return NextResponse.json(
        { error: 'workSessionId is required' },
        { status: 400 }
      );
    }

    const activities = await getApplicationActivities(workSessionId);
    
    return NextResponse.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching application activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application activities' },
      { status: 500 }
    );
  }
}
