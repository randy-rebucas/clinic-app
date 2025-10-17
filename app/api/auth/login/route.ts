import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeByEmail } from '@/lib/database';
import { comparePassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const employee = await getEmployeeByEmail(email);

    if (!employee) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, employee.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
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
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
