import { NextRequest, NextResponse } from 'next/server';
import { getTimeEntries } from '@/lib/database';
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
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const startDateObj = startDate ? new Date(startDate) : undefined;
    const endDateObj = endDate ? new Date(endDate) : undefined;

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
    
    // Set default limit for time entries
    if (!paginationOptions.limit) {
      paginationOptions.limit = getDefaultLimit('TIME_ENTRIES');
    }
    
    // Get pagination parameters for database query
    const { skip, limit, sort } = getPaginationParams(paginationOptions);
    
    // Get time entries with pagination
    const { timeEntries, total } = await getTimeEntries(employeeId, startDateObj, endDateObj, skip, limit, sort);
    
    // Create paginated response
    const paginatedResponse = createPaginationResponse(timeEntries, total, paginationOptions);
    
    const response = NextResponse.json({
      success: true,
      ...paginatedResponse
    });
    
    // Add pagination headers
    return addPaginationHeaders(response, paginatedResponse.pagination);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time entries' },
      { status: 500 }
    );
  }
}
