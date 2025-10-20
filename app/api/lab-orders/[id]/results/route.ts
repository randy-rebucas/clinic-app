import { NextRequest, NextResponse } from 'next/server';
import { updateLabTestResult, updateLabOrderStatus } from '@/lib/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: labOrderId } = await params;
    const body = await request.json();
    const { testIndex, resultData, status, labTechnician } = body;

    if (!labOrderId) {
      return NextResponse.json({ error: 'Lab order ID is required' }, { status: 400 });
    }

    // Update individual test result
    if (testIndex !== undefined && resultData) {
      const updatedLabOrder = await updateLabTestResult(labOrderId, testIndex, resultData);
      
      if (!updatedLabOrder) {
        return NextResponse.json({ error: 'Lab order not found' }, { status: 404 });
      }

      return NextResponse.json({ 
        success: true, 
        labOrder: updatedLabOrder,
        message: 'Test result updated successfully' 
      });
    }

    // Update overall lab order status
    if (status) {
      const updatedLabOrder = await updateLabOrderStatus(
        labOrderId, 
        status, 
        status === 'completed' ? new Date() : undefined,
        labTechnician
      );
      
      if (!updatedLabOrder) {
        return NextResponse.json({ error: 'Lab order not found' }, { status: 404 });
      }

      return NextResponse.json({ 
        success: true, 
        labOrder: updatedLabOrder,
        message: 'Lab order status updated successfully' 
      });
    }

    return NextResponse.json({ error: 'Test result data or status is required' }, { status: 400 });

  } catch (error) {
    console.error('Error updating lab test result:', error);
    return NextResponse.json({ error: 'Failed to update lab test result' }, { status: 500 });
  }
}
