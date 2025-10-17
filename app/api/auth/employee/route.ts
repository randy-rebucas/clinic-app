import { NextRequest, NextResponse } from 'next/server';
import { getEmployee } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('id');

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const employee = await getEmployee(employeeId);

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Return employee data (without sensitive information)
    const employeeData = {
      id: employee._id.toString(),
      email: employee.email,
      name: employee.name,
      role: employee.role,
      department: employee.department,
      position: employee.position,
    };

    return NextResponse.json({ employee: employeeData });
  } catch (error) {
    console.error('Get employee error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
