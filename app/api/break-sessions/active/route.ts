import { NextRequest, NextResponse } from 'next/server';
import { getActiveBreakSession, getActiveWorkSession } from '@/lib/database';

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

    // First get the active work session for the employee
    const activeWorkSession = await getActiveWorkSession(employeeId);
    
    if (!activeWorkSession) {
      // No active work session means no active break session
      return NextResponse.json({
        success: true,
        data: null
      });
    }

    // Then get the active break session for that work session
    const activeBreakSession = await getActiveBreakSession(activeWorkSession._id.toString());
    
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
