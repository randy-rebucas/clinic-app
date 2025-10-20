// Notification service for clinic management system
// This handles email, SMS, and in-app notifications

export interface NotificationTemplate {
  id: string;
  type: 'email' | 'sms' | 'in-app';
  subject?: string;
  body: string;
  variables: string[];
}

export interface NotificationData {
  to: string | string[];
  template: string;
  variables: Record<string, string>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  scheduledFor?: Date;
}

// Notification templates
export const NOTIFICATION_TEMPLATES: Record<string, NotificationTemplate> = {
  // Appointment notifications
  'appointment-scheduled': {
    id: 'appointment-scheduled',
    type: 'email',
    subject: 'Appointment Scheduled - \{\{clinicName\}\}',
    body: `Dear \{\{patientName\}\},

Your appointment has been scheduled:

Date: \{\{appointmentDate\}\}
Time: \{\{appointmentTime\}\}
Doctor: \{\{doctorName\}\}
Type: \{\{appointmentType\}\}
Reason: \{\{reason\}\}

Please arrive 15 minutes early for check-in.

If you need to reschedule, please contact us at \{\{clinicPhone\}\}.

Best regards,
\{\{clinicName\}\}`,
    variables: ['patientName', 'appointmentDate', 'appointmentTime', 'doctorName', 'appointmentType', 'reason', 'clinicName', 'clinicPhone']
  },

  'appointment-reminder': {
    id: 'appointment-reminder',
    type: 'email',
    subject: 'Appointment Reminder - Tomorrow at \{\{appointmentTime\}\}',
    body: `Dear \{\{patientName\}\},

This is a reminder that you have an appointment tomorrow:

Date: \{\{appointmentDate\}\}
Time: \{\{appointmentTime\}\}
Doctor: \{\{doctorName\}\}
Type: \{\{appointmentType\}\}

Please arrive 15 minutes early for check-in.

Best regards,
\{\{clinicName\}\}`,
    variables: ['patientName', 'appointmentDate', 'appointmentTime', 'doctorName', 'appointmentType', 'clinicName']
  },

  'appointment-cancelled': {
    id: 'appointment-cancelled',
    type: 'email',
    subject: 'Appointment Cancelled - \{\{clinicName\}\}',
    body: `Dear \{\{patientName\}\},

Your appointment scheduled for \{\{appointmentDate\}\} at \{\{appointmentTime\}\} has been cancelled.

Reason: \{\{cancellationReason\}\}

Please contact us to reschedule at \{\{clinicPhone\}\}.

Best regards,
\{\{clinicName\}\}`,
    variables: ['patientName', 'appointmentDate', 'appointmentTime', 'cancellationReason', 'clinicName', 'clinicPhone']
  },

  // Lab result notifications
  'lab-results-ready': {
    id: 'lab-results-ready',
    type: 'email',
    subject: 'Lab Results Available - \{\{clinicName\}\}',
    body: `Dear \{\{patientName\}\},

Your lab results from \{\{labOrderDate\}\} are now available.

Lab Order: \{\{labOrderId\}\}
Tests: \{\{testNames\}\}

You can view your results in the patient portal or contact us for more information.

Best regards,
\{\{clinicName\}\}`,
    variables: ['patientName', 'labOrderDate', 'labOrderId', 'testNames', 'clinicName']
  },

  'lab-results-critical': {
    id: 'lab-results-critical',
    type: 'email',
    subject: 'URGENT: Critical Lab Results - \{\{clinicName\}\}',
    body: `Dear \{\{patientName\}\},

Your recent lab results require immediate attention.

Lab Order: \{\{labOrderId\}\}
Critical Tests: \{\{criticalTests\}\}

Please contact us immediately at \{\{clinicPhone\}\} or visit the emergency room if symptoms are severe.

Best regards,
\{\{clinicName\}\}`,
    variables: ['patientName', 'labOrderId', 'criticalTests', 'clinicName', 'clinicPhone']
  },

  // Billing notifications
  'invoice-generated': {
    id: 'invoice-generated',
    type: 'email',
    subject: 'Invoice Generated - \{\{clinicName\}\}',
    body: `Dear \{\{patientName\}\},

An invoice has been generated for your recent visit.

Invoice: \{\{invoiceId\}\}
Amount: $\{\{totalAmount\}\}
Due Date: \{\{dueDate\}\}

You can view and pay your invoice in the patient portal.

Best regards,
\{\{clinicName\}\}`,
    variables: ['patientName', 'invoiceId', 'totalAmount', 'dueDate', 'clinicName']
  },

  'payment-received': {
    id: 'payment-received',
    type: 'email',
    subject: 'Payment Received - \{\{clinicName\}\}',
    body: `Dear \{\{patientName\}\},

We have received your payment.

Invoice: \{\{invoiceId\}\}
Amount Paid: $\{\{amountPaid\}\}
Payment Method: \{\{paymentMethod\}\}
Date: \{\{paymentDate\}\}

Thank you for your payment.

Best regards,
\{\{clinicName\}\}`,
    variables: ['patientName', 'invoiceId', 'amountPaid', 'paymentMethod', 'paymentDate', 'clinicName']
  },

  'payment-overdue': {
    id: 'payment-overdue',
    type: 'email',
    subject: 'Payment Overdue - \{\{clinicName\}\}',
    body: `Dear \{\{patientName\}\},

Your payment is now overdue.

Invoice: \{\{invoiceId\}\}
Amount: $\{\{totalAmount\}\}
Due Date: \{\{dueDate\}\}
Days Overdue: \{\{daysOverdue\}\}

Please make payment as soon as possible to avoid additional charges.

Best regards,
\{\{clinicName\}\}`,
    variables: ['patientName', 'invoiceId', 'totalAmount', 'dueDate', 'daysOverdue', 'clinicName']
  },

  // Queue notifications
  'queue-update': {
    id: 'queue-update',
    type: 'sms',
    body: 'Your position in the queue has been updated. Current position: \{\{position\}\}. Estimated wait time: \{\{waitTime\}\} minutes.',
    variables: ['position', 'waitTime']
  },

  'doctor-ready': {
    id: 'doctor-ready',
    type: 'sms',
    body: 'Dr. \{\{doctorName\}\} is ready to see you. Please proceed to \{\{roomNumber\}\}.',
    variables: ['doctorName', 'roomNumber']
  }
};

