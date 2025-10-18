import { NextRequest, NextResponse } from 'next/server';
import { getEmployee } from '@/lib/database';
import { NotificationSettings } from '@/lib/models';

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

    // Get notification settings
    const settings = await NotificationSettings.findOne({ employeeId });
    
    if (!settings) {
      // Return default settings if none exist
      const defaultSettings = {
        employeeId,
        clockInReminder: true,
        clockOutReminder: true,
        breakReminder: true,
        overtimeAlert: true,
        reminderTime: 15,
        breakReminderTime: 30
      };
      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      employeeId,
      clockInReminder,
      clockOutReminder,
      breakReminder,
      overtimeAlert,
      reminderTime,
      breakReminderTime
    } = body;

    // Get employee ID from request body (passed from frontend)
    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    // Check if employee exists
    const employee = await getEmployee(employeeId);
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Validate input
    if (typeof clockInReminder !== 'boolean' || 
        typeof clockOutReminder !== 'boolean' || 
        typeof breakReminder !== 'boolean' || 
        typeof overtimeAlert !== 'boolean') {
      return NextResponse.json({ error: 'Invalid notification settings format' }, { status: 400 });
    }

    if (typeof reminderTime !== 'number' || typeof breakReminderTime !== 'number') {
      return NextResponse.json({ error: 'Reminder times must be numbers' }, { status: 400 });
    }

    if (reminderTime < 0 || reminderTime > 120 || breakReminderTime < 0 || breakReminderTime > 120) {
      return NextResponse.json({ error: 'Reminder times must be between 0 and 120 minutes' }, { status: 400 });
    }

    // Update or create notification settings
    const settings = await NotificationSettings.findOneAndUpdate(
      { employeeId: employeeId },
      {
        employeeId: employeeId,
        clockInReminder,
        clockOutReminder,
        breakReminder,
        overtimeAlert,
        reminderTime,
        breakReminderTime
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      message: 'Notification settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
