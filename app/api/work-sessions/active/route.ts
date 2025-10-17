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

    const activeWorkSession = await getActiveWorkSession(employeeId);
    
    return NextResponse.json({
      success: true,
      data: activeWorkSession
    });
  } catch (error) {
    console.error('Error fetching active work session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active work session' },
      { status: 500 }
    );
  }
}
