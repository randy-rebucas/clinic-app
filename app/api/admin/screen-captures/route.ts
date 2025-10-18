import { NextRequest, NextResponse } from 'next/server';
import { getAllEmployees } from '@/lib/database';
import { apiRateLimiter } from '@/lib/rateLimiter';
import { Types } from 'mongoose';

// Import ScreenCapture model directly
import { ScreenCapture } from '@/lib/models/ScreenCapture';

export async function GET(request: NextRequest) {
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
    const employeeId = searchParams.get('employeeId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = parseInt(searchParams.get('skip') || '0');

    // Build query
    const query: Record<string, unknown> = {};
    
    if (employeeId && Types.ObjectId.isValid(employeeId)) {
      query.employeeId = new Types.ObjectId(employeeId);
    }

    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get all screen captures with pagination
    const [captures, total] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ScreenCapture as any).find(query)
        .populate('employeeId', 'name email')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ScreenCapture as any).countDocuments(query)
    ]);

    // Get all employees for reference
    const { employees } = await getAllEmployees(0, 1000);

    // Transform the data to include employee names
    const transformedCaptures = captures.map((capture: {
      _id: { toString(): string };
      employeeId: { _id: { toString(): string }; name: string; email: string };
      workSessionId?: { toString(): string };
      timestamp: Date;
      imageData: string;
      thumbnail?: string;
      fileSize: number;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    }) => ({
      id: capture._id.toString(),
      employeeId: capture.employeeId._id.toString(),
      employeeName: capture.employeeId.name,
      employeeEmail: capture.employeeId.email,
      workSessionId: capture.workSessionId?.toString() || null,
      timestamp: capture.timestamp,
      imageData: capture.imageData,
      thumbnail: capture.thumbnail,
      fileSize: capture.fileSize,
      isActive: capture.isActive,
      createdAt: capture.createdAt,
      updatedAt: capture.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: transformedCaptures,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total
      },
      employees: employees.map(emp => ({
        id: emp._id.toString(),
        name: emp.name,
        email: emp.email
      }))
    }, {
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString()
      }
    });

  } catch (error) {
    console.error('Error fetching screen captures:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    return NextResponse.json(
      { error: 'Failed to fetch screen captures' },
      { status: 500 }
    );
  }
}
