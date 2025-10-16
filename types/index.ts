export interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'admin';
  department?: string;
  position?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end';
  timestamp: Date;
  notes?: string;
  location?: string;
  ipAddress?: string;
}

export interface WorkSession {
  id: string;
  employeeId: string;
  clockInTime: Date;
  clockOutTime?: Date;
  totalBreakTime: number; // in minutes
  totalWorkTime: number; // in minutes
  notes?: string;
  status: 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface BreakSession {
  id: string;
  workSessionId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  notes?: string;
  status: 'active' | 'completed';
}

export interface DailySummary {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD format
  totalWorkTime: number; // in minutes
  totalBreakTime: number; // in minutes
  clockInTime?: Date;
  clockOutTime?: Date;
  workSessions: string[]; // array of work session IDs
  status: 'incomplete' | 'complete';
  overtime?: number; // in minutes
}

export interface WeeklySummary {
  id: string;
  employeeId: string;
  weekStart: string; // YYYY-MM-DD format
  weekEnd: string; // YYYY-MM-DD format
  totalWorkTime: number; // in minutes
  totalBreakTime: number; // in minutes
  dailySummaries: string[]; // array of daily summary IDs
  averageWorkTime: number; // in minutes
  overtime: number; // in minutes
}

export interface AttendanceReport {
  id: string;
  employeeId?: string; // if null, report for all employees
  startDate: string;
  endDate: string;
  totalWorkTime: number;
  totalBreakTime: number;
  workDays: number;
  averageWorkTime: number;
  overtime: number;
  generatedAt: Date;
  generatedBy: string; // admin user ID
}

export interface NotificationSettings {
  id: string;
  employeeId: string;
  clockInReminder: boolean;
  clockOutReminder: boolean;
  breakReminder: boolean;
  overtimeAlert: boolean;
  reminderTime: number; // minutes before end of workday
  breakReminderTime: number; // minutes for break reminders
}
