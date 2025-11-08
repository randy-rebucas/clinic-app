import { NextRequest, NextResponse } from 'next/server';
import { 
  createLabOrder, 
  getLabOrder, 
  getLabOrdersByPatient, 
  getLabOrdersByStatus, 
  getLabOrdersByDoctor,
  getLabOrdersRequiringFollowUp,
  getAllLabOrders
} from '@/lib/database';
// import { v4 as uuidv4 } from 'uuid'; // Unused for now

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const labOrderId = searchParams.get('id');
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');
    const doctorId = searchParams.get('doctorId');
    const followUp = searchParams.get('followUp');

    if (labOrderId) {
      const labOrder = await getLabOrder(labOrderId);
      if (!labOrder) {
        return NextResponse.json({ error: 'Lab order not found' }, { status: 404 });
      }
      return NextResponse.json(labOrder);
    }

    if (patientId) {
      const labOrders = await getLabOrdersByPatient(patientId);
      return NextResponse.json(labOrders);
    }

    if (status) {
      const labOrders = await getLabOrdersByStatus(status);
      return NextResponse.json(labOrders);
    }

    if (doctorId) {
      const labOrders = await getLabOrdersByDoctor(doctorId);
      return NextResponse.json(labOrders);
    }

    if (followUp === 'true') {
      const labOrders = await getLabOrdersRequiringFollowUp();
      return NextResponse.json(labOrders);
    }

    // If no specific filter is provided, return all lab orders
    const labOrders = await getAllLabOrders();
    return NextResponse.json(labOrders);
  } catch (error) {
    console.error('Error fetching lab orders:', error);
    return NextResponse.json({ error: 'Failed to fetch lab orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientId,
      doctorId,
      appointmentId,
      tests,
      notes
    } = body;

    // Validation
    if (!patientId || !doctorId || !tests || !Array.isArray(tests) || tests.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate unique lab order ID
    const labOrderId = `LAB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const labOrderData = {
      labOrderId,
      patientId,
      doctorId,
      appointmentId,
      tests,
      notes
    };

    const labOrderId_db = await createLabOrder(labOrderData);
    
    return NextResponse.json({ 
      success: true, 
      labOrderId: labOrderId_db,
      labOrderId_display: labOrderId,
      message: 'Lab order created successfully' 
    });
  } catch (error) {
    console.error('Error creating lab order:', error);
    return NextResponse.json({ error: 'Failed to create lab order' }, { status: 500 });
  }
}
