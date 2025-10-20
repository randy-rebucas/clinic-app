import { NextRequest, NextResponse } from 'next/server';
import { createPrescription, getPrescription } from '@/lib/database';
// import { v4 as uuidv4 } from 'uuid'; // Unused for now

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prescriptionId = searchParams.get('id');

    if (prescriptionId) {
      const prescription = await getPrescription(prescriptionId);
      if (!prescription) {
        return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
      }
      return NextResponse.json(prescription);
    }

    return NextResponse.json({ error: 'Prescription ID is required' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching prescription:', error);
    return NextResponse.json({ error: 'Failed to fetch prescription' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientId,
      doctorId,
      appointmentId,
      medications,
      diagnosis,
      notes,
      validUntil
    } = body;

    // Validation
    if (!patientId || !doctorId || !medications || !Array.isArray(medications) || medications.length === 0 || !diagnosis) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate unique prescription ID
    const prescriptionId = `RX-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const prescriptionData = {
      prescriptionId,
      patientId,
      doctorId,
      appointmentId,
      medications,
      diagnosis,
      notes,
      validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
    };

    const prescriptionId_db = await createPrescription(prescriptionData);
    
    return NextResponse.json({ 
      success: true, 
      prescriptionId: prescriptionId_db,
      prescriptionId_display: prescriptionId,
      message: 'Prescription created successfully' 
    });
  } catch (error) {
    console.error('Error creating prescription:', error);
    return NextResponse.json({ error: 'Failed to create prescription' }, { status: 500 });
  }
}
