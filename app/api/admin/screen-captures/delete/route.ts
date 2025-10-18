import { NextRequest, NextResponse } from 'next/server';
import { apiRateLimiter } from '@/lib/rateLimiter';
import { Types } from 'mongoose';

// Import ScreenCapture model directly
import { ScreenCapture } from '@/lib/models/ScreenCapture';

export async function DELETE(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimit = apiRateLimiter(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        }, 
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString()
          }
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const captureId = searchParams.get('id');

    if (!captureId) {
      return NextResponse.json({ error: 'Screen capture ID is required' }, { status: 400 });
    }

    if (!Types.ObjectId.isValid(captureId)) {
      return NextResponse.json({ error: 'Invalid screen capture ID' }, { status: 400 });
    }

    // Check if screen capture exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const capture = await (ScreenCapture as any).findById(captureId);
    if (!capture) {
      return NextResponse.json({ error: 'Screen capture not found' }, { status: 404 });
    }

    // Delete the screen capture
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (ScreenCapture as any).findByIdAndDelete(captureId);

    return NextResponse.json({
      success: true,
      message: 'Screen capture deleted successfully'
    }, {
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString()
      }
    });

  } catch (error) {
    console.error('Error deleting screen capture:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    return NextResponse.json(
      { error: 'Failed to delete screen capture' },
      { status: 500 }
    );
  }
}
