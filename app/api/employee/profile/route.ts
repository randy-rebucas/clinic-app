import { NextRequest, NextResponse } from 'next/server';
import { getEmployee, updateEmployee } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('id');

    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    const employee = await getEmployee(employeeId);
    
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...employeeData } = employee.toObject();
    
    return NextResponse.json({ employee: employeeData });
  } catch (error) {
    console.error('Error fetching employee profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, department, position, employeeId } = body;

    // Get employee ID from request body (passed from frontend)
    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check if employee exists
    const existingEmployee = await getEmployee(employeeId);
    if (!existingEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Check if email is already taken by another employee
    if (email !== existingEmployee.email) {
      const { getEmployeeByEmail } = await import('@/lib/database');
      const emailExists = await getEmployeeByEmail(email);
      if (emailExists && emailExists._id.toString() !== employeeId) {
        return NextResponse.json({ error: 'Email is already in use' }, { status: 400 });
      }
    }

    // Update employee data
    const updateData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      department: department?.trim() || undefined,
      position: position?.trim() || undefined,
    };

    await updateEmployee(employeeId, updateData);
    
    // Get updated employee data
    const updatedEmployee = await getEmployee(employeeId);
    if (!updatedEmployee) {
      return NextResponse.json({ error: 'Failed to retrieve updated employee data' }, { status: 500 });
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...employeeData } = updatedEmployee.toObject();
    
    return NextResponse.json({
      message: 'Profile updated successfully',
      employee: employeeData
    });
  } catch (error) {
    console.error('Error updating employee profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
