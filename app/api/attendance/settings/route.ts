import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    // Connect to database
    await connectDB();
    
    // Clear cached model to avoid schema issues
    if (mongoose.models.AttendanceSettings) {
      delete mongoose.models.AttendanceSettings;
    }
    if (mongoose.modelSchemas && mongoose.modelSchemas.AttendanceSettings) {
      delete mongoose.modelSchemas.AttendanceSettings;
    }
    
    // Define AttendanceSettings schema
    const AttendanceSettingsSchema = new mongoose.Schema({
      employeeId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Employee' },
      workHoursPerDay: { type: Number, default: 8 },
      breakTimePerDay: { type: Number, default: 1 },
      overtimeThreshold: { type: Number, default: 8 },
      lateThreshold: { type: Number, default: 15 }, // minutes
      autoClockOut: { type: Boolean, default: false },
      autoClockOutTime: { type: String, default: '18:00' },
      workingDays: { type: [String], default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] },
      timezone: { type: String, default: 'UTC' }
    }, { timestamps: true });

    const AttendanceSettings = mongoose.model('AttendanceSettings', AttendanceSettingsSchema);
    
    const settings = await AttendanceSettings.findOne({
      employeeId: new mongoose.Types.ObjectId(employeeId)
    });
    
    if (!settings) {
      // Create default settings if none found
      const defaultSettings = new AttendanceSettings({
        employeeId: new mongoose.Types.ObjectId(employeeId),
        workHoursPerDay: 8,
        breakTimePerDay: 1,
        overtimeThreshold: 8,
        lateThreshold: 15,
        autoClockOut: false,
        autoClockOutTime: '18:00',
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timezone: 'UTC'
      });
      
      const savedSettings = await defaultSettings.save();
      return NextResponse.json(savedSettings);
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching attendance settings:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, workHoursPerDay, breakTimePerDay, overtimeThreshold, lateThreshold, autoClockOut, autoClockOutTime, workingDays, timezone } = body;

    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    // Connect to database
    await connectDB();
    
    // Clear cached model to avoid schema issues
    if (mongoose.models.AttendanceSettings) {
      delete mongoose.models.AttendanceSettings;
    }
    if (mongoose.modelSchemas && mongoose.modelSchemas.AttendanceSettings) {
      delete mongoose.modelSchemas.AttendanceSettings;
    }
    
    // Define AttendanceSettings schema
    const AttendanceSettingsSchema = new mongoose.Schema({
      employeeId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Employee' },
      workHoursPerDay: { type: Number, default: 8 },
      breakTimePerDay: { type: Number, default: 1 },
      overtimeThreshold: { type: Number, default: 8 },
      lateThreshold: { type: Number, default: 15 },
      autoClockOut: { type: Boolean, default: false },
      autoClockOutTime: { type: String, default: '18:00' },
      workingDays: { type: [String], default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] },
      timezone: { type: String, default: 'UTC' }
    }, { timestamps: true });

    const AttendanceSettings = mongoose.model('AttendanceSettings', AttendanceSettingsSchema);
    
    const settings = await AttendanceSettings.findOneAndUpdate(
      { employeeId: new mongoose.Types.ObjectId(employeeId) },
      {
        employeeId: new mongoose.Types.ObjectId(employeeId),
        workHoursPerDay: workHoursPerDay || 8,
        breakTimePerDay: breakTimePerDay || 1,
        overtimeThreshold: overtimeThreshold || 8,
        lateThreshold: lateThreshold || 15,
        autoClockOut: autoClockOut || false,
        autoClockOutTime: autoClockOutTime || '18:00',
        workingDays: workingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timezone: timezone || 'UTC'
      },
      { new: true, upsert: true }
    );
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating attendance settings:', error);
    return NextResponse.json({ error: 'Failed to update attendance settings' }, { status: 500 });
  }
}