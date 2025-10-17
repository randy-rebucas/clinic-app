import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeByEmail } from '@/lib/database';
import { authRateLimiter } from '@/lib/rateLimiter';

export async function POST(request: NextRequest) {
  let email = 'unknown';
  
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
    const { email: requestEmail, password } = body;
    email = requestEmail;

    // Input validation
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Invalid input format' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Get employee by email using the proper database function
    const employee = await getEmployeeByEmail(email);
    
    if (!employee) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check if employee has a password
    if (!employee.password) {
      return NextResponse.json({ error: 'Account needs password setup. Please contact administrator.' }, { status: 401 });
    }

    // Compare password
    const isPasswordValid = await employee.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Return employee data (excluding password)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...employeeWithoutPassword } = employee.toObject();
    
    // Log successful login (without sensitive data)
    console.log(`Successful login for user: ${email}`);
    
    return NextResponse.json(employeeWithoutPassword, {
      headers: {
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString()
      }
    });
  } catch (error) {
    // Log error details for debugging (but don't expose sensitive info)
    console.error('Login error:', {
      email: email || 'unknown',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    
    // Return generic error message to prevent information leakage
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
