import { NextRequest, NextResponse } from 'next/server';
import { resetDatabase, getDatabaseStats, resetSpecificCollection } from '@/lib/database';
import { resetApplication, resetSpecificCollections } from '@/lib/setup';
import connectDB from '@/lib/mongodb';

/**
 * GET /api/admin/reset-database - Get database statistics
 */
export async function GET() {
  try {
    await connectDB();
    
    const statsResult = await getDatabaseStats();
    
    if (!statsResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to get database statistics',
          error: statsResult.error
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        stats: statsResult.stats,
        totalDocuments: Object.values(statsResult.stats).reduce((sum, count) => sum + count, 0)
      }
    });
  } catch (error) {
    console.error('Error getting database stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to get database statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/reset-database - Reset database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      action = 'full-reset',
      collections = [],
      confirmReset = false
    } = body;

    // Safety check - require explicit confirmation
    if (!confirmReset) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Database reset requires explicit confirmation. Set confirmReset: true in the request body.' 
        },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'full-reset':
        result = await resetApplication();
        break;
        
      case 'database-only':
        result = await resetDatabase();
        break;
        
      case 'specific-collections':
        if (!collections || collections.length === 0) {
          return NextResponse.json(
            { 
              success: false, 
              message: 'No collections specified for selective reset' 
            },
            { status: 400 }
          );
        }
        result = await resetSpecificCollections(collections);
        break;
        
      case 'single-collection':
        if (!collections || collections.length !== 1) {
          return NextResponse.json(
            { 
              success: false, 
              message: 'Single collection reset requires exactly one collection name' 
            },
            { status: 400 }
          );
        }
        result = await resetSpecificCollection(collections[0]);
        break;
        
      default:
        return NextResponse.json(
          { 
            success: false, 
            message: 'Invalid action. Use "full-reset", "database-only", "specific-collections", or "single-collection"' 
          },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }

  } catch (error) {
    console.error('Database reset API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Database reset failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/reset-database - Force reset (alternative method)
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { force = false } = body;

    if (!force) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Force reset requires force: true parameter' 
        },
        { status: 400 }
      );
    }

    const result = await resetDatabase();
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Force reset API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Force reset failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
