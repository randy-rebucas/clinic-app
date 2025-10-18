import { NextRequest, NextResponse } from 'next/server';
import { getEmployee, updateEmployee } from '@/lib/database';
import { generateEmployeeId, generateSimpleEmployeeId } from '@/lib/employeeIdGenerator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, department } = body;

    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    // Check if employee exists
    const employee = await getEmployee(employeeId);
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Check if employee already has an employee ID
    if (employee.employeeId) {
      return NextResponse.json({ 
        error: 'Employee already has a digital ID',
        existingEmployeeId: employee.employeeId
      }, { status: 400 });
    }

    // Generate new employee ID
    let newEmployeeId: string;
    try {
      if (department) {
        newEmployeeId = await generateEmployeeId(department);
      } else {
        newEmployeeId = await generateSimpleEmployeeId();
      }
    } catch (error) {
      console.error('Error generating employee ID:', error);
      return NextResponse.json({ 
        error: 'Failed to generate employee ID. Please try again.' 
      }, { status: 500 });
    }

    // Update employee with new ID
    await updateEmployee(employeeId, { employeeId: newEmployeeId });

    return NextResponse.json({
      message: 'Employee ID generated successfully',
      employeeId: newEmployeeId
    });
  } catch (error) {
    console.error('Error generating employee ID:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    // Check if employee exists
    const employee = await getEmployee(employeeId);
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({
      employeeId: employee.employeeId || null,
      hasEmployeeId: !!employee.employeeId
    });
  } catch (error) {
    console.error('Error checking employee ID:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
