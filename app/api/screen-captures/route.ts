import { NextRequest, NextResponse } from 'next/server';
import { createScreenCapture } from '@/lib/database';
import { validateObjectId, validateDate } from '@/lib/validation';
import { strictRateLimiter } from '@/lib/rateLimiter';

export async function POST(request: NextRequest) {
  try {
    // Apply strict rate limiting for file uploads
    const rateLimit = strictRateLimiter(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many upload requests. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        }, 
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString()
          }
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const employeeId = formData.get('employeeId') as string;
    const timestamp = formData.get('timestamp') as string;
    const workSessionId = formData.get('workSessionId') as string;

    // Validate required fields
    if (!file || !employeeId || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields: file, employeeId, timestamp' },
        { status: 400 }
      );
    }

    // Validate file
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'Invalid file format' },
        { status: 400 }
      );
    }

    // Check file size (limit to 5MB)
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxFileSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PNG, JPEG, and WebP images are allowed.' },
        { status: 400 }
      );
    }

    // Validate employee ID
    const employeeIdValidation = validateObjectId(employeeId);
    if (!employeeIdValidation.isValid) {
      return NextResponse.json(
        { error: `Invalid employee ID: ${employeeIdValidation.errors.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate timestamp
    const timestampValidation = validateDate(timestamp);
    if (!timestampValidation.isValid) {
      return NextResponse.json(
        { error: `Invalid timestamp: ${timestampValidation.errors.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate work session ID if provided
    if (workSessionId) {
      const workSessionIdValidation = validateObjectId(workSessionId);
      if (!workSessionIdValidation.isValid) {
        return NextResponse.json(
          { error: `Invalid work session ID: ${workSessionIdValidation.errors.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Convert file to base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString('base64');
    
    // Create a simple thumbnail (for now, just use the same image)
    const thumbnail = base64Data;

    const screenCaptureData = {
      employeeId,
      timestamp: new Date(timestamp),
      workSessionId: workSessionId || undefined,
      imageData: base64Data,
      thumbnail: thumbnail,
      fileSize: file.size,
      isActive: true,
    };

    const screenCapture = await createScreenCapture(screenCaptureData);
    
    return NextResponse.json({
      success: true,
      data: screenCapture
    });
  } catch (error) {
    console.error('Error creating screen capture:', error);
    return NextResponse.json(
      { error: 'Failed to create screen capture' },
      { status: 500 }
    );
  }
}
