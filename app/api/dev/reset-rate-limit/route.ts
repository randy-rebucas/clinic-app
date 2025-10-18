import { NextRequest, NextResponse } from 'next/server';
import { resetRateLimit } from '@/lib/rateLimiter';

export async function POST(request: NextRequest) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { key } = body;
    
    // Reset rate limit for specific key or all keys
    resetRateLimit(key);
    
    return NextResponse.json({ 
      success: true, 
      message: key ? `Rate limit reset for key: ${key}` : 'All rate limits reset' 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reset rate limit' }, { status: 500 });
  }
}

export async function GET() {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  return NextResponse.json({ 
    message: 'Rate limit reset endpoint. Use POST with optional { "key": "ip_address" } to reset specific rate limit or empty body to reset all.' 
  });
}
