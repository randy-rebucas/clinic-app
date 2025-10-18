import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Employee } from '@/lib/models/Employee';
import { apiRateLimiter } from '@/lib/rateLimiter';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = apiRateLimiter(request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429 }
      );
    }

    const { employeeId, newPassword } = await request.json();

    if (!employeeId || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Employee ID and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the employee
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const employee = await (Employee as any).findOne({ _id: employeeId });
    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the employee's password
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (Employee as any).updateOne(
      { _id: employeeId },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update password' },
      { status: 500 }
    );
  }
}