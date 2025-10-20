import { NextRequest, NextResponse } from 'next/server';
import { createPatient } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';
import { validatePatientForm, sanitizeInput } from '@/lib/validation/patientValidation';
import { rateLimit } from '@/lib/rateLimiter';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 requests per minute
    const rateLimitCheck = rateLimit({ windowMs: 60000, maxRequests: 5 })(request);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many requests', 
          message: 'Please wait before trying again',
          resetTime: rateLimitCheck.resetTime
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitCheck.resetTime.toString()
          }
        }
      );
    }

    const body = await request.json();
    
    // Sanitize all string inputs
    const sanitizedBody = {
      firstName: sanitizeInput(body.firstName || ''),
      lastName: sanitizeInput(body.lastName || ''),
      email: body.email ? sanitizeInput(body.email) : undefined,
      phone: body.phone ? sanitizeInput(body.phone) : undefined,
      dateOfBirth: body.dateOfBirth,
      gender: body.gender,
      address: body.address ? {
        street: body.address.street ? sanitizeInput(body.address.street) : undefined,
        city: body.address.city ? sanitizeInput(body.address.city) : undefined,
        state: body.address.state ? sanitizeInput(body.address.state) : undefined,
        zipCode: body.address.zipCode ? sanitizeInput(body.address.zipCode) : undefined,
        country: body.address.country ? sanitizeInput(body.address.country) : undefined,
      } : undefined,
      emergencyContact: body.emergencyContact ? {
        name: body.emergencyContact.name ? sanitizeInput(body.emergencyContact.name) : undefined,
        relationship: body.emergencyContact.relationship ? sanitizeInput(body.emergencyContact.relationship) : undefined,
        phone: body.emergencyContact.phone ? sanitizeInput(body.emergencyContact.phone) : undefined,
      } : undefined,
      medicalHistory: body.medicalHistory,
      allergies: body.allergies,
      medications: body.medications,
      insurance: body.insurance ? {
        provider: body.insurance.provider ? sanitizeInput(body.insurance.provider) : undefined,
        policyNumber: body.insurance.policyNumber ? sanitizeInput(body.insurance.policyNumber) : undefined,
        groupNumber: body.insurance.groupNumber ? sanitizeInput(body.insurance.groupNumber) : undefined,
      } : undefined,
    };

    // Convert to form data format for validation
    const formData = {
      firstName: sanitizedBody.firstName,
      lastName: sanitizedBody.lastName,
      email: sanitizedBody.email || '',
      phone: sanitizedBody.phone || '',
      dateOfBirth: sanitizedBody.dateOfBirth || '',
      gender: sanitizedBody.gender || '',
      street: sanitizedBody.address?.street || '',
      city: sanitizedBody.address?.city || '',
      state: sanitizedBody.address?.state || '',
      zipCode: sanitizedBody.address?.zipCode || '',
      country: sanitizedBody.address?.country || 'PH',
      emergencyContactName: sanitizedBody.emergencyContact?.name || '',
      emergencyContactRelationship: sanitizedBody.emergencyContact?.relationship || '',
      emergencyContactPhone: sanitizedBody.emergencyContact?.phone || '',
      medicalHistory: sanitizedBody.medicalHistory?.join(', ') || '',
      allergies: sanitizedBody.allergies?.join(', ') || '',
      medications: sanitizedBody.medications?.join(', ') || '',
      insuranceProvider: sanitizedBody.insurance?.provider || '',
      insurancePolicyNumber: sanitizedBody.insurance?.policyNumber || '',
      insuranceGroupNumber: sanitizedBody.insurance?.groupNumber || '',
    };

    // Validate form data
    const validationErrors = validatePatientForm(formData);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationErrors,
          message: 'Please correct the following errors and try again'
        },
        { status: 400 }
      );
    }

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
    } = sanitizedBody;

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
    }, {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': rateLimitCheck.remaining.toString(),
        'X-RateLimit-Reset': rateLimitCheck.resetTime.toString()
      }
    });
  } catch (error) {
    console.error('Patient registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
