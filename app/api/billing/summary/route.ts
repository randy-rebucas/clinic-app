import { NextRequest, NextResponse } from 'next/server';
import { getBillingSummary } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    const summary = await getBillingSummary(patientId);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching billing summary:', error);
    return NextResponse.json({ error: 'Failed to fetch billing summary' }, { status: 500 });
  }
}
