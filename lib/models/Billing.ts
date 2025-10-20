import mongoose, { Document, Schema } from 'mongoose';

export interface IBillingItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: 'consultation' | 'medication' | 'lab-test' | 'procedure' | 'other';
}

export interface IInvoice extends Document {
  invoiceId: string;
  patientId: string;
  appointmentId?: string;
  prescriptionId?: string;
  items: IBillingItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidDate?: Date;
  paymentMethod?: 'cash' | 'card' | 'insurance' | 'bank-transfer';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayment extends Document {
  paymentId: string;
  invoiceId: string;
  patientId: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'insurance' | 'bank-transfer';
  paymentDate: Date;
  reference?: string;
  notes?: string;
  processedBy: string; // User ID who processed the payment
  createdAt: Date;
  updatedAt: Date;
}

const BillingItemSchema = new Schema<IBillingItem>({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    enum: ['consultation', 'medication', 'lab-test', 'procedure', 'other'],
    required: true,
  },
});

const InvoiceSchema = new Schema<IInvoice>({
  invoiceId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  patientId: {
    type: String,
    required: true,
    ref: 'Patient',
  },
  appointmentId: {
    type: String,
    ref: 'Appointment',
  },
  prescriptionId: {
    type: String,
    ref: 'Prescription',
  },
  items: [BillingItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft',
  },
  dueDate: {
    type: Date,
    required: true,
  },
  paidDate: Date,
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'insurance', 'bank-transfer'],
  },
  notes: String,
}, {
  timestamps: true,
});

const PaymentSchema = new Schema<IPayment>({
  paymentId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  invoiceId: {
    type: String,
    required: true,
    ref: 'Invoice',
  },
  patientId: {
    type: String,
    required: true,
    ref: 'Patient',
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'insurance', 'bank-transfer'],
    required: true,
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  reference: String,
  notes: String,
  processedBy: {
    type: String,
    required: true,
    ref: 'User',
  },
}, {
  timestamps: true,
});

InvoiceSchema.index({ invoiceId: 1 });
InvoiceSchema.index({ patientId: 1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ dueDate: 1 });

PaymentSchema.index({ paymentId: 1 });
PaymentSchema.index({ invoiceId: 1 });
PaymentSchema.index({ patientId: 1 });
PaymentSchema.index({ paymentDate: 1 });

const getInvoiceModel = () => {
  try {
    return mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
  } catch {
    return mongoose.model<IInvoice>('Invoice', InvoiceSchema);
  }
};

const getPaymentModel = () => {
  try {
    return mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
  } catch {
    return mongoose.model<IPayment>('Payment', PaymentSchema);
  }
};

export const Invoice = getInvoiceModel();
export const Payment = getPaymentModel();
