import { NextRequest, NextResponse } from 'next/server';
import { getInvoice } from '@/lib/database';
import { getPatient } from '@/lib/database';
import { getPaymentsByInvoice } from '@/lib/database';
import { generateInvoicePDF } from '@/lib/pdf-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invoiceId } = await params;

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    // Fetch invoice data
    const invoice = await getInvoice(invoiceId);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Fetch patient data
    const patient = await getPatient(invoice.patientId);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Fetch payment history
    const payments = await getPaymentsByInvoice(invoiceId);

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF({
      invoice,
      patient,
      payments
    });

    // Return PDF as response
    return new NextResponse(pdfBuffer.toString(), {
      headers: {
        'Content-Type': 'text/html', // For now, returning HTML. In production, use 'application/pdf'
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceId}.html"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
