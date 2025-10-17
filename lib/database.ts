import connectDB from './mongodb';
import { 
  Employee, IEmployee,
  TimeEntry, ITimeEntry,
  WorkSession, IWorkSession,
  BreakSession, IBreakSession,
  DailySummary, IDailySummary,
  WeeklySummary, IWeeklySummary,
  AttendanceReport, IAttendanceReport,
  IdleSettings, IIdleSettings,
  IdleSession, IIdleSession,
  ApplicationActivity, IApplicationActivity,
  ApplicationTrackingSettings, IApplicationTrackingSettings,
  WebsiteActivity, IWebsiteActivity,
  WebsiteTrackingSettings, IWebsiteTrackingSettings,
  ScreenCapture, IScreenCapture,
  ScreenCaptureSettings, IScreenCaptureSettings,
  AttendanceRecord, IAttendanceRecord,
  PunchRecord, IPunchRecord,
  AttendanceSettings, IAttendanceSettings
} from './models';

import { Types } from 'mongoose';

// Employee Management
export const createEmployee = async (employeeData: {
  name: string;
  email: string;
  password: string;
  role: 'employee' | 'admin';
  department?: string;
  position?: string;
}) => {
  await connectDB();
  
  const employee = new Employee(employeeData);
  const savedEmployee = await employee.save();
  return savedEmployee._id.toString();
};

export const getEmployee = async (employeeId: string): Promise<IEmployee | null> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(employeeId)) {
    return null;
  }
  
  const employee = await Employee.findById(employeeId);
  return employee;
};

export const getEmployeeByEmail = async (email: string): Promise<IEmployee | null> => {
  await connectDB();
  
  const employee = await Employee.findOne({ email });
  return employee;
};

export const getAllEmployees = async (): Promise<IEmployee[]> => {
  await connectDB();
  
  const employees = await Employee.find({}).sort({ name: 1 });
  return employees;
};

export const updateEmployee = async (employeeId: string, updates: Partial<IEmployee>) => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(employeeId)) {
    throw new Error('Invalid employee ID');
  }
  
  await Employee.findByIdAndUpdate(employeeId, updates, { new: true });
};

// Time Entry Management
export const createTimeEntry = async (timeEntryData: Omit<ITimeEntry, '_id'>) => {
  await connectDB();
  
  const timeEntry = new TimeEntry(timeEntryData);
  const savedTimeEntry = await timeEntry.save();
  return savedTimeEntry._id.toString();
};

export const getTimeEntries = async (employeeId: string, startDate?: Date, endDate?: Date) => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(employeeId)) {
    return [];
  }
  
  const query: { employeeId: Types.ObjectId; timestamp?: { $gte?: Date; $lte?: Date } } = { employeeId: new Types.ObjectId(employeeId) };
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = startDate;
    if (endDate) query.timestamp.$lte = endDate;
  }
  
  const timeEntries = await TimeEntry.find(query)
    .sort({ timestamp: -1 })
    .populate('employeeId', 'name email');
    
  return timeEntries;
};

// Work Session Management
export const createWorkSession = async (workSessionData: Omit<IWorkSession, '_id' | 'createdAt' | 'updatedAt'>) => {
  await connectDB();
  
  const workSession = new WorkSession(workSessionData);
  const savedWorkSession = await workSession.save();
  return savedWorkSession._id.toString();
};

export const updateWorkSession = async (sessionId: string, updates: Partial<IWorkSession>) => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(sessionId)) {
    throw new Error('Invalid session ID');
  }
  
  await WorkSession.findByIdAndUpdate(sessionId, updates, { new: true });
};

export const getActiveWorkSession = async (employeeId: string): Promise<IWorkSession | null> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(employeeId)) {
    return null;
  }
  
  const workSession = await WorkSession.findOne({
    employeeId: new Types.ObjectId(employeeId),
    status: 'active'
  }).populate('employeeId', 'name email');
  
  return workSession;
};

export const getWorkSession = async (sessionId: string): Promise<IWorkSession | null> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(sessionId)) {
    return null;
  }
  
  const workSession = await WorkSession.findById(sessionId)
    .populate('employeeId', 'name email');
    
  return workSession;
};

