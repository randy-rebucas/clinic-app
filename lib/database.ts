import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { isDemoMode } from './demoMode';
import { 
  Employee, 
  TimeEntry, 
  WorkSession, 
  BreakSession, 
  DailySummary, 
  WeeklySummary,
  AttendanceReport,
  IdleSettings,
  IdleSession
} from '@/types';
import { ApplicationActivity, ApplicationTrackingSettings } from './applicationTracking';
import { WebsiteActivity, WebsiteTrackingSettings } from './websiteTracking';
import { ScreenCaptureSettings } from './screenCapture';
import { AttendanceRecord, PunchRecord, AttendanceSettings } from './attendanceTracking';

// Employee Management
export const createEmployee = async (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (isDemoMode()) {
    // Demo mode - simulate creation
    return `demo-employee-${Date.now()}`;
  }

  // Filter out undefined values
  const cleanData = Object.fromEntries(
    Object.entries(employeeData).filter(([, value]) => value !== undefined)
  );

  const docRef = await addDoc(collection(db, 'employees'), {
    ...cleanData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getEmployee = async (employeeId: string): Promise<Employee | null> => {
  if (isDemoMode()) {
    // Demo mode - return null to simulate no existing employee
    return null;
  }

  const docRef = doc(db, 'employees', employeeId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Employee;
  }
  return null;
};

export const updateEmployee = async (employeeId: string, updates: Partial<Employee>) => {
  if (isDemoMode()) {
    // Demo mode - simulate update
    console.log('Demo: Updated employee', employeeId, updates);
    return;
  }

  // Filter out undefined values
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined)
  );

  const docRef = doc(db, 'employees', employeeId);
  await updateDoc(docRef, {
    ...cleanUpdates,
    updatedAt: serverTimestamp(),
  });
};

// Time Entry Management
export const createTimeEntry = async (timeEntryData: Omit<TimeEntry, 'id'>) => {
  if (isDemoMode()) {
    // Demo mode - simulate creation
    return `demo-entry-${Date.now()}`;
  }

  // Filter out undefined values
  const cleanData = Object.fromEntries(
    Object.entries(timeEntryData).filter(([, value]) => value !== undefined)
  );

  const docRef = await addDoc(collection(db, 'timeEntries'), {
    ...cleanData,
    timestamp: serverTimestamp(),
  });
  return docRef.id;
};

export const getTimeEntries = async (employeeId: string, startDate?: Date, endDate?: Date) => {
  if (isDemoMode()) {
    // Demo mode - return empty array to simulate no entries
    return [];
  }

  let q = query(
    collection(db, 'timeEntries'),
    where('employeeId', '==', employeeId),
    orderBy('timestamp', 'desc')
  );

  if (startDate) {
    q = query(q, where('timestamp', '>=', Timestamp.fromDate(startDate)));
  }
  if (endDate) {
    q = query(q, where('timestamp', '<=', Timestamp.fromDate(endDate)));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate() || new Date(),
  })) as TimeEntry[];
};

