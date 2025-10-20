import { NextRequest, NextResponse } from 'next/server';
import { createInvoice, getInvoicesByPatient, getInvoicesByStatus, updateInvoiceStatus } from '@/lib/database';
// import { v4 as uuidv4 } from 'uuid'; // Unused for now

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');

    if (patientId) {
      const invoices = await getInvoicesByPatient(patientId);
      return NextResponse.json(invoices);
    }

    if (status) {
      const invoices = await getInvoicesByStatus(status);
      return NextResponse.json(invoices);
    }

    return NextResponse.json({ error: 'Patient ID or status is required' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientId,
      appointmentId,
      prescriptionId,
      items,
      taxRate = 0,
      discountAmount = 0,
      dueDate,
      notes
    } = body;

    // Validation
    if (!patientId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: { totalPrice: number }) => sum + item.totalPrice, 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount - discountAmount;

    // Generate unique invoice ID
    const invoiceId = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const invoiceData = {
      invoiceId,
      patientId,
      appointmentId,
      prescriptionId,
      items,
      subtotal,
      taxRate,
      taxAmount,
      discountAmount,
      totalAmount,
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      notes
    };

    const invoiceId_db = await createInvoice(invoiceData);
    
    return NextResponse.json({ 
      success: true, 
      invoiceId: invoiceId_db,
      invoiceId_display: invoiceId,
      totalAmount,
      message: 'Invoice created successfully' 
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceId, status, paymentMethod, paidDate } = body;

    if (!invoiceId || !status) {
      return NextResponse.json({ error: 'Invoice ID and status are required' }, { status: 400 });
    }

    const updatedInvoice = await updateInvoiceStatus(
      invoiceId, 
      status, 
      paymentMethod, 
      paidDate ? new Date(paidDate) : undefined
    );

    if (!updatedInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      invoice: updatedInvoice,
      message: 'Invoice updated successfully' 
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}