// Break Session Management
export const createBreakSession = async (breakSessionData: Omit<IBreakSession, '_id'>) => {
  await connectDB();
  
  const breakSession = new BreakSession(breakSessionData);
  const savedBreakSession = await breakSession.save();
  return savedBreakSession._id.toString();
};

export const updateBreakSession = async (breakId: string, updates: Partial<IBreakSession>) => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(breakId)) {
    throw new Error('Invalid break ID');
  }
  
  await BreakSession.findByIdAndUpdate(breakId, updates, { new: true });
};

export const getActiveBreakSession = async (workSessionId: string): Promise<IBreakSession | null> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(workSessionId)) {
    return null;
  }
  
  const breakSession = await BreakSession.findOne({
    workSessionId: new Types.ObjectId(workSessionId),
    status: 'active'
  });
  
  return breakSession;
};

// Daily Summary Management
export const createDailySummary = async (dailySummaryData: Omit<IDailySummary, '_id'>) => {
  await connectDB();
  
  const dailySummary = new DailySummary(dailySummaryData);
  const savedDailySummary = await dailySummary.save();
  return savedDailySummary._id.toString();
};

export const updateDailySummary = async (summaryId: string, updates: Partial<IDailySummary>) => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(summaryId)) {
    throw new Error('Invalid summary ID');
  }
  
  await DailySummary.findByIdAndUpdate(summaryId, updates, { new: true });
};

export const getDailySummary = async (employeeId: string, date: string): Promise<IDailySummary | null> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(employeeId)) {
    return null;
  }
  
  const dailySummary = await DailySummary.findOne({
    employeeId: new Types.ObjectId(employeeId),
    date: date
  }).populate('workSessions');
  
  return dailySummary;
};

// Weekly Summary Management
export const createWeeklySummary = async (weeklySummaryData: Omit<IWeeklySummary, '_id'>) => {
  await connectDB();
  
  const weeklySummary = new WeeklySummary(weeklySummaryData);
  const savedWeeklySummary = await weeklySummary.save();
  return savedWeeklySummary._id.toString();
};

export const getWeeklySummary = async (employeeId: string, weekStart: string): Promise<IWeeklySummary | null> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(employeeId)) {
    return null;
  }
  
  const weeklySummary = await WeeklySummary.findOne({
    employeeId: new Types.ObjectId(employeeId),
    weekStart: weekStart
  }).populate('dailySummaries');
  
  return weeklySummary;
};

// Report Generation
export const generateAttendanceReport = async (
  employeeId: string | null,
  startDate: string,
  endDate: string,
  generatedBy: string
): Promise<IAttendanceReport> => {
  await connectDB();
  
  const query: { date: { $gte: Date; $lte: Date }; employeeId?: Types.ObjectId } = {
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };
  
  if (employeeId && Types.ObjectId.isValid(employeeId)) {
    query.employeeId = new Types.ObjectId(employeeId);
  }
  
  const summaries = await DailySummary.find(query);
  
  const totalWorkTime = summaries.reduce((sum, summary) => sum + summary.totalWorkTime, 0);
  const totalBreakTime = summaries.reduce((sum, summary) => sum + summary.totalBreakTime, 0);
  const workDays = summaries.length;
  const averageWorkTime = workDays > 0 ? totalWorkTime / workDays : 0;
  const overtime = summaries.reduce((sum, summary) => sum + (summary.overtime || 0), 0);
  
  const report = new AttendanceReport({
    employeeId: employeeId ? new Types.ObjectId(employeeId) : undefined,
    startDate,
    endDate,
    totalWorkTime,
    totalBreakTime,
    workDays,
    averageWorkTime,
    overtime,
    generatedAt: new Date(),
    generatedBy: new Types.ObjectId(generatedBy),
  });
  
  const savedReport = await report.save();
  return savedReport;
};

// Idle Settings Management
export const createIdleSettings = async (idleSettingsData: Omit<IIdleSettings, '_id' | 'createdAt' | 'updatedAt'>) => {
  await connectDB();
  
  const idleSettings = new IdleSettings(idleSettingsData);
  const savedIdleSettings = await idleSettings.save();
  return savedIdleSettings._id.toString();
};