// Work Session Management
export const createWorkSession = async (workSessionData: Omit<WorkSession, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (isDemoMode()) {
    // Demo mode - simulate creation
    return `demo-session-${Date.now()}`;
  }

  // Filter out undefined values
  const cleanData = Object.fromEntries(
    Object.entries(workSessionData).filter(([, value]) => value !== undefined)
  );

  const docRef = await addDoc(collection(db, 'workSessions'), {
    ...cleanData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateWorkSession = async (sessionId: string, updates: Partial<WorkSession>) => {
  if (isDemoMode()) {
    // Demo mode - simulate update
    console.log('Demo: Updated work session', sessionId, updates);
    return;
  }

  // Filter out undefined values
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined)
  );

  const docRef = doc(db, 'workSessions', sessionId);
  await updateDoc(docRef, {
    ...cleanUpdates,
    updatedAt: serverTimestamp(),
  });
};

export const getActiveWorkSession = async (employeeId: string): Promise<WorkSession | null> => {
  if (isDemoMode()) {
    // Demo mode - simulate active session for demo user
    if (employeeId === 'demo-employee-1') {
      return {
        id: 'demo-session-1',
        employeeId: 'demo-employee-1',
        clockInTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        totalBreakTime: 30, // 30 minutes
        totalWorkTime: 90, // 90 minutes
        status: 'active',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(),
      };
    }
    return null;
  }

  const q = query(
    collection(db, 'workSessions'),
    where('employeeId', '==', employeeId),
    where('status', '==', 'active'),
    limit(1)
  );

  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      clockInTime: data.clockInTime?.toDate() || new Date(),
      clockOutTime: data.clockOutTime?.toDate(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as WorkSession;
  }
  return null;
};

export const getWorkSession = async (sessionId: string): Promise<WorkSession | null> => {
  if (isDemoMode()) {
    // Demo mode - simulate work session
    if (sessionId === 'demo-session-1') {
      return {
        id: 'demo-session-1',
        employeeId: 'demo-employee-1',
        clockInTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        totalBreakTime: 30, // 30 minutes
        totalWorkTime: 90, // 90 minutes
        status: 'active',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(),
      };
    }
    return null;
  }

  const docRef = doc(db, 'workSessions', sessionId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      clockInTime: data.clockInTime?.toDate() || new Date(),
      clockOutTime: data.clockOutTime?.toDate(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as WorkSession;
  }
  return null;
};

// Break Session Management
export const createBreakSession = async (breakSessionData: Omit<BreakSession, 'id'>) => {
  if (isDemoMode()) {
    // Demo mode - simulate creation
    return `demo-break-${Date.now()}`;
  }

  // Filter out undefined values
  const cleanData = Object.fromEntries(
    Object.entries(breakSessionData).filter(([, value]) => value !== undefined)
  );

  const docRef = await addDoc(collection(db, 'breakSessions'), cleanData);
  return docRef.id;
};

export const updateBreakSession = async (breakId: string, updates: Partial<BreakSession>) => {
  if (isDemoMode()) {
    // Demo mode - simulate update
    console.log('Demo: Updated break session', breakId, updates);
    return;
  }

  // Filter out undefined values
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined)
  );

  const docRef = doc(db, 'breakSessions', breakId);
  await updateDoc(docRef, cleanUpdates);
};

export const getActiveBreakSession = async (workSessionId: string): Promise<BreakSession | null> => {
  if (isDemoMode()) {
    // Demo mode - simulate no active break for demo
    return null;
  }

  const q = query(
    collection(db, 'breakSessions'),
    where('workSessionId', '==', workSessionId),
    where('status', '==', 'active'),
    limit(1)
  );

  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      startTime: data.startTime?.toDate() || new Date(),
      endTime: data.endTime?.toDate(),
    } as BreakSession;
  }
  return null;
};

// Daily Summary Management
export const createDailySummary = async (dailySummaryData: Omit<DailySummary, 'id'>) => {
  if (isDemoMode()) {
    // Demo mode - simulate creation
    return `demo-summary-${Date.now()}`;
  }

  // Filter out undefined values
  const cleanData = Object.fromEntries(
    Object.entries(dailySummaryData).filter(([, value]) => value !== undefined)
  );

  const docRef = await addDoc(collection(db, 'dailySummaries'), cleanData);
  return docRef.id;
};

export const updateDailySummary = async (summaryId: string, updates: Partial<DailySummary>) => {
  if (isDemoMode()) {
    // Demo mode - simulate update
    console.log('Demo: Updated daily summary', summaryId, updates);
    return;
  }

  // Filter out undefined values
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined)
  );

  const docRef = doc(db, 'dailySummaries', summaryId);
  await updateDoc(docRef, cleanUpdates);
};

