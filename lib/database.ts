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
