import { NextRequest, NextResponse } from 'next/server';
import { getInvoice, getPatient, getPayment } from '@/lib/database';
import { generateReceiptPDF } from '@/lib/pdf-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paymentId } = await params;

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    // Fetch payment data
    const payment = await getPayment(paymentId);
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Fetch invoice data
    const invoice = await getInvoice(payment.invoiceId);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Fetch patient data
    const patient = await getPatient(payment.patientId);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Generate PDF
    const pdfBuffer = await generateReceiptPDF(payment, invoice, patient);

    // Return PDF as response
    return new NextResponse(pdfBuffer.toString(), {
      headers: {
        'Content-Type': 'text/html', // For now, returning HTML. In production, use 'application/pdf'
        'Content-Disposition': `attachment; filename="receipt-${payment.paymentId}.html"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating receipt PDF:', error);
    return NextResponse.json({ error: 'Failed to generate receipt' }, { status: 500 });
  }
}
