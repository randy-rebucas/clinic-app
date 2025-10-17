import { NextRequest, NextResponse } from 'next/server';
import { getAllEmployees } from '@/lib/database';
import { apiRateLimiter } from '@/lib/rateLimiter';
import { 
  parsePaginationParams, 
  getPaginationParams, 
  createPaginationResponse, 
  addPaginationHeaders,
  getDefaultLimit,
  validatePaginationParams
} from '@/lib/pagination/paginationUtils';

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

    // Parse pagination parameters
    const paginationOptions = parsePaginationParams(request);
    
    // Validate pagination parameters
    const validation = validatePaginationParams(paginationOptions);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters', details: validation.errors },
        { status: 400 }
      );
    }
    
    // Set default limit for employees
    if (!paginationOptions.limit) {
      paginationOptions.limit = getDefaultLimit('EMPLOYEES');
    }
    
    // Get pagination parameters for database query
    const { skip, limit, sort } = getPaginationParams(paginationOptions);
    
    // Get employees with pagination
    const { employees, total } = await getAllEmployees(skip, limit, sort);
    
    // Create paginated response
    const paginatedResponse = createPaginationResponse(employees, total, paginationOptions);
    
    const response = NextResponse.json({
      success: true,
      ...paginatedResponse
    }, {
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString()
      }
    });
    
    // Add pagination headers
    return addPaginationHeaders(response, paginatedResponse.pagination);
  } catch (error) {
    console.error('Error fetching employees:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}