export const updateIdleSettings = async (settingsId: string, updates: Partial<IIdleSettings>) => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(settingsId)) {
    throw new Error('Invalid settings ID');
  }
  
  await IdleSettings.findByIdAndUpdate(settingsId, updates, { new: true });
};

export const getIdleSettings = async (employeeId: string): Promise<IIdleSettings | null> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(employeeId)) {
    return null;
  }
  
  const idleSettings = await IdleSettings.findOne({
    employeeId: new Types.ObjectId(employeeId)
  });
  
  return idleSettings;
};

// Idle Session Management
export const createIdleSession = async (idleSessionData: Omit<IIdleSession, '_id'>) => {
  await connectDB();
  
  const idleSession = new IdleSession(idleSessionData);
  const savedIdleSession = await idleSession.save();
  return savedIdleSession._id.toString();
};

export const updateIdleSession = async (sessionId: string, updates: Partial<IIdleSession>) => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(sessionId)) {
    throw new Error('Invalid session ID');
  }
  
  await IdleSession.findByIdAndUpdate(sessionId, updates, { new: true });
};

export const getActiveIdleSession = async (workSessionId: string): Promise<IIdleSession | null> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(workSessionId)) {
    return null;
  }
  
  const idleSession = await IdleSession.findOne({
    workSessionId: new Types.ObjectId(workSessionId),
    status: 'active'
  });
  
  return idleSession;
};

export const getIdleSessions = async (employeeId: string, startDate?: Date, endDate?: Date) => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(employeeId)) {
    return [];
  }
  
  const query: Record<string, unknown> = {
    employeeId: new Types.ObjectId(employeeId)
  };
  
  if (startDate && endDate) {
    query.startTime = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  const idleSessions = await IdleSession.find(query).sort({ startTime: -1 });
  
  return idleSessions;
};

// Application Activity Management
export const createApplicationActivity = async (activityData: Omit<IApplicationActivity, '_id' | 'createdAt' | 'updatedAt'>) => {
  await connectDB();
  
  const activity = new ApplicationActivity(activityData);
  const savedActivity = await activity.save();
  return { id: savedActivity._id.toString(), ...activityData, createdAt: new Date(), updatedAt: new Date() };
};

export const updateApplicationActivity = async (activityId: string, updates: Partial<IApplicationActivity>) => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(activityId)) {
    throw new Error('Invalid activity ID');
  }
  
  await ApplicationActivity.findByIdAndUpdate(activityId, updates, { new: true });
};

export const getApplicationActivities = async (workSessionId: string): Promise<IApplicationActivity[]> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(workSessionId)) {
    return [];
  }
  
  const activities = await ApplicationActivity.find({
    workSessionId: new Types.ObjectId(workSessionId)
  }).sort({ startTime: 1 });
  
  return activities;
};

export const getActiveApplicationActivity = async (workSessionId: string): Promise<IApplicationActivity | null> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(workSessionId)) {
    return null;
  }
  
  const activity = await ApplicationActivity.findOne({
    workSessionId: new Types.ObjectId(workSessionId),
    isActive: true
  });
  
  return activity;
};

// Application Tracking Settings Management
export const createApplicationTrackingSettings = async (settingsData: Omit<IApplicationTrackingSettings, '_id' | 'createdAt' | 'updatedAt'>) => {
  await connectDB();
  
  const settings = new ApplicationTrackingSettings(settingsData);
  const savedSettings = await settings.save();
  return { id: savedSettings._id.toString(), ...settingsData, createdAt: new Date(), updatedAt: new Date() };
};

export const updateApplicationTrackingSettings = async (settingsId: string, updates: Partial<IApplicationTrackingSettings>) => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(settingsId)) {
    throw new Error('Invalid settings ID');
  }
  
  await ApplicationTrackingSettings.findByIdAndUpdate(settingsId, updates, { new: true });
};

