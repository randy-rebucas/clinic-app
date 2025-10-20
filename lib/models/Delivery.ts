import mongoose, { Document, Schema } from 'mongoose';

export interface IDelivery extends Document {
  prescriptionId: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  status: 'scheduled' | 'in-transit' | 'delivered' | 'failed' | 'cancelled';
  scheduledTime: Date;
  actualDeliveryTime?: Date;
  medRepId: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DeliverySchema = new Schema<IDelivery>({
  prescriptionId: {
    type: String,
    required: true,
  },
  patientId: {
    type: String,
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  patientPhone: {
    type: String,
  },
  deliveryAddress: {
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
      default: 'USA',
    },
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-transit', 'delivered', 'failed', 'cancelled'],
    default: 'scheduled',
  },
  scheduledTime: {
    type: Date,
    required: true,
  },
  actualDeliveryTime: {
    type: Date,
  },
  medRepId: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

// Create indexes
DeliverySchema.index({ prescriptionId: 1 });
DeliverySchema.index({ patientId: 1 });
DeliverySchema.index({ medRepId: 1 });
DeliverySchema.index({ status: 1 });
DeliverySchema.index({ scheduledTime: 1 });

export const Delivery = mongoose.models.Delivery || mongoose.model<IDelivery>('Delivery', DeliverySchema);
