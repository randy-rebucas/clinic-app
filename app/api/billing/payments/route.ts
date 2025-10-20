import { NextRequest, NextResponse } from 'next/server';
import { createPayment, getInvoice, getPaymentsByInvoice, getPaymentsByPatient, getBillingSummary } from '@/lib/database';
// import { v4 as uuidv4 } from 'uuid'; // Unused for now

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('invoiceId');
    const patientId = searchParams.get('patientId');
    const summary = searchParams.get('summary');

    if (invoiceId) {
      const payments = await getPaymentsByInvoice(invoiceId);
      return NextResponse.json(payments);
    }

    if (patientId) {
      if (summary === 'true') {
        const summary = await getBillingSummary(patientId);
        return NextResponse.json(summary);
      }
      const payments = await getPaymentsByPatient(patientId);
      return NextResponse.json(payments);
    }

    return NextResponse.json({ error: 'Invoice ID or patient ID is required' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      invoiceId,
      patientId,
      amount,
      paymentMethod,
      reference,
      notes,
      processedBy
    } = body;

    // Validation
    if (!invoiceId || !patientId || !amount || !paymentMethod || !processedBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify invoice exists
    const invoice = await getInvoice(invoiceId);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Generate unique payment ID
    const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const paymentData = {
      paymentId,
      invoiceId,
      patientId,
      amount: parseFloat(amount),
      paymentMethod,
      reference,
      notes,
      processedBy
    };

    const paymentId_db = await createPayment(paymentData);
    
    return NextResponse.json({ 
      success: true, 
      paymentId: paymentId_db,
      paymentId_display: paymentId,
      message: 'Payment processed successfully' 
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
  }
}
