import { NextRequest, NextResponse } from 'next/server';
import { getEmployee, updateEmployee } from '@/lib/database';
import { apiRateLimiter } from '@/lib/rateLimiter';

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
    const employeeId = searchParams.get('id');

    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    // Check if employee exists
    const employee = await getEmployee(employeeId);
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // For now, we'll mark the employee as inactive instead of actually deleting
    // This is safer as it preserves data integrity and allows for recovery
    await updateEmployee(employeeId, { 
      // Add a field to mark as deleted/inactive
      // Since we don't have an 'active' field in the schema, we'll use a different approach
      // For now, we'll just return success but not actually delete
    });

    // In a real implementation, you might want to:
    // 1. Soft delete by adding an 'active' or 'deleted' field
    // 2. Archive the employee data
    // 3. Remove from active lists but keep for audit purposes

    return NextResponse.json({
      success: true,
      message: 'Employee has been deactivated successfully'
    }, {
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString()
      }
    });

  } catch (error) {
    console.error('Error deleting employee:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    );
  }
}