export const getApplicationTrackingSettings = async (employeeId: string): Promise<IApplicationTrackingSettings | null> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(employeeId)) {
    return null;
  }
  
  const settings = await ApplicationTrackingSettings.findOne({
    employeeId: new Types.ObjectId(employeeId)
  });
  
  return settings;
};

// Website Activity Management
export const createWebsiteActivity = async (activityData: Omit<IWebsiteActivity, '_id' | 'createdAt' | 'updatedAt'>) => {
  await connectDB();
  
  const activity = new WebsiteActivity(activityData);
  const savedActivity = await activity.save();
  return { id: savedActivity._id.toString(), ...activityData, createdAt: new Date(), updatedAt: new Date() };
};

export const updateWebsiteActivity = async (activityId: string, updates: Partial<IWebsiteActivity>) => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(activityId)) {
    throw new Error('Invalid activity ID');
  }
  
  await WebsiteActivity.findByIdAndUpdate(activityId, updates, { new: true });
};

export const getWebsiteActivities = async (workSessionId: string): Promise<IWebsiteActivity[]> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(workSessionId)) {
    return [];
  }
  
  const activities = await WebsiteActivity.find({
    workSessionId: new Types.ObjectId(workSessionId)
  }).sort({ startTime: 1 });
  
  return activities;
};

export const getActiveWebsiteActivity = async (workSessionId: string): Promise<IWebsiteActivity | null> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(workSessionId)) {
    return null;
  }
  
  const activity = await WebsiteActivity.findOne({
    workSessionId: new Types.ObjectId(workSessionId),
    isActive: true
  });
  
  return activity;
};

// Website Tracking Settings Management
export const createWebsiteTrackingSettings = async (settingsData: Omit<IWebsiteTrackingSettings, '_id' | 'createdAt' | 'updatedAt'>) => {
  await connectDB();
  
  const settings = new WebsiteTrackingSettings(settingsData);
  const savedSettings = await settings.save();
  return { id: savedSettings._id.toString(), ...settingsData, createdAt: new Date(), updatedAt: new Date() };
};

export const updateWebsiteTrackingSettings = async (settingsId: string, updates: Partial<IWebsiteTrackingSettings>) => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(settingsId)) {
    throw new Error('Invalid settings ID');
  }
  
  await WebsiteTrackingSettings.findByIdAndUpdate(settingsId, updates, { new: true });
};

export const getWebsiteTrackingSettings = async (employeeId: string): Promise<IWebsiteTrackingSettings | null> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(employeeId)) {
    return null;
  }
  
  const settings = await WebsiteTrackingSettings.findOne({
    employeeId: new Types.ObjectId(employeeId)
  });
  
  return settings;
};

// Screen Capture Settings Management
export const createScreenCaptureSettings = async (settingsData: Omit<IScreenCaptureSettings, '_id' | 'createdAt' | 'updatedAt'>) => {
  await connectDB();
  
  const settings = new ScreenCaptureSettings(settingsData);
  const savedSettings = await settings.save();
  return { id: savedSettings._id.toString(), ...settingsData, createdAt: new Date(), updatedAt: new Date() };
};

export const updateScreenCaptureSettings = async (settingsId: string, updates: Partial<IScreenCaptureSettings>) => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(settingsId)) {
    throw new Error('Invalid settings ID');
  }
  
  await ScreenCaptureSettings.findByIdAndUpdate(settingsId, updates, { new: true });
};

export const getScreenCaptureSettings = async (employeeId: string): Promise<IScreenCaptureSettings | null> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(employeeId)) {
    return null;
  }
  
  const settings = await ScreenCaptureSettings.findOne({
    employeeId: new Types.ObjectId(employeeId)
  });
  
  return settings;
};

export const getAllScreenCaptureSettings = async (): Promise<IScreenCaptureSettings[]> => {
  await connectDB();
  
  const settings = await ScreenCaptureSettings.find()
    .sort({ updatedAt: -1 });
  
  return settings;
};

