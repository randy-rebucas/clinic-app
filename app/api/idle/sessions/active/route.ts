import { NextRequest, NextResponse } from 'next/server';
import { getActiveIdleSession } from '@/lib/database';

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

    const activeIdleSession = await getActiveIdleSession(employeeId);
    
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
