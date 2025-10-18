import { NextRequest, NextResponse } from 'next/server';
import { getEmployee, updateEmployee } from '@/lib/database';
import { comparePassword, hashPassword, validatePassword } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword, employeeId } = body;

    // Get employee ID from request body (passed from frontend)
    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 });
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json({ 
        error: 'Password validation failed', 
        details: passwordValidation.errors 
      }, { status: 400 });
    }

    // Get employee
    const employee = await getEmployee(employeeId);
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, employee.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await updateEmployee(employeeId, { password: hashedNewPassword });

    return NextResponse.json({
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
