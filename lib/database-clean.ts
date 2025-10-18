import connectDB from './mongodb';
import { 
  IEmployee,
  TimeEntry, ITimeEntry,
  WorkSession, IWorkSession,
  BreakSession, IBreakSession,
  DailySummary, IDailySummary,
  WeeklySummary, IWeeklySummary,
  IdleSettings, IIdleSettings,
  IdleSession, IIdleSession,
  ApplicationActivity, IApplicationActivity,
  ApplicationTrackingSettings, IApplicationTrackingSettings,
  WebsiteActivity, IWebsiteActivity,
  WebsiteTrackingSettings, IWebsiteTrackingSettings,
  ScreenCaptureSettings, IScreenCaptureSettings,
} from './models';
import { Employee } from './models/Employee';
import { Types } from 'mongoose';

// Employee Management
export const createEmployee = async (employeeData: Omit<IEmployee, '_id' | 'createdAt' | 'updatedAt'>) => {
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
  
  // Use type assertion to bypass TypeScript compilation issues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const employee = await (Employee as any).findById(employeeId);
  return employee;
};

export const getEmployeeByEmail = async (email: string): Promise<IEmployee | null> => {
  await connectDB();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const employee = await (Employee as any).findOne({ email });
  return employee;
};

export const getAllEmployees = async (): Promise<IEmployee[]> => {
  await connectDB();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const employees = await (Employee as any).find({}).sort({ name: 1 });
  return employees;
};

export const updateEmployee = async (employeeId: string, updates: Partial<IEmployee>) => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(employeeId)) {
    throw new Error('Invalid employee ID');
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (Employee as any).findByIdAndUpdate(employeeId, updates, { new: true });
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
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const timeEntries = await (TimeEntry as any).find(query)
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
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (WorkSession as any).findByIdAndUpdate(sessionId, updates, { new: true });
};

export const getActiveWorkSession = async (employeeId: string): Promise<IWorkSession | null> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(employeeId)) {
    return null;
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const workSession = await (WorkSession as any).findOne({
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
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const workSession = await (WorkSession as any).findById(sessionId)
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
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (BreakSession as any).findByIdAndUpdate(breakId, updates, { new: true });
};

export const getActiveBreakSession = async (workSessionId: string): Promise<IBreakSession | null> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(workSessionId)) {
    return null;
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const breakSession = await (BreakSession as any).findOne({
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
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (DailySummary as any).findByIdAndUpdate(summaryId, updates, { new: true });
};

export const getDailySummary = async (employeeId: string, date: string): Promise<IDailySummary | null> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(employeeId)) {
    return null;
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dailySummary = await (DailySummary as any).findOne({
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
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const weeklySummary = await (WeeklySummary as any).findOne({
    employeeId: new Types.ObjectId(employeeId),
    weekStart: weekStart
  }).populate('dailySummaries');
  
  return weeklySummary;
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
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (IdleSettings as any).findByIdAndUpdate(settingsId, updates, { new: true });
};

export const getIdleSettings = async (employeeId: string): Promise<IIdleSettings | null> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(employeeId)) {
    return null;
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const idleSettings = await (IdleSettings as any).findOne({
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
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (IdleSession as any).findByIdAndUpdate(sessionId, updates, { new: true });
};

export const getActiveIdleSession = async (workSessionId: string): Promise<IIdleSession | null> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(workSessionId)) {
    return null;
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const idleSession = await (IdleSession as any).findOne({
    workSessionId: new Types.ObjectId(workSessionId),
    status: 'active'
  });
  
  return idleSession;
};

export const getIdleSessions = async (workSessionId: string) => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(workSessionId)) {
    return [];
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const idleSessions = await (IdleSession as any).find({
    workSessionId: new Types.ObjectId(workSessionId)
  }).sort({ startTime: -1 });
  
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
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (ApplicationActivity as any).findByIdAndUpdate(activityId, updates, { new: true });
};

export const getApplicationActivities = async (workSessionId: string): Promise<IApplicationActivity[]> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(workSessionId)) {
    return [];
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activities = await (ApplicationActivity as any).find({
    workSessionId: new Types.ObjectId(workSessionId)
  }).sort({ startTime: 1 });
  
  return activities;
};

export const getActiveApplicationActivity = async (workSessionId: string): Promise<IApplicationActivity | null> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(workSessionId)) {
    return null;
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activity = await (ApplicationActivity as any).findOne({
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
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (ApplicationTrackingSettings as any).findByIdAndUpdate(settingsId, updates, { new: true });
};

export const getApplicationTrackingSettings = async (employeeId: string): Promise<IApplicationTrackingSettings | null> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(employeeId)) {
    return null;
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings = await (ApplicationTrackingSettings as any).findOne({
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
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (WebsiteActivity as any).findByIdAndUpdate(activityId, updates, { new: true });
};

export const getWebsiteActivities = async (workSessionId: string): Promise<IWebsiteActivity[]> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(workSessionId)) {
    return [];
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activities = await (WebsiteActivity as any).find({
    workSessionId: new Types.ObjectId(workSessionId)
  }).sort({ startTime: 1 });
  
  return activities;
};

export const getActiveWebsiteActivity = async (workSessionId: string): Promise<IWebsiteActivity | null> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(workSessionId)) {
    return null;
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activity = await (WebsiteActivity as any).findOne({
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
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (WebsiteTrackingSettings as any).findByIdAndUpdate(settingsId, updates, { new: true });
};

export const getWebsiteTrackingSettings = async (employeeId: string): Promise<IWebsiteTrackingSettings | null> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(employeeId)) {
    return null;
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings = await (WebsiteTrackingSettings as any).findOne({
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
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (ScreenCaptureSettings as any).findByIdAndUpdate(settingsId, updates, { new: true });
};

export const getScreenCaptureSettings = async (employeeId: string): Promise<IScreenCaptureSettings | null> => {
  await connectDB();
  
  if (!Types.ObjectId.isValid(employeeId)) {
    return null;
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings = await (ScreenCaptureSettings as any).findOne({
    employeeId: new Types.ObjectId(employeeId)
  });
  
  return settings;
};

export const getAllScreenCaptureSettings = async (): Promise<IScreenCaptureSettings[]> => {
  await connectDB();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings = await (ScreenCaptureSettings as any).find()
    .sort({ updatedAt: -1 });
  
  return settings;
};

