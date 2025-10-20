import { NextRequest, NextResponse } from 'next/server';
import { getPatient, getPatientByPatientId } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Try to get by MongoDB ID first, then by patientId
    let patient = await getPatient(id);
    if (!patient) {
      patient = await getPatientByPatientId(id);
    }

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Transform _id to id for frontend compatibility
    const { _id, ...patientData } = patient.toObject();
    const transformedPatient = {
      ...patientData,
      id: _id.toString()
    };

    return NextResponse.json(transformedPatient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json({ error: 'Failed to fetch patient' }, { status: 500 });
  }
}
