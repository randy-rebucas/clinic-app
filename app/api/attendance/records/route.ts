import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    // Connect to database
    await connectDB();
    
    // Clear cached model to avoid schema issues
    if (mongoose.models.AttendanceRecord) {
      delete mongoose.models.AttendanceRecord;
    }
    if (mongoose.modelSchemas && mongoose.modelSchemas.AttendanceRecord) {
      delete mongoose.modelSchemas.AttendanceRecord;
    }
    
    // Define AttendanceRecord schema
    const AttendanceRecordSchema = new mongoose.Schema({
      employeeId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Employee' },
      date: { type: Date, required: true },
      punchInTime: { type: Date },
      punchOutTime: { type: Date },
      totalWorkingHours: { type: Number, default: 0 },
      totalBreakTime: { type: Number, default: 0 },
      status: { type: String, enum: ['present', 'absent', 'late', 'half-day'], default: 'absent' },
      notes: { type: String },
      isActive: { type: Boolean, default: true }
    }, { timestamps: true });

    const AttendanceRecord = mongoose.model('AttendanceRecord', AttendanceRecordSchema);
    
    // Build query
    const query: any = {
      employeeId: new mongoose.Types.ObjectId(employeeId)
    };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const records = await AttendanceRecord.find(query).sort({ date: 1 });
    
    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance records' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, date, punchInTime, punchOutTime, totalWorkingHours, totalBreakTime, status, notes } = body;

    if (!employeeId || !date) {
      return NextResponse.json({ error: 'Employee ID and date are required' }, { status: 400 });
    }

    // Connect to database
    await connectDB();
    
    // Clear cached model to avoid schema issues
    if (mongoose.models.AttendanceRecord) {
      delete mongoose.models.AttendanceRecord;
    }
    if (mongoose.modelSchemas && mongoose.modelSchemas.AttendanceRecord) {
      delete mongoose.modelSchemas.AttendanceRecord;
    }
    
    // Define AttendanceRecord schema
    const AttendanceRecordSchema = new mongoose.Schema({
      employeeId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Employee' },
      date: { type: Date, required: true },
      punchInTime: { type: Date },
      punchOutTime: { type: Date },
      totalWorkingHours: { type: Number, default: 0 },
      totalBreakTime: { type: Number, default: 0 },
      status: { type: String, enum: ['present', 'absent', 'late', 'half-day'], default: 'absent' },
      notes: { type: String },
      isActive: { type: Boolean, default: true }
    }, { timestamps: true });

    const AttendanceRecord = mongoose.model('AttendanceRecord', AttendanceRecordSchema);
    
    const attendanceRecord = new AttendanceRecord({
      employeeId: new mongoose.Types.ObjectId(employeeId),
      date: new Date(date),
      punchInTime: punchInTime ? new Date(punchInTime) : undefined,
      punchOutTime: punchOutTime ? new Date(punchOutTime) : undefined,
      totalWorkingHours: totalWorkingHours || 0,
      totalBreakTime: totalBreakTime || 0,
      status: status || 'absent',
      notes: notes || '',
      isActive: true
    });

    const savedRecord = await attendanceRecord.save();
    
    return NextResponse.json({
      id: savedRecord._id.toString(),
      ...savedRecord.toObject()
    });
  } catch (error) {
    console.error('Error creating attendance record:', error);
    return NextResponse.json({ error: 'Failed to create attendance record' }, { status: 500 });
  }
}