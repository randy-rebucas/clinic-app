import { Server as NetServer } from 'http';
import { NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export interface SocketEvents {
  // Queue events
  'queue:updated': (data: { queue: Record<string, unknown>[] }) => void;
  'queue:patient-added': (data: { patient: Record<string, unknown>; position: number }) => void;
  'queue:patient-removed': (data: { patientId: string }) => void;
  'queue:status-changed': (data: { patientId: string; status: string }) => void;
  
  // Appointment events
  'appointment:created': (data: { appointment: Record<string, unknown> }) => void;
  'appointment:updated': (data: { appointment: Record<string, unknown> }) => void;
  'appointment:cancelled': (data: { appointmentId: string }) => void;
  
  // Prescription events
  'prescription:created': (data: { prescription: Record<string, unknown> }) => void;
  'prescription:status-changed': (data: { prescriptionId: string; status: string }) => void;
  'prescription:delivered': (data: { prescriptionId: string; deliveredBy: string }) => void;
  
  // Lab order events
  'lab-order:created': (data: { labOrder: Record<string, unknown> }) => void;
  'lab-order:status-changed': (data: { labOrderId: string; status: string }) => void;
  'lab-order:results-ready': (data: { labOrderId: string; results: Record<string, unknown> }) => void;
  
  // Billing events
  'invoice:created': (data: { invoice: Record<string, unknown> }) => void;
  'payment:processed': (data: { payment: Record<string, unknown>; invoiceId: string }) => void;
  
  // Notification events
  'notification:new': (data: { 
    userId: string; 
    type: string; 
    message: string; 
    data?: Record<string, unknown> 
  }) => void;
  
  // System events
  'system:maintenance': (data: { message: string; scheduledTime?: string }) => void;
  'system:alert': (data: { level: 'info' | 'warning' | 'error'; message: string }) => void;
}

export interface ClientToServerEvents {
  // Authentication
  'auth:join': (data: { userId: string; role: string }) => void;
  'auth:leave': () => void;
  
  // Queue management
  'queue:join-room': (data: { room: string }) => void;
  'queue:leave-room': (data: { room: string }) => void;
  'queue:call-patient': (data: { patientId: string; doctorId: string }) => void;
  'queue:complete-patient': (data: { patientId: string; doctorId: string }) => void;
  
  // Real-time updates
  'subscribe:appointments': (data: { doctorId?: string; date?: string }) => void;
  'subscribe:prescriptions': (data: { doctorId?: string; status?: string }) => void;
  'subscribe:lab-orders': (data: { doctorId?: string; status?: string }) => void;
  'subscribe:notifications': (data: { userId: string }) => void;
  
  // Unsubscribe
  'unsubscribe:appointments': () => void;
  'unsubscribe:prescriptions': () => void;
  'unsubscribe:lab-orders': () => void;
  'unsubscribe:notifications': () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId?: string;
  role?: string;
  rooms?: string[];
}

export class SocketManager {
  private static instance: SocketManager;
  private io: SocketIOServer | null = null;

  private constructor() {}

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public initialize(server: NetServer): SocketIOServer {
    if (this.io) {
      return this.io;
    }

    this.io = new SocketIOServer<
      ClientToServerEvents,
      SocketEvents,
      InterServerEvents,
      SocketData
    >(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXTAUTH_URL 
          : "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      path: '/api/socketio'
    });

    this.setupEventHandlers();
    return this.io;
  }

  private setupEventHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Authentication
      socket.on('auth:join', (data) => {
        socket.data.userId = data.userId;
        socket.data.role = data.role;
        
        // Join role-based rooms
        socket.join(`role:${data.role}`);
        socket.join(`user:${data.userId}`);
        
        console.log(`User ${data.userId} (${data.role}) joined`);
      });

      // Queue management
      socket.on('queue:join-room', (data) => {
        socket.join(`queue:${data.room}`);
        socket.data.rooms = socket.data.rooms || [];
        socket.data.rooms.push(`queue:${data.room}`);
      });

      socket.on('queue:leave-room', (data) => {
        socket.leave(`queue:${data.room}`);
        socket.data.rooms = socket.data.rooms?.filter((room: string) => room !== `queue:${data.room}`);
      });

      socket.on('queue:call-patient', (data) => {
        // Broadcast to all users in the queue room
        socket.to(`queue:${data.doctorId}`).emit('queue:status-changed', {
          patientId: data.patientId,
          status: 'called'
        });
      });

      socket.on('queue:complete-patient', (data) => {
        // Broadcast to all users in the queue room
        socket.to(`queue:${data.doctorId}`).emit('queue:status-changed', {
          patientId: data.patientId,
          status: 'completed'
        });
      });

      // Subscription management
      socket.on('subscribe:appointments', (data) => {
        const room = data.doctorId ? `appointments:${data.doctorId}` : 'appointments:all';
        socket.join(room);
      });

      socket.on('subscribe:prescriptions', (data) => {
        const room = data.doctorId ? `prescriptions:${data.doctorId}` : 'prescriptions:all';
        socket.join(room);
      });

      socket.on('subscribe:lab-orders', (data) => {
        const room = data.doctorId ? `lab-orders:${data.doctorId}` : 'lab-orders:all';
        socket.join(room);
      });

      socket.on('subscribe:notifications', (data) => {
        socket.join(`notifications:${data.userId}`);
      });

      // Unsubscribe handlers
      socket.on('unsubscribe:appointments', () => {
        socket.rooms.forEach(room => {
          if (room.startsWith('appointments:')) {
            socket.leave(room);
          }
        });
      });

      socket.on('unsubscribe:prescriptions', () => {
        socket.rooms.forEach(room => {
          if (room.startsWith('prescriptions:')) {
            socket.leave(room);
          }
        });
      });

      socket.on('unsubscribe:lab-orders', () => {
        socket.rooms.forEach(room => {
          if (room.startsWith('lab-orders:')) {
            socket.leave(room);
          }
        });
      });

      socket.on('unsubscribe:notifications', () => {
        socket.rooms.forEach(room => {
          if (room.startsWith('notifications:')) {
            socket.leave(room);
          }
        });
      });

      // Disconnect
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  public getIO(): SocketIOServer | null {
    return this.io;
  }

  // Event broadcasting methods
  public broadcastQueueUpdate(queue: Record<string, unknown>[]) {
    if (this.io) {
      this.io.emit('queue:updated', { queue });
    }
  }

  public broadcastPatientAdded(patient: Record<string, unknown>, position: number) {
    if (this.io) {
      this.io.emit('queue:patient-added', { patient, position });
    }
  }

  public broadcastPatientRemoved(patientId: string) {
    if (this.io) {
      this.io.emit('queue:patient-removed', { patientId });
    }
  }

  public broadcastAppointmentCreated(appointment: Record<string, unknown>) {
    if (this.io) {
      this.io.emit('appointment:created', { appointment });
    }
  }

  public broadcastPrescriptionCreated(prescription: Record<string, unknown>) {
    if (this.io) {
      this.io.emit('prescription:created', { prescription });
    }
  }

  public broadcastLabOrderCreated(labOrder: Record<string, unknown>) {
    if (this.io) {
      this.io.emit('lab-order:created', { labOrder });
    }
  }

  public broadcastNotification(userId: string, type: string, message: string, data?: Record<string, unknown>) {
    if (this.io) {
      this.io.to(`notifications:${userId}`).emit('notification:new', {
        userId,
        type,
        message,
        data
      });
    }
  }

  public broadcastSystemAlert(level: 'info' | 'warning' | 'error', message: string) {
    if (this.io) {
      this.io.emit('system:alert', { level, message });
    }
  }
}
