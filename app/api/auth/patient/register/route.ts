import { NextRequest, NextResponse } from 'next/server';
import { createPatient } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

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

    // Validate required fields
    if (!firstName || !lastName || !dateOfBirth || !gender) {
      return NextResponse.json(
        { error: 'First name, last name, date of birth, and gender are required' },
        { status: 400 }
      );
    }

    // Generate unique patient ID
    const patientId = `PAT-${new Date().getFullYear()}-${uuidv4().substring(0, 9).toUpperCase()}`;

    // Create patient
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
      medicalHistory,
      allergies,
      medications,
      insurance,
    };

    const createdPatientId = await createPatient(patientData);

    return NextResponse.json({
      success: true,
      patientId: createdPatientId,
      message: 'Patient registered successfully'
    });
  } catch (error) {
    console.error('Patient registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
