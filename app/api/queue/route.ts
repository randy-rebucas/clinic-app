import { NextRequest, NextResponse } from 'next/server';
import { 
  addToQueue, 
  getQueue, 
  getQueueByDoctor, 
  getQueueByPatient, 
  getQueueStats,
  updateQueueStatus,
  assignDoctorToQueue
} from '@/lib/database';
// import { v4 as uuidv4 } from 'uuid'; // Unused for now

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const doctorId = searchParams.get('doctorId');
    const patientId = searchParams.get('patientId');
    const stats = searchParams.get('stats');

    if (stats === 'true') {
      const queueStats = await getQueueStats();
      return NextResponse.json(queueStats);
    }

    if (doctorId) {
      const queue = await getQueueByDoctor(doctorId, status || undefined);
      return NextResponse.json(queue);
    }

    if (patientId) {
      const queue = await getQueueByPatient(patientId);
      return NextResponse.json(queue);
    }

    const queue = await getQueue(status || undefined);
    return NextResponse.json(queue);
  } catch (error) {
    console.error('Error fetching queue:', error);
    return NextResponse.json({ error: 'Failed to fetch queue' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientId,
      appointmentId,
      priority = 'normal',
      type,
      reason,
      assignedDoctorId,
      estimatedWaitTime
    } = body;

    // Validation
    if (!patientId || !type || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate unique queue ID
    const queueId = `QUE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const queueData = {
      queueId,
      patientId,
      appointmentId,
      priority,
      type,
      reason,
      assignedDoctorId,
      estimatedWaitTime
    };

    const queueId_db = await addToQueue(queueData);
    
    return NextResponse.json({ 
      success: true, 
      queueId: queueId_db,
      queueId_display: queueId,
      message: 'Patient added to queue successfully' 
    });
  } catch (error) {
    console.error('Error adding to queue:', error);
    return NextResponse.json({ error: 'Failed to add patient to queue' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { queueId, status, assignedDoctorId, notes } = body;

    if (!queueId || !status) {
      return NextResponse.json({ error: 'Queue ID and status are required' }, { status: 400 });
    }

    const updatedQueue = await updateQueueStatus(queueId, status, assignedDoctorId, notes);

    if (!updatedQueue) {
      return NextResponse.json({ error: 'Queue item not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      queue: updatedQueue,
      message: 'Queue status updated successfully' 
    });
  } catch (error) {
    console.error('Error updating queue status:', error);
    return NextResponse.json({ error: 'Failed to update queue status' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { queueId, doctorId } = body;

    if (!queueId || !doctorId) {
      return NextResponse.json({ error: 'Queue ID and doctor ID are required' }, { status: 400 });
    }

    const updatedQueue = await assignDoctorToQueue(queueId, doctorId);

    if (!updatedQueue) {
      return NextResponse.json({ error: 'Queue item not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      queue: updatedQueue,
      message: 'Doctor assigned successfully' 
    });
  } catch (error) {
    console.error('Error assigning doctor:', error);
    return NextResponse.json({ error: 'Failed to assign doctor' }, { status: 500 });
  }
}
