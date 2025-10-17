import { NextRequest, NextResponse } from 'next/server';
import { createEmployee } from '@/lib/database';
import { hashPassword, validatePassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, department, position } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: 'Password validation failed', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    const employeeId = await createEmployee({
      name,
      email,
      password: hashedPassword,
      role,
      department,
      position,
    } as Omit<import('@/lib/models/Employee').IEmployee, '_id' | 'createdAt' | 'updatedAt'>);

    return NextResponse.json({ 
      success: true, 
      employeeId,
      message: 'Employee created successfully' 
    });
  } catch (error) {
    console.error('Create employee error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
