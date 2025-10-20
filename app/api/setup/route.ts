import { NextRequest, NextResponse } from 'next/server';
import { setupApplication, resetApplication, isApplicationSetup, getSetupStatus } from '@/lib/setup';

/**
 * GET /api/setup - Check setup status
 */
export async function GET() {
  try {
    const status = await getSetupStatus();
    
    return NextResponse.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error checking setup status:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to check setup status',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/setup - Run application setup
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      adminEmail, 
      adminPassword, 
      adminName, 
      includeSeedData = true, 
      resetExisting = false,
      action = 'setup'
    } = body;

    // Validate required fields for setup
    if (action === 'setup' && !adminEmail && !adminPassword) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Admin email and password are required for setup' 
        },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'setup':
        result = await setupApplication({
          adminEmail,
          adminPassword,
          adminName,
          includeSeedData,
          resetExisting
        });
        break;
        
      case 'reset':
        result = await resetApplication();
        break;
        
      case 'check':
        const isSetup = await isApplicationSetup();
        result = {
          success: true,
          message: isSetup ? 'Application is already set up' : 'Application is not set up',
          data: { isSetup }
        };
        break;
        
      default:
        return NextResponse.json(
          { 
            success: false, 
            message: 'Invalid action. Use "setup", "reset", or "check"' 
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
    console.error('Setup API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Setup failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/setup - Reset application (alternative to POST with action=reset)
 */
export async function DELETE() {
  try {
    const result = await resetApplication();
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Reset API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Reset failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
