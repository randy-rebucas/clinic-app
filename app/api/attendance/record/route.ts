import { NextRequest, NextResponse } from 'next/server';
import { getAttendanceRecord } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const date = searchParams.get('date');

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    const attendanceRecord = await getAttendanceRecord(employeeId, new Date(date));
    
    return NextResponse.json({
      success: true,
      data: attendanceRecord
    });
  } catch (error) {
    console.error('Error fetching attendance record:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance record' },
      { status: 500 }
    );
  }
}