export const getDailySummary = async (employeeId: string, date: string): Promise<DailySummary | null> => {
  if (isDemoMode()) {
    // Demo mode - return demo summary for demo user
    if (employeeId === 'demo-employee-1') {
      const today = new Date().toISOString().split('T')[0];
      if (date === today) {
        return {
          id: 'demo-summary-1',
          employeeId: 'demo-employee-1',
          date: today,
          totalWorkTime: 480, // 8 hours
          totalBreakTime: 60, // 1 hour
          clockInTime: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
          clockOutTime: new Date(),
          workSessions: ['demo-session-1'],
          status: 'complete',
          overtime: 0,
        };
      }
    }
    return null;
  }

  const q = query(
    collection(db, 'dailySummaries'),
    where('employeeId', '==', employeeId),
    where('date', '==', date),
    limit(1)
  );

  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      clockInTime: data.clockInTime?.toDate(),
      clockOutTime: data.clockOutTime?.toDate(),
    } as DailySummary;
  }
  return null;
};

// Weekly Summary Management
export const createWeeklySummary = async (weeklySummaryData: Omit<WeeklySummary, 'id'>) => {
  if (isDemoMode()) {
    // Demo mode - simulate creation
    return `demo-weekly-${Date.now()}`;
  }

  // Filter out undefined values
  const cleanData = Object.fromEntries(
    Object.entries(weeklySummaryData).filter(([, value]) => value !== undefined)
  );

  const docRef = await addDoc(collection(db, 'weeklySummaries'), cleanData);
  return docRef.id;
};

export const getWeeklySummary = async (employeeId: string, weekStart: string): Promise<WeeklySummary | null> => {
  if (isDemoMode()) {
    // Demo mode - return null to simulate no existing summary
    return null;
  }

  const q = query(
    collection(db, 'weeklySummaries'),
    where('employeeId', '==', employeeId),
    where('weekStart', '==', weekStart),
    limit(1)
  );

  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as WeeklySummary;
  }
  return null;
};

// Report Generation
export const generateAttendanceReport = async (
  employeeId: string | null,
  startDate: string,
  endDate: string,
  generatedBy: string
): Promise<AttendanceReport> => {
  if (isDemoMode()) {
    // Demo mode - return mock report
    const report: AttendanceReport = {
      id: `demo-report-${Date.now()}`,
      employeeId: employeeId || undefined,
      startDate,
      endDate,
      totalWorkTime: 480, // 8 hours in minutes
      totalBreakTime: 60, // 1 hour in minutes
      workDays: 1,
      averageWorkTime: 480,
      overtime: 0,
      generatedAt: new Date(),
      generatedBy,
    };
    return report;
  }

  const q = query(
    collection(db, 'dailySummaries'),
    where('employeeId', employeeId ? '==' : '!=', employeeId || ''),
    where('date', '>=', startDate),
    where('date', '<=', endDate)
  );

  const querySnapshot = await getDocs(q);
  const summaries = querySnapshot.docs.map(doc => doc.data() as DailySummary);

  const totalWorkTime = summaries.reduce((sum, summary) => sum + summary.totalWorkTime, 0);
  const totalBreakTime = summaries.reduce((sum, summary) => sum + summary.totalBreakTime, 0);
  const workDays = summaries.length;
  const averageWorkTime = workDays > 0 ? totalWorkTime / workDays : 0;
  const overtime = summaries.reduce((sum, summary) => sum + (summary.overtime || 0), 0);

  const report: AttendanceReport = {
    id: '',
    employeeId: employeeId || undefined,
    startDate,
    endDate,
    totalWorkTime,
    totalBreakTime,
    workDays,
    averageWorkTime,
    overtime,
    generatedAt: new Date(),
    generatedBy,
  };

  // Filter out undefined values
  const cleanReport = Object.fromEntries(
    Object.entries(report).filter(([, value]) => value !== undefined)
  );

  const docRef = await addDoc(collection(db, 'attendanceReports'), cleanReport);
  return { ...report, id: docRef.id };
};

