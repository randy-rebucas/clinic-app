// Demo mode utilities for when Firebase is not configured
export const isDemoMode = () => {
  return process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "demo-api-key" || 
         !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
};

export const createDemoEmployee = () => ({
  id: 'demo-employee-1',
  name: 'Demo Employee',
  email: 'demo@localpro.com',
  role: 'employee' as const,
  department: 'Engineering',
  position: 'Software Developer',
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const createDemoAdmin = () => ({
  id: 'demo-admin-1',
  name: 'Demo Admin',
  email: 'admin@localpro.com',
  role: 'admin' as const,
  department: 'HR',
  position: 'HR Manager',
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const createDemoTimeEntry = (type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end', notes?: string) => ({
  id: `demo-entry-${Date.now()}`,
  employeeId: 'demo-employee-1',
  type,
  timestamp: new Date(),
  notes,
  location: 'Office',
});

export const createDemoWorkSession = () => ({
  id: 'demo-session-1',
  employeeId: 'demo-employee-1',
  clockInTime: new Date(),
  totalBreakTime: 0,
  totalWorkTime: 0,
  status: 'active' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const createDemoBreakSession = () => ({
  id: 'demo-break-1',
  workSessionId: 'demo-session-1',
  startTime: new Date(),
  status: 'active' as const,
  notes: 'Demo break session',
});