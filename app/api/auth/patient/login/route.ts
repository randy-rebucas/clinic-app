import { NextRequest, NextResponse } from 'next/server';
import { getPatientByPatientId } from '@/lib/database';
import { authRateLimiter } from '@/lib/rateLimiter';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  let patientId = 'unknown';
  
  try {
    // Apply rate limiting
    const rateLimit = authRateLimiter(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many login attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        }, 
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString()
          }
        }
      );
    }

    const body = await request.json();
    const { patientId: requestPatientId, password } = body;
    patientId = requestPatientId;

    // Input validation
    if (!patientId || !password) {
      return NextResponse.json({ error: 'Patient ID and password are required' }, { status: 400 });
    }

    if (typeof patientId !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Invalid input format' }, { status: 400 });
    }

    // Basic patient ID validation
    const patientIdRegex = /^PAT-\d{4}-[A-Z0-9]{9}$/;
    if (!patientIdRegex.test(patientId)) {
      return NextResponse.json({ error: 'Invalid patient ID format' }, { status: 400 });
    }

    // Get patient by patient ID
    const patient = await getPatientByPatientId(patientId);
    
    if (!patient) {
      return NextResponse.json({ error: 'Invalid patient ID or password' }, { status: 401 });
    }

    // For demo purposes, use patient ID as password
    // In a real system, you would have a separate password field
    if (password !== patientId) {
      return NextResponse.json({ error: 'Invalid patient ID or password' }, { status: 401 });
    }

    // Generate JWT token
    const token = generateToken({
      userId: patient._id.toString(),
      email: patient.email || '',
      role: 'patient',
      type: 'patient'
    });

    // Return success response
    return NextResponse.json({
      success: true,
      token,
      patient: {
        id: patient._id.toString(),
        patientId: patient.patientId,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone,
      }
    });

  } catch (error) {
    console.error('Patient login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}