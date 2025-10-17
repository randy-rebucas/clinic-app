import { NextRequest, NextResponse } from 'next/server';
import { getWebsiteActivities } from '@/lib/database';

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

    const activities = await getWebsiteActivities(workSessionId);
    
    return NextResponse.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching website activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch website activities' },
      { status: 500 }
    );
  }
}
