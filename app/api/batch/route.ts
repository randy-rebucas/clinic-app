import { NextRequest, NextResponse } from 'next/server';
import { apiRateLimiter } from '@/lib/rateLimiter';
import { 
  getActiveWorkSession, 
  getActiveBreakSession, 
  getDailySummary,
  getEmployee
} from '@/lib/database';

interface BatchRequest {
  requests: Array<{
    id: string;
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    params?: Record<string, unknown>;
    body?: unknown;
  }>;
}

interface BatchResponse {
  responses: Array<{
    id: string;
    success: boolean;
    data?: unknown;
    error?: string;
    status: number;
  }>;
}

export async function POST(request: NextRequest) {
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

    const body: BatchRequest = await request.json();
    
    if (!body.requests || !Array.isArray(body.requests)) {
      return NextResponse.json(
        { error: 'Invalid batch request format' },
        { status: 400 }
      );
    }

    if (body.requests.length > 10) {
      return NextResponse.json(
        { error: 'Too many requests in batch. Maximum 10 requests allowed.' },
        { status: 400 }
      );
    }

    const responses: BatchResponse['responses'] = [];

    // Process each request in parallel
    const promises = body.requests.map(async (req) => {
      try {
        let result: unknown = null;
        const status = 200;

        switch (req.endpoint) {
          case 'active-work-session':
            if (!req.params?.employeeId) {
              throw new Error('Employee ID is required');
            }
            result = await getActiveWorkSession(req.params.employeeId as string);
            break;

          case 'active-break-session':
            if (!req.params?.employeeId) {
              throw new Error('Employee ID is required');
            }
            result = await getActiveBreakSession(req.params.employeeId as string);
            break;

          case 'daily-summary':
            if (!req.params?.employeeId || !req.params?.date) {
              throw new Error('Employee ID and date are required');
            }
            result = await getDailySummary(req.params.employeeId as string, req.params.date as string);
            break;

          case 'employee':
            if (!req.params?.employeeId) {
              throw new Error('Employee ID is required');
            }
            result = await getEmployee(req.params.employeeId as string);
            break;

          default:
            throw new Error(`Unknown endpoint: ${req.endpoint}`);
        }

        responses.push({
          id: req.id,
          success: true,
          data: result,
          status
        });

      } catch (error) {
        responses.push({
          id: req.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          status: 500
        });
      }
    });

    await Promise.allSettled(promises);

    return NextResponse.json({
      success: true,
      responses
    }, {
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString()
      }
    });

  } catch (error) {
    console.error('Error processing batch request:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { error: 'Failed to process batch request' },
      { status: 500 }
    );
  }
}

// GET method for batch requests (alternative approach)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    
    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    // Batch multiple requests for dashboard data
    const [workSession, breakSession, dailySummary] = await Promise.allSettled([
      getActiveWorkSession(employeeId),
      getActiveBreakSession(employeeId),
      getDailySummary(employeeId, new Date().toISOString().split('T')[0])
    ]);

    const result = {
      workSession: workSession.status === 'fulfilled' ? workSession.value : null,
      breakSession: breakSession.status === 'fulfilled' ? breakSession.value : null,
      dailySummary: dailySummary.status === 'fulfilled' ? dailySummary.value : null,
      errors: {
        workSession: workSession.status === 'rejected' ? workSession.reason?.message : null,
        breakSession: breakSession.status === 'rejected' ? breakSession.reason?.message : null,
        dailySummary: dailySummary.status === 'rejected' ? dailySummary.reason?.message : null
      }
    };

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error processing batch GET request:', error);
    return NextResponse.json(
      { error: 'Failed to process batch request' },
      { status: 500 }
    );
  }
}