// Idle Settings Management
export const createIdleSettings = async (idleSettingsData: Omit<IdleSettings, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (isDemoMode()) {
    // Demo mode - simulate creation
    return `demo-idle-settings-${Date.now()}`;
  }

  // Filter out undefined values
  const cleanData = Object.fromEntries(
    Object.entries(idleSettingsData).filter(([, value]) => value !== undefined)
  );

  const docRef = await addDoc(collection(db, 'idleSettings'), {
    ...cleanData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateIdleSettings = async (settingsId: string, updates: Partial<IdleSettings>) => {
  if (isDemoMode()) {
    // Demo mode - simulate update
    console.log('Demo: Updated idle settings', settingsId, updates);
    return;
  }

  // Filter out undefined values
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined)
  );

  const docRef = doc(db, 'idleSettings', settingsId);
  await updateDoc(docRef, {
    ...cleanUpdates,
    updatedAt: serverTimestamp(),
  });
};

export const getIdleSettings = async (employeeId: string): Promise<IdleSettings | null> => {
  if (isDemoMode()) {
    // Demo mode - return default settings for demo user
    if (employeeId === 'demo-employee-1') {
      return {
        id: 'demo-idle-settings-1',
        employeeId: 'demo-employee-1',
        enabled: true,
        idleThresholdMinutes: 5,
        pauseTimerOnIdle: true,
        showIdleWarning: true,
        warningTimeMinutes: 1,
        autoResumeOnActivity: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    return null;
  }

  const q = query(
    collection(db, 'idleSettings'),
    where('employeeId', '==', employeeId),
    limit(1)
  );

  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as IdleSettings;
  }
  return null;
};

// Idle Session Management
export const createIdleSession = async (idleSessionData: Omit<IdleSession, 'id'>) => {
  if (isDemoMode()) {
    // Demo mode - simulate creation
    return `demo-idle-session-${Date.now()}`;
  }

  // Filter out undefined values
  const cleanData = Object.fromEntries(
    Object.entries(idleSessionData).filter(([, value]) => value !== undefined)
  );

  const docRef = await addDoc(collection(db, 'idleSessions'), cleanData);
  return docRef.id;
};

export const updateIdleSession = async (sessionId: string, updates: Partial<IdleSession>) => {
  if (isDemoMode()) {
    // Demo mode - simulate update
    console.log('Demo: Updated idle session', sessionId, updates);
    return;
  }

  // Filter out undefined values
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined)
  );

  const docRef = doc(db, 'idleSessions', sessionId);
  await updateDoc(docRef, cleanUpdates);
};

export const getActiveIdleSession = async (workSessionId: string): Promise<IdleSession | null> => {
  if (isDemoMode()) {
    // Demo mode - return null to simulate no active idle session
    return null;
  }

  const q = query(
    collection(db, 'idleSessions'),
    where('workSessionId', '==', workSessionId),
    where('status', '==', 'active'),
    limit(1)
  );

  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      startTime: data.startTime?.toDate() || new Date(),
      endTime: data.endTime?.toDate(),
    } as IdleSession;
  }
  return null;
};

export const getIdleSessions = async (workSessionId: string) => {
  if (isDemoMode()) {
    // Demo mode - return empty array
    return [];
  }

  const q = query(
    collection(db, 'idleSessions'),
    where('workSessionId', '==', workSessionId),
    orderBy('startTime', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    startTime: doc.data().startTime?.toDate() || new Date(),
    endTime: doc.data().endTime?.toDate(),
  })) as IdleSession[];
};

