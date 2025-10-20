import { IInvoice, IPayment } from './models/Billing';
import { IPatient } from './models/Patient';

export interface PDFInvoiceData {
  invoice: IInvoice;
  patient: IPatient;
  payments?: IPayment[];
}

export const generateInvoicePDF = async (data: PDFInvoiceData): Promise<Buffer> => {
  // For now, we'll create a simple HTML template that can be converted to PDF
  // In a production environment, you would use libraries like puppeteer, jsPDF, or PDFKit
  
  const { invoice, patient, payments = [] } = data;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice.invoiceId}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 20px;
        }
        .clinic-name {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 5px;
        }
        .clinic-address {
          font-size: 14px;
          color: #666;
        }
        .invoice-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .invoice-details, .patient-details {
          flex: 1;
        }
        .invoice-details h3, .patient-details h3 {
          margin: 0 0 10px 0;
          color: #2563eb;
          font-size: 16px;
        }
        .invoice-details p, .patient-details p {
          margin: 5px 0;
          font-size: 14px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .items-table th, .items-table td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        .items-table th {
          background-color: #f8fafc;
          font-weight: bold;
          color: #374151;
        }
        .items-table .text-right {
          text-align: right;
        }
        .totals {
          margin-left: auto;
          width: 300px;
        }
        .totals table {
          width: 100%;
          border-collapse: collapse;
        }
        .totals td {
          padding: 8px 12px;
          border: none;
        }
        .totals .label {
          text-align: right;
          font-weight: bold;
        }
        .totals .amount {
          text-align: right;
        }
        .total-row {
          border-top: 2px solid #2563eb;
          font-weight: bold;
          font-size: 16px;
        }
        .status {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status.paid {
          background-color: #dcfce7;
          color: #166534;
        }
        .status.sent {
          background-color: #fef3c7;
          color: #92400e;
        }
        .status.overdue {
          background-color: #fee2e2;
          color: #991b1b;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .payment-history {
          margin-top: 30px;
        }
        .payment-history h3 {
          color: #2563eb;
          margin-bottom: 15px;
        }
        .payment-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .payment-item:last-child {
          border-bottom: none;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="clinic-name">Clinic Management System</div>
        <div class="clinic-address">
          123 Medical Center Drive<br>
          Healthcare City, HC 12345<br>
          Phone: (555) 123-4567 | Email: billing@clinic.com
        </div>
      </div>

      <div class="invoice-info">
        <div class="invoice-details">
          <h3>Invoice Details</h3>
          <p><strong>Invoice ID:</strong> ${invoice.invoiceId}</p>
          <p><strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}</p>
          <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> <span class="status ${invoice.status}">${invoice.status}</span></p>
          ${invoice.appointmentId ? `<p><strong>Appointment:</strong> ${invoice.appointmentId}</p>` : ''}
          ${invoice.prescriptionId ? `<p><strong>Prescription:</strong> ${invoice.prescriptionId}</p>` : ''}
        </div>
        
        <div class="patient-details">
          <h3>Bill To</h3>
          <p><strong>${patient.firstName} ${patient.lastName}</strong></p>
          <p>Patient ID: ${patient.patientId}</p>
          ${patient.email ? `<p>Email: ${patient.email}</p>` : ''}
          ${patient.phone ? `<p>Phone: ${patient.phone}</p>` : ''}
          ${patient.address ? `
            <p>
              ${patient.address.street}<br>
              ${patient.address.city}, ${patient.address.state} ${patient.address.zipCode}<br>
              ${patient.address.country}
            </p>
          ` : ''}
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Category</th>
            <th class="text-right">Quantity</th>
            <th class="text-right">Unit Price</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td>${item.category}</td>
              <td class="text-right">${item.quantity}</td>
              <td class="text-right">$${item.unitPrice.toFixed(2)}</td>
              <td class="text-right">$${item.totalPrice.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <table>
          <tr>
            <td class="label">Subtotal:</td>
            <td class="amount">$${invoice.subtotal.toFixed(2)}</td>
          </tr>
          ${invoice.taxRate > 0 ? `
            <tr>
              <td class="label">Tax (${invoice.taxRate}%):</td>
              <td class="amount">$${invoice.taxAmount.toFixed(2)}</td>
            </tr>
          ` : ''}
          ${invoice.discountAmount > 0 ? `
            <tr>
              <td class="label">Discount:</td>
              <td class="amount">-$${invoice.discountAmount.toFixed(2)}</td>
            </tr>
          ` : ''}
          <tr class="total-row">
            <td class="label">Total:</td>
            <td class="amount">$${invoice.totalAmount.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      ${payments.length > 0 ? `
        <div class="payment-history">
          <h3>Payment History</h3>
          ${payments.map(payment => `
            <div class="payment-item">
              <div>
                <strong>${payment.paymentId}</strong><br>
                <small>${new Date(payment.paymentDate).toLocaleDateString()} - ${payment.paymentMethod}</small>
                ${payment.reference ? `<br><small>Ref: ${payment.reference}</small>` : ''}
              </div>
              <div class="text-right">
                <strong>$${payment.amount.toFixed(2)}</strong>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${invoice.notes ? `
        <div style="margin-top: 30px;">
          <h3 style="color: #2563eb; margin-bottom: 10px;">Notes</h3>
          <p style="background-color: #f8fafc; padding: 15px; border-radius: 5px; border-left: 4px solid #2563eb;">
            ${invoice.notes}
          </p>
        </div>
      ` : ''}

      <div class="footer">
        <p>Thank you for choosing our clinic. For questions about this invoice, please contact our billing department.</p>
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
      </div>
    </body>
    </html>
  `;

  // In a real implementation, you would convert this HTML to PDF using:
  // - Puppeteer for server-side PDF generation
  // - jsPDF for client-side PDF generation
  // - A service like HTML/CSS to PDF API
  
  // For now, we'll return the HTML as a buffer (you can save this as .html for testing)
  return Buffer.from(html, 'utf-8');
};

export const generateReceiptPDF = async (payment: IPayment, invoice: IInvoice, patient: IPatient): Promise<Buffer> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Receipt ${payment.paymentId}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #16a34a;
          padding-bottom: 20px;
        }
        .clinic-name {
          font-size: 24px;
          font-weight: bold;
          color: #16a34a;
          margin-bottom: 5px;
        }
        .receipt-title {
          font-size: 20px;
          font-weight: bold;
          color: #16a34a;
          margin: 20px 0;
        }
        .receipt-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .receipt-details, .patient-details {
          flex: 1;
        }
        .receipt-details h3, .patient-details h3 {
          margin: 0 0 10px 0;
          color: #16a34a;
          font-size: 16px;
        }
        .receipt-details p, .patient-details p {
          margin: 5px 0;
          font-size: 14px;
        }
        .payment-summary {
          background-color: #f0fdf4;
          border: 2px solid #16a34a;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .payment-summary h3 {
          color: #16a34a;
          margin-top: 0;
        }
        .payment-row {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          padding: 5px 0;
          border-bottom: 1px solid #dcfce7;
        }
        .payment-row:last-child {
          border-bottom: none;
          font-weight: bold;
          font-size: 16px;
          color: #16a34a;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="clinic-name">Clinic Management System</div>
        <div style="font-size: 14px; color: #666;">
          123 Medical Center Drive<br>
          Healthcare City, HC 12345<br>
          Phone: (555) 123-4567 | Email: billing@clinic.com
        </div>
      </div>

      <div class="receipt-title">PAYMENT RECEIPT</div>

      <div class="receipt-info">
        <div class="receipt-details">
          <h3>Receipt Details</h3>
          <p><strong>Receipt ID:</strong> ${payment.paymentId}</p>
          <p><strong>Invoice ID:</strong> ${invoice.invoiceId}</p>
          <p><strong>Payment Date:</strong> ${new Date(payment.paymentDate).toLocaleDateString()}</p>
          <p><strong>Payment Time:</strong> ${new Date(payment.paymentDate).toLocaleTimeString()}</p>
          <p><strong>Payment Method:</strong> ${payment.paymentMethod.toUpperCase()}</p>
          ${payment.reference ? `<p><strong>Reference:</strong> ${payment.reference}</p>` : ''}
        </div>
        
        <div class="patient-details">
          <h3>Patient Information</h3>
          <p><strong>${patient.firstName} ${patient.lastName}</strong></p>
          <p>Patient ID: ${patient.patientId}</p>
          ${patient.email ? `<p>Email: ${patient.email}</p>` : ''}
          ${patient.phone ? `<p>Phone: ${patient.phone}</p>` : ''}
        </div>
      </div>

      <div class="payment-summary">
        <h3>Payment Summary</h3>
        <div class="payment-row">
          <span>Invoice Total:</span>
          <span>$${invoice.totalAmount.toFixed(2)}</span>
        </div>
        <div class="payment-row">
          <span>Payment Amount:</span>
          <span>$${payment.amount.toFixed(2)}</span>
        </div>
        <div class="payment-row">
          <span>Payment Method:</span>
          <span>${payment.paymentMethod.toUpperCase()}</span>
        </div>
        <div class="payment-row">
          <span>Remaining Balance:</span>
          <span>$${(invoice.totalAmount - payment.amount).toFixed(2)}</span>
        </div>
      </div>

      ${payment.notes ? `
        <div style="margin-top: 20px;">
          <h3 style="color: #16a34a; margin-bottom: 10px;">Notes</h3>
          <p style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; border-left: 4px solid #16a34a;">
            ${payment.notes}
          </p>
        </div>
      ` : ''}

      <div class="footer">
        <p>Thank you for your payment. Please keep this receipt for your records.</p>
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
      </div>
    </body>
    </html>
  `;

  return Buffer.from(html, 'utf-8');
};