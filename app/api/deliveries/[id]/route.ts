import { NextRequest, NextResponse } from 'next/server';
import { getDelivery, updateDelivery, deleteDelivery } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const delivery = await getDelivery(id);

    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }

    // Check if user has access to this delivery
    if (decoded.role === 'medrep' && delivery.medRepId !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(delivery);

  } catch (error) {
    console.error('Error fetching delivery:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { status, notes, actualDeliveryTime } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Check if delivery exists and user has access
    const existingDelivery = await getDelivery(id);
    if (!existingDelivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }

    if (decoded.role === 'medrep' && existingDelivery.medRepId !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update delivery
    const updateData: {
      status: string;
      notes?: string;
      actualDeliveryTime?: Date;
    } = {
      status
    };

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (actualDeliveryTime) {
      updateData.actualDeliveryTime = new Date(actualDeliveryTime);
    }

    const updatedDelivery = await updateDelivery(id, updateData);
    if (!updatedDelivery) {
      return NextResponse.json({ error: 'Failed to update delivery' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating delivery:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Only allow admin to delete deliveries
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const success = await deleteDelivery(id);
    if (!success) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting delivery:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
