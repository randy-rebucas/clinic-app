import { NextRequest, NextResponse } from 'next/server';
import { createAppointment, getAppointmentsByDoctor } from '@/lib/database';
// import { v4 as uuidv4 } from 'uuid'; // Unused for now

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');

    if (doctorId) {
      const appointments = await getAppointmentsByDoctor(
        doctorId, 
        date ? new Date(date) : undefined
      );
      return NextResponse.json(appointments);
    }

    return NextResponse.json({ error: 'Doctor ID is required' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientId,
      doctorId,
      appointmentDate,
      startTime,
      endTime,
      type,
      reason,
      notes
    } = body;

    // Validation
    if (!patientId || !doctorId || !appointmentDate || !startTime || !endTime || !type || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate unique appointment ID
    const appointmentId = `APT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const appointmentData = {
      appointmentId,
      patientId,
      doctorId,
      appointmentDate: new Date(appointmentDate),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      type,
      reason,
      notes
    };

    const appointmentId_db = await createAppointment(appointmentData);
    
    return NextResponse.json({ 
      success: true, 
      appointmentId: appointmentId_db,
      appointmentId_display: appointmentId,
      message: 'Appointment created successfully' 
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