// Application Activity Management
export const createApplicationActivity = async (activityData: Omit<ApplicationActivity, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (isDemoMode()) {
    // Demo mode - simulate creation
    const id = `demo-app-activity-${Date.now()}`;
    return { id, ...activityData, createdAt: new Date(), updatedAt: new Date() };
  }

  const docRef = await addDoc(collection(db, 'applicationActivities'), {
    ...activityData,
    startTime: Timestamp.fromDate(activityData.startTime),
    endTime: activityData.endTime ? Timestamp.fromDate(activityData.endTime) : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { id: docRef.id, ...activityData, createdAt: new Date(), updatedAt: new Date() };
};

export const updateApplicationActivity = async (activityId: string, updates: Partial<ApplicationActivity>) => {
  if (isDemoMode()) {
    // Demo mode - simulate update
    return { id: activityId, ...updates, updatedAt: new Date() };
  }

  const docRef = doc(db, 'applicationActivities', activityId);
  const updateData: Record<string, unknown> = {
    ...updates,
    updatedAt: serverTimestamp(),
  };

  if (updates.startTime) {
    updateData.startTime = Timestamp.fromDate(updates.startTime);
  }
  if (updates.endTime) {
    updateData.endTime = Timestamp.fromDate(updates.endTime);
  }

  await updateDoc(docRef, updateData);
};

export const getApplicationActivities = async (workSessionId: string): Promise<ApplicationActivity[]> => {
  if (isDemoMode()) {
    // Demo mode - return mock data
    return [
      {
        id: 'demo-app-1',
        employeeId: 'demo-employee',
        workSessionId,
        applicationName: 'VS Code',
        windowTitle: 'project.js',
        processName: 'code',
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date(Date.now() - 1800000),
        duration: 1800,
        isActive: false,
        category: 'development',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  const q = query(
    collection(db, 'applicationActivities'),
    where('workSessionId', '==', workSessionId),
    orderBy('startTime', 'asc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    startTime: doc.data().startTime?.toDate() || new Date(),
    endTime: doc.data().endTime?.toDate(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  })) as ApplicationActivity[];
};

export const getActiveApplicationActivity = async (workSessionId: string): Promise<ApplicationActivity | null> => {
  if (isDemoMode()) {
    return null;
  }

  const q = query(
    collection(db, 'applicationActivities'),
    where('workSessionId', '==', workSessionId),
    where('isActive', '==', true),
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    startTime: doc.data().startTime?.toDate() || new Date(),
    endTime: doc.data().endTime?.toDate(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  } as ApplicationActivity;
};

// Application Tracking Settings Management
export const createApplicationTrackingSettings = async (settingsData: Omit<ApplicationTrackingSettings, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (isDemoMode()) {
    const id = `demo-app-settings-${Date.now()}`;
    return { id, ...settingsData, createdAt: new Date(), updatedAt: new Date() };
  }

  const docRef = await addDoc(collection(db, 'applicationTrackingSettings'), {
    ...settingsData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { id: docRef.id, ...settingsData, createdAt: new Date(), updatedAt: new Date() };
};

export const updateApplicationTrackingSettings = async (settingsId: string, updates: Partial<ApplicationTrackingSettings>) => {
  if (isDemoMode()) {
    return { id: settingsId, ...updates, updatedAt: new Date() };
  }

  const docRef = doc(db, 'applicationTrackingSettings', settingsId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const getApplicationTrackingSettings = async (employeeId: string): Promise<ApplicationTrackingSettings | null> => {
  if (isDemoMode()) {
    return {
      id: 'demo-app-settings',
      employeeId,
      enabled: true,
      trackApplications: true,
      trackWebsites: true,
      trackWindowTitles: true,
      samplingInterval: 5,
      maxIdleTime: 30,
      categoryRules: {},
      privacyMode: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  const q = query(
    collection(db, 'applicationTrackingSettings'),
    where('employeeId', '==', employeeId),
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  } as ApplicationTrackingSettings;
};

// Website Activity Management
export const createWebsiteActivity = async (activityData: Omit<WebsiteActivity, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (isDemoMode()) {
    const id = `demo-website-activity-${Date.now()}`;
    return { id, ...activityData, createdAt: new Date(), updatedAt: new Date() };
  }

  const docRef = await addDoc(collection(db, 'websiteActivities'), {
    ...activityData,
    startTime: Timestamp.fromDate(activityData.startTime),
    endTime: activityData.endTime ? Timestamp.fromDate(activityData.endTime) : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { id: docRef.id, ...activityData, createdAt: new Date(), updatedAt: new Date() };
};

export const updateWebsiteActivity = async (activityId: string, updates: Partial<WebsiteActivity>) => {
  if (isDemoMode()) {
    return { id: activityId, ...updates, updatedAt: new Date() };
  }

  const docRef = doc(db, 'websiteActivities', activityId);
  const updateData: Record<string, unknown> = {
    ...updates,
    updatedAt: serverTimestamp(),
  };

  if (updates.startTime) {
    updateData.startTime = Timestamp.fromDate(updates.startTime);
  }
  if (updates.endTime) {
    updateData.endTime = Timestamp.fromDate(updates.endTime);
  }

  await updateDoc(docRef, updateData);
};

export const getWebsiteActivities = async (workSessionId: string): Promise<WebsiteActivity[]> => {
  if (isDemoMode()) {
    return [
      {
        id: 'demo-website-1',
        employeeId: 'demo-employee',
        workSessionId,
        domain: 'github.com',
        url: 'https://github.com/user/repo',
        pageTitle: 'Repository - GitHub',
        startTime: new Date(Date.now() - 1800000),
        endTime: new Date(Date.now() - 900000),
        duration: 900,
        isActive: false,
        category: 'work',
        productivity: 'productive',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  const q = query(
    collection(db, 'websiteActivities'),
    where('workSessionId', '==', workSessionId),
    orderBy('startTime', 'asc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    startTime: doc.data().startTime?.toDate() || new Date(),
    endTime: doc.data().endTime?.toDate(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  })) as WebsiteActivity[];
};

export const getActiveWebsiteActivity = async (workSessionId: string): Promise<WebsiteActivity | null> => {
  if (isDemoMode()) {
    return null;
  }

  const q = query(
    collection(db, 'websiteActivities'),
    where('workSessionId', '==', workSessionId),
    where('isActive', '==', true),
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    startTime: doc.data().startTime?.toDate() || new Date(),
    endTime: doc.data().endTime?.toDate(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  } as WebsiteActivity;
};

// Website Tracking Settings Management
export const createWebsiteTrackingSettings = async (settingsData: Omit<WebsiteTrackingSettings, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (isDemoMode()) {
    const id = `demo-website-settings-${Date.now()}`;
    return { id, ...settingsData, createdAt: new Date(), updatedAt: new Date() };
  }

  const docRef = await addDoc(collection(db, 'websiteTrackingSettings'), {
    ...settingsData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { id: docRef.id, ...settingsData, createdAt: new Date(), updatedAt: new Date() };
};

export const updateWebsiteTrackingSettings = async (settingsId: string, updates: Partial<WebsiteTrackingSettings>) => {
  if (isDemoMode()) {
    return { id: settingsId, ...updates, updatedAt: new Date() };
  }

  const docRef = doc(db, 'websiteTrackingSettings', settingsId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const getWebsiteTrackingSettings = async (employeeId: string): Promise<WebsiteTrackingSettings | null> => {
  if (isDemoMode()) {
    return {
      id: 'demo-website-settings',
      employeeId,
      enabled: true,
      trackWebsites: true,
      trackPageTitles: true,
      trackFullUrls: false,
      samplingInterval: 5,
      maxIdleTime: 30,
      categoryRules: {},
      productivityRules: {},
      privacyMode: false,
      blocklist: [],
      allowlist: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  const q = query(
    collection(db, 'websiteTrackingSettings'),
    where('employeeId', '==', employeeId),
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  } as WebsiteTrackingSettings;
};

// Screen Capture Settings Management
export const createScreenCaptureSettings = async (settingsData: Omit<ScreenCaptureSettings, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (isDemoMode()) {
    const id = `demo-screen-capture-settings-${Date.now()}`;
    return { id, ...settingsData, createdAt: new Date(), updatedAt: new Date() };
  }

  const docRef = await addDoc(collection(db, 'screenCaptureSettings'), {
    ...settingsData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { id: docRef.id, ...settingsData, createdAt: new Date(), updatedAt: new Date() };
};

export const updateScreenCaptureSettings = async (settingsId: string, updates: Partial<ScreenCaptureSettings>) => {
  if (isDemoMode()) {
    return { id: settingsId, ...updates, updatedAt: new Date() };
  }

  const docRef = doc(db, 'screenCaptureSettings', settingsId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const getScreenCaptureSettings = async (employeeId: string): Promise<ScreenCaptureSettings | null> => {
  if (isDemoMode()) {
    return {
      id: 'demo-screen-capture-settings',
      employeeId,
      enabled: true,
      intervalMinutes: 15,
      quality: 0.8,
      maxCapturesPerDay: 32,
      requireUserConsent: true,
      useRandomTiming: true,
      randomVariationPercent: 25,
      burstModeEnabled: false,
      burstIntervalSeconds: 30,
      burstDurationMinutes: 5,
      burstFrequency: 'medium',
      customBurstIntervalMinutes: 30,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  const q = query(
    collection(db, 'screenCaptureSettings'),
    where('employeeId', '==', employeeId),
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  } as ScreenCaptureSettings;
};

export const getAllScreenCaptureSettings = async (): Promise<ScreenCaptureSettings[]> => {
  if (isDemoMode()) {
    return [
      {
        id: 'demo-screen-capture-settings-1',
        employeeId: 'demo-employee-1',
        enabled: true,
        intervalMinutes: 15,
        quality: 0.8,
        maxCapturesPerDay: 32,
        requireUserConsent: true,
        useRandomTiming: true,
        randomVariationPercent: 25,
        burstModeEnabled: false,
        burstIntervalSeconds: 30,
        burstDurationMinutes: 5,
        burstFrequency: 'medium',
        customBurstIntervalMinutes: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  const q = query(
    collection(db, 'screenCaptureSettings'),
    orderBy('updatedAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  })) as ScreenCaptureSettings[];
};

// Attendance Management
export const createAttendanceRecord = async (recordData: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (isDemoMode()) {
    const id = `demo-attendance-${Date.now()}`;
    return { id, ...recordData, createdAt: new Date(), updatedAt: new Date() };
  }

  const docRef = await addDoc(collection(db, 'attendanceRecords'), {
    ...recordData,
    date: Timestamp.fromDate(recordData.date),
    punchInTime: recordData.punchInTime ? Timestamp.fromDate(recordData.punchInTime) : null,
    punchOutTime: recordData.punchOutTime ? Timestamp.fromDate(recordData.punchOutTime) : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { 
    id: docRef.id, 
    ...recordData, 
    createdAt: new Date(), 
    updatedAt: new Date() 
  };
};

export const updateAttendanceRecord = async (recordId: string, updates: Partial<AttendanceRecord>) => {
  if (isDemoMode()) {
    return { id: recordId, ...updates, updatedAt: new Date() };
  }

  const docRef = doc(db, 'attendanceRecords', recordId);
  const updateData: Record<string, unknown> = {
    ...updates,
    updatedAt: serverTimestamp(),
  };

  if (updates.date) updateData.date = Timestamp.fromDate(updates.date);
  if (updates.punchInTime) updateData.punchInTime = Timestamp.fromDate(updates.punchInTime);
  if (updates.punchOutTime) updateData.punchOutTime = Timestamp.fromDate(updates.punchOutTime);

  await updateDoc(docRef, updateData);
};

export const getAttendanceRecord = async (employeeId: string, date: Date): Promise<AttendanceRecord | null> => {
  if (isDemoMode()) {
    return {
      id: 'demo-attendance-record',
      employeeId,
      date,
      totalWorkingHours: 8,
      totalBreakTime: 1,
      status: 'present',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const q = query(
    collection(db, 'attendanceRecords'),
    where('employeeId', '==', employeeId),
    where('date', '>=', Timestamp.fromDate(startOfDay)),
    where('date', '<=', Timestamp.fromDate(endOfDay)),
    limit(1)
  );

  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  const data = doc.data();
  
  return {
    id: doc.id,
    ...data,
    date: data.date?.toDate() || date,
    punchInTime: data.punchInTime?.toDate(),
    punchOutTime: data.punchOutTime?.toDate(),
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as AttendanceRecord;
};

export const getAttendanceRecords = async (employeeId: string, startDate: Date, endDate: Date): Promise<AttendanceRecord[]> => {
  if (isDemoMode()) {
    const records: AttendanceRecord[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      records.push({
        id: `demo-attendance-${current.getTime()}`,
        employeeId,
        date: new Date(current),
        totalWorkingHours: 8,
        totalBreakTime: 1,
        status: 'present',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      current.setDate(current.getDate() + 1);
    }
    
    return records;
  }

  const q = query(
    collection(db, 'attendanceRecords'),
    where('employeeId', '==', employeeId),
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate)),
    orderBy('date', 'asc')
  );

  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date?.toDate() || new Date(),
      punchInTime: data.punchInTime?.toDate(),
      punchOutTime: data.punchOutTime?.toDate(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  }) as AttendanceRecord[];
};

// Punch Record Management
export const createPunchRecord = async (recordData: Omit<PunchRecord, 'id' | 'createdAt'>) => {
  if (isDemoMode()) {
    const id = `demo-punch-${Date.now()}`;
    return { id, ...recordData, createdAt: new Date() };
  }

  const docRef = await addDoc(collection(db, 'punchRecords'), {
    ...recordData,
    punchTime: Timestamp.fromDate(recordData.punchTime),
    createdAt: serverTimestamp(),
  });

  return { 
    id: docRef.id, 
    ...recordData, 
    createdAt: new Date() 
  };
};

export const getPunchRecords = async (employeeId: string, startDate: Date, endDate: Date): Promise<PunchRecord[]> => {
  if (isDemoMode()) {
    return [
      {
        id: 'demo-punch-in',
        employeeId,
        attendanceRecordId: 'demo-attendance-record',
        punchType: 'in',
        punchTime: new Date(),
        isManual: false,
        createdAt: new Date()
      },
      {
        id: 'demo-punch-out',
        employeeId,
        attendanceRecordId: 'demo-attendance-record',
        punchType: 'out',
        punchTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours later
        isManual: false,
        createdAt: new Date()
      }
    ];
  }

  const q = query(
    collection(db, 'punchRecords'),
    where('employeeId', '==', employeeId),
    where('punchTime', '>=', Timestamp.fromDate(startDate)),
    where('punchTime', '<=', Timestamp.fromDate(endDate)),
    orderBy('punchTime', 'asc')
  );

  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      punchTime: data.punchTime?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  }) as PunchRecord[];
};

// Attendance Settings Management
export const createAttendanceSettings = async (settingsData: Omit<AttendanceSettings, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (isDemoMode()) {
    const id = `demo-attendance-settings-${Date.now()}`;
    return { id, ...settingsData, createdAt: new Date(), updatedAt: new Date() };
  }

  const docRef = await addDoc(collection(db, 'attendanceSettings'), {
    ...settingsData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { id: docRef.id, ...settingsData, createdAt: new Date(), updatedAt: new Date() };
};

export const updateAttendanceSettings = async (employeeId: string, updates: Partial<AttendanceSettings>) => {
  if (isDemoMode()) {
    return { id: 'demo-attendance-settings', ...updates, updatedAt: new Date() };
  }

  // First, try to find existing settings
  const q = query(
    collection(db, 'attendanceSettings'),
    where('employeeId', '==', employeeId),
    limit(1)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    // Create new settings if none exist
    return await createAttendanceSettings({
      employeeId,
      workStartTime: '09:00',
      workEndTime: '17:00',
      breakDuration: 60,
      lateThreshold: 15,
      earlyLeaveThreshold: 15,
      overtimeThreshold: 0,
      workingDays: [1, 2, 3, 4, 5], // Monday to Friday
      timezone: 'UTC',
      requireLocation: false,
      allowRemoteWork: true,
      autoPunchOut: false,
      ...updates
    });
  }

  const docRef = doc(db, 'attendanceSettings', querySnapshot.docs[0].id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const getAttendanceSettings = async (employeeId: string): Promise<AttendanceSettings | null> => {
  if (isDemoMode()) {
    return {
      id: 'demo-attendance-settings',
      employeeId,
      workStartTime: '09:00',
      workEndTime: '17:00',
      breakDuration: 60,
      lateThreshold: 15,
      earlyLeaveThreshold: 15,
      overtimeThreshold: 0,
      workingDays: [1, 2, 3, 4, 5], // Monday to Friday
      timezone: 'UTC',
      requireLocation: false,
      allowRemoteWork: true,
      autoPunchOut: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  const q = query(
    collection(db, 'attendanceSettings'),
    where('employeeId', '==', employeeId),
    limit(1)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  } as AttendanceSettings;
};
