import { NextRequest, NextResponse } from 'next/server';
import { getEmployee, getEmployeeByEmail, createEmployee } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    let employee;
    if (id) {
      employee = await getEmployee(id);
    } else if (email) {
      employee = await getEmployeeByEmail(email);
    } else {
      return NextResponse.json({ error: 'Either id or email parameter is required' }, { status: 400 });
    }

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Transform _id to id for frontend compatibility
    const { _id, ...employeeData } = employee.toObject();
    const transformedEmployee = {
      ...employeeData,
      id: _id.toString()
    };

    return NextResponse.json(transformedEmployee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json({ error: 'Failed to fetch employee' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role, department, position } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const employeeData = {
      name,
      email,
      password,
      role,
      department,
      position,
    };

    const employeeId = await createEmployee(employeeData);
    return NextResponse.json({ id: employeeId, ...employeeData });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}