// Email service (mock implementation)
export class EmailService {
  static async sendEmail(to: string | string[], subject: string, body: string): Promise<boolean> {
    // In a real implementation, this would integrate with services like:
    // - SendGrid
    // - AWS SES
    // - Mailgun
    // - Nodemailer with SMTP
    
    console.log('📧 EMAIL SENT:');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Body:', body);
    console.log('---');
    
    // Mock success
    return true;
  }
}

// SMS service (mock implementation)
export class SMSService {
  static async sendSMS(to: string, message: string): Promise<boolean> {
    // In a real implementation, this would integrate with services like:
    // - Twilio
    // - AWS SNS
    // - Vonage
    
    console.log('📱 SMS SENT:');
    console.log('To:', to);
    console.log('Message:', message);
    console.log('---');
    
    // Mock success
    return true;
  }
}

// In-app notification service
export class InAppNotificationService {
  static async createNotification(
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    data?: Record<string, unknown>
  ): Promise<boolean> {
    // In a real implementation, this would:
    // - Store notification in database
    // - Send via WebSocket/SSE
    // - Integrate with push notifications
    
    console.log('🔔 IN-APP NOTIFICATION:');
    console.log('User:', userId);
    console.log('Title:', title);
    console.log('Message:', message);
    console.log('Type:', type);
    console.log('Data:', data);
    console.log('---');
    
    // Mock success
    return true;
  }
}

// Main notification service
export class NotificationService {
  static async sendNotification(data: NotificationData): Promise<boolean> {
    const template = NOTIFICATION_TEMPLATES[data.template];
    
    if (!template) {
      console.error('Notification template not found:', data.template);
      return false;
    }

    // Replace variables in template
    let processedSubject = template.subject || '';
    let processedBody = template.body;
    
    Object.entries(data.variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), value);
      processedBody = processedBody.replace(new RegExp(placeholder, 'g'), value);
    });

    try {
      switch (template.type) {
        case 'email':
          return await EmailService.sendEmail(data.to as string, processedSubject, processedBody);
        case 'sms':
          return await SMSService.sendSMS(data.to as string, processedBody);
        case 'in-app':
          return await InAppNotificationService.createNotification(
            data.to as string,
            processedSubject,
            processedBody,
            'info',
            data.variables
          );
        default:
          console.error('Unknown notification type:', template.type);
          return false;
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  // Convenience methods for common notifications
  static async sendAppointmentScheduled(
    patientEmail: string,
    patientName: string,
    appointmentData: {
      date: string;
      time: string;
      doctorName: string;
      type: string;
      reason: string;
    }
  ): Promise<boolean> {
    return this.sendNotification({
      to: patientEmail,
      template: 'appointment-scheduled',
      variables: {
        patientName,
        appointmentDate: appointmentData.date,
        appointmentTime: appointmentData.time,
        doctorName: appointmentData.doctorName,
        appointmentType: appointmentData.type,
        reason: appointmentData.reason,
        clinicName: 'HealthCare Clinic',
        clinicPhone: '(555) 123-4567'
      }
    });
  }

  static async sendLabResultsReady(
    patientEmail: string,
    patientName: string,
    labData: {
      orderId: string;
      orderDate: string;
      testNames: string;
    }
  ): Promise<boolean> {
    return this.sendNotification({
      to: patientEmail,
      template: 'lab-results-ready',
      variables: {
        patientName,
        labOrderDate: labData.orderDate,
        labOrderId: labData.orderId,
        testNames: labData.testNames,
        clinicName: 'HealthCare Clinic'
      }
    });
  }

  static async sendInvoiceGenerated(
    patientEmail: string,
    patientName: string,
    invoiceData: {
      invoiceId: string;
      totalAmount: number;
      dueDate: string;
    }
  ): Promise<boolean> {
    return this.sendNotification({
      to: patientEmail,
      template: 'invoice-generated',
      variables: {
        patientName,
        invoiceId: invoiceData.invoiceId,
        totalAmount: invoiceData.totalAmount.toString(),
        dueDate: invoiceData.dueDate,
        clinicName: 'HealthCare Clinic'
      }
    });
  }

  static async sendPaymentReceived(
    patientEmail: string,
    patientName: string,
    paymentData: {
      invoiceId: string;
      amountPaid: number;
      paymentMethod: string;
      paymentDate: string;
    }
  ): Promise<boolean> {
    return this.sendNotification({
      to: patientEmail,
      template: 'payment-received',
      variables: {
        patientName,
        invoiceId: paymentData.invoiceId,
        amountPaid: paymentData.amountPaid.toString(),
        paymentMethod: paymentData.paymentMethod,
        paymentDate: paymentData.paymentDate,
        clinicName: 'HealthCare Clinic'
      }
    });
  }
}