import { NextRequest, NextResponse } from 'next/server';
import { createPatient, searchPatients, getAllPatients } from '@/lib/database';
// import { v4 as uuidv4 } from 'uuid'; // Unused for now

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (query) {
      const patients = await searchPatients(query);
      return NextResponse.json(patients);
    }

    // If no search query, return all patients
    const patients = await getAllPatients();
    return NextResponse.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      medicalHistory,
      allergies,
      medications,
      insurance
    } = body;

    // Validation
    if (!firstName || !lastName || !dateOfBirth || !gender) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate unique patient ID
    const patientId = `PAT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const patientData = {
      patientId,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      address,
      emergencyContact,
      medicalHistory: medicalHistory || [],
      allergies: allergies || [],
      medications: medications || [],
      insurance
    };

    const patientId_db = await createPatient(patientData);
    
    return NextResponse.json({ 
      success: true, 
      patientId: patientId_db,
      patientId_display: patientId,
      message: 'Patient created successfully' 
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 });
  }
}
