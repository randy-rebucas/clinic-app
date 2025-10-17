import { NextRequest, NextResponse } from 'next/server';
import { getIdleSettings, createIdleSettings, updateIdleSettings } from '@/lib/database';

export async function GET(request: NextRequest) {
  console.log('=== Idle Settings GET Request Started ===');
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const idleSettings = await getIdleSettings(employeeId);
    
    return NextResponse.json({
      success: true,
      data: idleSettings
    });
  } catch (error) {
    console.error('Error fetching idle settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch idle settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('=== Idle Settings POST Request Started ===');
  console.log('Request URL:', request.url);
  console.log('Request method:', request.method);
  console.log('Request headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    const body = await request.json();
    console.log('Idle settings POST request body:', body);
    const { employeeId, ...settingsData } = body;

    if (!employeeId) {
      console.error('Employee ID is missing from request');
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    console.log('Creating idle settings for employee:', employeeId, 'with data:', settingsData);
    const settingsId = await createIdleSettings({
      employeeId,
      ...settingsData
    });
    
    console.log('Idle settings created with ID:', settingsId);
    const response = {
      success: true,
      data: { id: settingsId }
    };
    console.log('Returning response:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating idle settings:', error);
    const errorResponse = {
      error: 'Failed to create idle settings',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    };
    console.log('Returning error response:', errorResponse);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  console.log('=== Idle Settings PUT Request Started ===');
  try {
    const body = await request.json();
    const { settingsId, ...updates } = body;

    if (!settingsId) {
      return NextResponse.json(
        { error: 'Settings ID is required' },
        { status: 400 }
      );
    }

    console.log('Updating idle settings with ID:', settingsId, 'updates:', updates);
    await updateIdleSettings(settingsId, updates);
    
    return NextResponse.json({
      success: true,
      data: { id: settingsId }
    });
  } catch (error) {
    console.error('Error updating idle settings:', error);
    return NextResponse.json(
      { error: 'Failed to update idle settings' },
      { status: 500 }
    );
  }
}