import { NextRequest, NextResponse } from 'next/server';
import { getEmployee, getEmployeeByEmail, createEmployee } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    if (id) {
      const employee = await getEmployee(id);
      return NextResponse.json(employee);
    } else if (email) {
      const employee = await getEmployeeByEmail(email);
      return NextResponse.json(employee);
    } else {
      return NextResponse.json({ error: 'Either id or email parameter is required' }, { status: 400 });
    }
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
