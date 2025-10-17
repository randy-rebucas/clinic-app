import { NextRequest, NextResponse } from 'next/server';
import { getActiveBreakSession } from '@/lib/database';

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

    const activeBreakSession = await getActiveBreakSession(employeeId);
    
    return NextResponse.json({
      success: true,
      data: activeBreakSession
    });
  } catch (error) {
    console.error('Error fetching active break session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active break session' },
      { status: 500 }
    );
  }
}
