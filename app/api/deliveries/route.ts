import { NextRequest, NextResponse } from 'next/server';
import { getDeliveries, createDelivery } from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { getPrescription } from '@/lib/database';
import { getPatient } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Only allow medrep and admin to access deliveries
    if (decoded.type !== 'staff' || (decoded.role !== 'medrep' && decoded.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const medRepId = searchParams.get('medRepId');
    const status = searchParams.get('status');

    const filters: {
      medRepId?: string;
      status?: string;
      patientId?: string;
    } = {};
    
    if (medRepId) {
      filters.medRepId = medRepId;
    }
    
    if (status) {
      filters.status = status;
    }

    // If user is medrep, only show their deliveries
    if (decoded.role === 'medrep') {
      filters.medRepId = decoded.userId;
    }

    const deliveries = await getDeliveries(filters);

    return NextResponse.json(deliveries);

  } catch (error) {
    console.error('Error fetching deliveries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Only allow admin and receptionist to create deliveries
    if (decoded.type !== 'staff' || (decoded.role !== 'admin' && decoded.role !== 'receptionist')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { prescriptionId, medRepId, scheduledTime, deliveryAddress, notes } = body;

    if (!prescriptionId || !medRepId || !scheduledTime || !deliveryAddress) {
      return NextResponse.json({ 
        error: 'Missing required fields: prescriptionId, medRepId, scheduledTime, deliveryAddress' 
      }, { status: 400 });
    }

    // Get prescription details
    const prescription = await getPrescription(prescriptionId);
    if (!prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
    }

    // Get patient details
    const patient = await getPatient(prescription.patientId);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Create delivery
    const deliveryId = await createDelivery({
      prescriptionId,
      patientId: patient._id.toString(),
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientPhone: patient.phone,
      deliveryAddress,
      scheduledTime: new Date(scheduledTime),
      medRepId,
      notes: notes || ''
    });

    return NextResponse.json({ 
      success: true, 
      deliveryId,
      message: 'Delivery created successfully'
    });

  } catch (error) {
    console.error('Error creating delivery:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
