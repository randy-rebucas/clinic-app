import { NextRequest, NextResponse } from 'next/server';
import { getIdleSettings, createIdleSettings } from '@/lib/database';

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
  try {
    const body = await request.json();
    const { employeeId, ...settingsData } = body;

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const settingsId = await createIdleSettings({
      employeeId,
      ...settingsData
    });
    
    return NextResponse.json({
      success: true,
      data: { id: settingsId }
    });
  } catch (error) {
    console.error('Error creating idle settings:', error);
    return NextResponse.json(
      { error: 'Failed to create idle settings' },
      { status: 500 }
    );
  }
}
