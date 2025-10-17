import { NextRequest } from 'next/server';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginationParams {
  skip: number;
  limit: number;
  sort: Record<string, 1 | -1>;
}

/**
 * Parse pagination parameters from NextRequest
 */
export function parsePaginationParams(request: NextRequest): PaginationOptions {
  const { searchParams } = new URL(request.url);
  
  return {
    page: Math.max(1, parseInt(searchParams.get('page') || '1')),
    limit: Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20'))),
    sortBy: searchParams.get('sortBy') || undefined,
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
  };
}

/**
 * Convert pagination options to MongoDB query parameters
 */
export function getPaginationParams(options: PaginationOptions): PaginationParams {
  const { page = 1, limit = 20, sortBy, sortOrder = 'desc' } = options;
  
  const skip = (page - 1) * limit;
  const sort: Record<string, 1 | -1> = {};
  
  if (sortBy) {
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
  } else {
    // Default sort by createdAt descending
    sort.createdAt = -1;
  }
  
  return { skip, limit, sort };
}

/**
 * Create pagination response
 */
export function createPaginationResponse<T>(
  data: T[],
  total: number,
  options: PaginationOptions
): PaginationResult<T> {
  const { page = 1, limit = 20 } = options;
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

/**
 * Add pagination headers to response
 */
export function addPaginationHeaders(
  response: Response,
  pagination: PaginationResult<unknown>['pagination']
): Response {
  const headers = new Headers(response.headers);
  
  headers.set('X-Pagination-Page', pagination.page.toString());
  headers.set('X-Pagination-Limit', pagination.limit.toString());
  headers.set('X-Pagination-Total', pagination.total.toString());
  headers.set('X-Pagination-TotalPages', pagination.totalPages.toString());
  headers.set('X-Pagination-HasNext', pagination.hasNext.toString());
  headers.set('X-Pagination-HasPrev', pagination.hasPrev.toString());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

/**
 * Default pagination limits for different data types
 */
export const PAGINATION_LIMITS = {
  EMPLOYEES: 50,
  TIME_ENTRIES: 100,
  ACTIVITIES: 200,
  SCREEN_CAPTURES: 50,
  DAILY_SUMMARIES: 30,
  WEEKLY_SUMMARIES: 12,
  IDLE_SESSIONS: 100,
  BREAK_SESSIONS: 100,
  WORK_SESSIONS: 100
} as const;

/**
 * Get appropriate limit for data type
 */
export function getDefaultLimit(dataType: keyof typeof PAGINATION_LIMITS): number {
  return PAGINATION_LIMITS[dataType];
}

/**
 * Validate pagination parameters
 */
export function validatePaginationParams(options: PaginationOptions): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (options.page && (options.page < 1 || !Number.isInteger(options.page))) {
    errors.push('Page must be a positive integer');
  }
  
  if (options.limit && (options.limit < 1 || options.limit > 1000 || !Number.isInteger(options.limit))) {
    errors.push('Limit must be between 1 and 1000');
  }
  
  if (options.sortOrder && !['asc', 'desc'].includes(options.sortOrder)) {
    errors.push('Sort order must be "asc" or "desc"');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