// Screen Capture Management
export const createScreenCapture = async (captureData: {
  employeeId: string;
  workSessionId?: string;
  timestamp: Date;
  imageData: string;
  thumbnail: string;
  fileSize: number;
  isActive: boolean;
}) => {
  await connectDB();
  
  const capture = new ScreenCapture(captureData);
  const savedCapture = await capture.save();
  return { 
    id: savedCapture._id.toString(), 
    ...captureData,
    _id: savedCapture._id
  };
};

export const getScreenCaptures = async (employeeId: string, startDate?: Date, endDate?: Date): Promise<IScreenCapture[]> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(employeeId)) {
    return [];
  }
  
  const query: Record<string, unknown> = {
    employeeId: new Types.ObjectId(employeeId)
  };
  
  if (startDate && endDate) {
    query.timestamp = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  const captures = await ScreenCapture.find(query)
    .sort({ timestamp: -1 });
  
  return captures;
};

// Attendance Management
export const createAttendanceRecord = async (recordData: Omit<IAttendanceRecord, '_id' | 'createdAt' | 'updatedAt'>) => {
  await connectDB();
  
  const record = new AttendanceRecord(recordData);
  const savedRecord = await record.save();
  return { 
    id: savedRecord._id.toString(), 
    ...recordData, 
    createdAt: new Date(), 
    updatedAt: new Date() 
  };
};

export const updateAttendanceRecord = async (recordId: string, updates: Partial<IAttendanceRecord>) => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(recordId)) {
    throw new Error('Invalid record ID');
  }
  
  const updatedRecord = await AttendanceRecord.findByIdAndUpdate(recordId, updates, { new: true });
  if (!updatedRecord) {
    throw new Error('Attendance record not found');
  }
  
  return {
    id: updatedRecord._id.toString(),
    ...updatedRecord.toObject(),
    createdAt: updatedRecord.createdAt,
    updatedAt: updatedRecord.updatedAt,
  };
};

export const getAttendanceRecord = async (employeeId: string, date: Date): Promise<IAttendanceRecord | null> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(employeeId)) {
    return null;
  }
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const record = await AttendanceRecord.findOne({
    employeeId: new Types.ObjectId(employeeId),
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  });
  
  return record;
};

export const getAttendanceRecords = async (employeeId: string, startDate: Date, endDate: Date): Promise<IAttendanceRecord[]> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(employeeId)) {
    return [];
  }
  
  const records = await AttendanceRecord.find({
    employeeId: new Types.ObjectId(employeeId),
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: 1 });
  
  return records;
};

// Punch Record Management
export const createPunchRecord = async (recordData: Omit<IPunchRecord, '_id' | 'createdAt'>) => {
  await connectDB();
  
  const record = new PunchRecord(recordData);
  const savedRecord = await record.save();
  return { 
    id: savedRecord._id.toString(), 
    ...recordData, 
    createdAt: new Date() 
  };
};

export const getPunchRecords = async (employeeId: string, startDate: Date, endDate: Date): Promise<IPunchRecord[]> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(employeeId)) {
    return [];
  }
  
  const records = await PunchRecord.find({
    employeeId: new Types.ObjectId(employeeId),
    punchTime: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ punchTime: 1 });
  
  return records;
};

// Attendance Settings Management
export const createAttendanceSettings = async (settingsData: Omit<IAttendanceSettings, '_id' | 'createdAt' | 'updatedAt'>) => {
  await connectDB();
  
  const settings = new AttendanceSettings(settingsData);
  const savedSettings = await settings.save();
  return { id: savedSettings._id.toString(), ...settingsData, createdAt: new Date(), updatedAt: new Date() };
};

export const updateAttendanceSettings = async (employeeId: string, updates: Partial<IAttendanceSettings>) => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(employeeId)) {
    throw new Error('Invalid employee ID');
  }
  
  const settings = await AttendanceSettings.findOneAndUpdate(
    { employeeId: new Types.ObjectId(employeeId) },
    updates,
    { new: true, upsert: true }
  );
  
  return settings;
};

export const getAttendanceSettings = async (employeeId: string): Promise<IAttendanceSettings | null> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(employeeId)) {
    return null;
  }
  
  const settings = await AttendanceSettings.findOne({
    employeeId: new Types.ObjectId(employeeId)
  });
  
  return settings;
};
