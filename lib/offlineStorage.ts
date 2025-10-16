/**
 * Offline Storage Service for Time Tracking
 * Handles local storage of time entries, work sessions, and screen captures when offline
 */

import { TimeEntry, WorkSession, BreakSession } from '@/types';
import { ScreenCapture } from './screenCapture';

export interface OfflineTimeEntry extends Omit<TimeEntry, 'id'> {
  id?: string;
  isOffline: boolean;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  lastSyncAttempt?: Date;
  retryCount: number;
}

export interface OfflineWorkSession extends Omit<WorkSession, 'id'> {
  id?: string;
  isOffline: boolean;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  lastSyncAttempt?: Date;
  retryCount: number;
}

export interface OfflineBreakSession extends Omit<BreakSession, 'id'> {
  id?: string;
  isOffline: boolean;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  lastSyncAttempt?: Date;
  retryCount: number;
}

export interface OfflineScreenCapture extends ScreenCapture {
  isOffline: boolean;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  lastSyncAttempt?: Date;
  retryCount: number;
}

export interface OfflineData {
  timeEntries: OfflineTimeEntry[];
  workSessions: OfflineWorkSession[];
  breakSessions: OfflineBreakSession[];
  screenCaptures: OfflineScreenCapture[];
  lastSyncTime?: Date;
  isOnline: boolean;
}

export class OfflineStorageService {
  private static instance: OfflineStorageService;
  private storageKey = 'teamLogger_offline_data';
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds

  static getInstance(): OfflineStorageService {
    if (!OfflineStorageService.instance) {
      OfflineStorageService.instance = new OfflineStorageService();
    }
    return OfflineStorageService.instance;
  }

  /**
   * Initialize offline storage service
   */
  async initialize(): Promise<void> {
    try {
      // Check if we have existing offline data
      const existingData = this.getOfflineData();
      if (existingData && existingData.timeEntries.length > 0) {
        console.log('Found existing offline data:', existingData);
      }
    } catch (error) {
      console.error('Failed to initialize offline storage:', error);
    }
  }

  /**
   * Store time entry offline
   */
  async storeTimeEntry(timeEntry: Omit<TimeEntry, 'id'>): Promise<string> {
    const offlineEntry: OfflineTimeEntry = {
      ...timeEntry,
      id: `offline-entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isOffline: true,
      syncStatus: 'pending',
      retryCount: 0,
    };

    const data = this.getOfflineData();
    data.timeEntries.push(offlineEntry);
    this.saveOfflineData(data);

    console.log('Stored time entry offline:', offlineEntry);
    return offlineEntry.id!;
  }

  /**
   * Store work session offline
   */
  async storeWorkSession(workSession: Omit<WorkSession, 'id'>): Promise<string> {
    const offlineSession: OfflineWorkSession = {
      ...workSession,
      id: `offline-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isOffline: true,
      syncStatus: 'pending',
      retryCount: 0,
    };

    const data = this.getOfflineData();
    data.workSessions.push(offlineSession);
    this.saveOfflineData(data);

    console.log('Stored work session offline:', offlineSession);
    return offlineSession.id!;
  }

  /**
   * Store break session offline
   */
  async storeBreakSession(breakSession: Omit<BreakSession, 'id'>): Promise<string> {
    const offlineSession: OfflineBreakSession = {
      ...breakSession,
      id: `offline-break-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isOffline: true,
      syncStatus: 'pending',
      retryCount: 0,
    };

    const data = this.getOfflineData();
    data.breakSessions.push(offlineSession);
    this.saveOfflineData(data);

    console.log('Stored break session offline:', offlineSession);
    return offlineSession.id!;
  }

  /**
   * Store screen capture offline
   */
  async storeScreenCapture(screenCapture: ScreenCapture): Promise<string> {
    const offlineCapture: OfflineScreenCapture = {
      ...screenCapture,
      isOffline: true,
      syncStatus: 'pending',
      retryCount: 0,
    };

    const data = this.getOfflineData();
    data.screenCaptures.push(offlineCapture);
    this.saveOfflineData(data);

    console.log('Stored screen capture offline:', offlineCapture);
    return offlineCapture.id;
  }

  /**
   * Update work session offline
   */
  async updateWorkSessionOffline(sessionId: string, updates: Partial<WorkSession>): Promise<void> {
    const data = this.getOfflineData();
    const sessionIndex = data.workSessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex !== -1) {
      data.workSessions[sessionIndex] = {
        ...data.workSessions[sessionIndex],
        ...updates,
        syncStatus: 'pending',
        lastSyncAttempt: undefined,
      };
      this.saveOfflineData(data);
      console.log('Updated work session offline:', sessionId, updates);
    }
  }

  /**
   * Update break session offline
   */
  async updateBreakSessionOffline(breakId: string, updates: Partial<BreakSession>): Promise<void> {
    const data = this.getOfflineData();
    const breakIndex = data.breakSessions.findIndex(b => b.id === breakId);
    
    if (breakIndex !== -1) {
      data.breakSessions[breakIndex] = {
        ...data.breakSessions[breakIndex],
        ...updates,
        syncStatus: 'pending',
        lastSyncAttempt: undefined,
      };
      this.saveOfflineData(data);
      console.log('Updated break session offline:', breakId, updates);
    }
  }

  /**
   * Get all pending sync items
   */
  getPendingSyncItems(): {
    timeEntries: OfflineTimeEntry[];
    workSessions: OfflineWorkSession[];
    breakSessions: OfflineBreakSession[];
    screenCaptures: OfflineScreenCapture[];
  } {
    const data = this.getOfflineData();
    
    return {
      timeEntries: data.timeEntries.filter(item => item.syncStatus === 'pending' || item.syncStatus === 'failed'),
      workSessions: data.workSessions.filter(item => item.syncStatus === 'pending' || item.syncStatus === 'failed'),
      breakSessions: data.breakSessions.filter(item => item.syncStatus === 'pending' || item.syncStatus === 'failed'),
      screenCaptures: data.screenCaptures.filter(item => item.syncStatus === 'pending' || item.syncStatus === 'failed'),
    };
  }

  /**
   * Mark item as syncing
   */
  markAsSyncing(type: 'timeEntry' | 'workSession' | 'breakSession' | 'screenCapture', id: string): void {
    const data = this.getOfflineData();
    
    switch (type) {
      case 'timeEntry':
        const timeEntryIndex = data.timeEntries.findIndex(item => item.id === id);
        if (timeEntryIndex !== -1) {
          data.timeEntries[timeEntryIndex].syncStatus = 'syncing';
          data.timeEntries[timeEntryIndex].lastSyncAttempt = new Date();
        }
        break;
      case 'workSession':
        const workSessionIndex = data.workSessions.findIndex(item => item.id === id);
        if (workSessionIndex !== -1) {
          data.workSessions[workSessionIndex].syncStatus = 'syncing';
          data.workSessions[workSessionIndex].lastSyncAttempt = new Date();
        }
        break;
      case 'breakSession':
        const breakSessionIndex = data.breakSessions.findIndex(item => item.id === id);
        if (breakSessionIndex !== -1) {
          data.breakSessions[breakSessionIndex].syncStatus = 'syncing';
          data.breakSessions[breakSessionIndex].lastSyncAttempt = new Date();
        }
        break;
      case 'screenCapture':
        const screenCaptureIndex = data.screenCaptures.findIndex(item => item.id === id);
        if (screenCaptureIndex !== -1) {
          data.screenCaptures[screenCaptureIndex].syncStatus = 'syncing';
          data.screenCaptures[screenCaptureIndex].lastSyncAttempt = new Date();
        }
        break;
    }
    
    this.saveOfflineData(data);
  }

  /**
   * Mark item as synced
   */
  markAsSynced(type: 'timeEntry' | 'workSession' | 'breakSession' | 'screenCapture', id: string): void {
    const data = this.getOfflineData();
    
    switch (type) {
      case 'timeEntry':
        const timeEntryIndex = data.timeEntries.findIndex(item => item.id === id);
        if (timeEntryIndex !== -1) {
          data.timeEntries[timeEntryIndex].syncStatus = 'synced';
        }
        break;
      case 'workSession':
        const workSessionIndex = data.workSessions.findIndex(item => item.id === id);
        if (workSessionIndex !== -1) {
          data.workSessions[workSessionIndex].syncStatus = 'synced';
        }
        break;
      case 'breakSession':
        const breakSessionIndex = data.breakSessions.findIndex(item => item.id === id);
        if (breakSessionIndex !== -1) {
          data.breakSessions[breakSessionIndex].syncStatus = 'synced';
        }
        break;
      case 'screenCapture':
        const screenCaptureIndex = data.screenCaptures.findIndex(item => item.id === id);
        if (screenCaptureIndex !== -1) {
          data.screenCaptures[screenCaptureIndex].syncStatus = 'synced';
        }
        break;
    }
    
    this.saveOfflineData(data);
  }

  /**
   * Mark item as failed and increment retry count
   */
  markAsFailed(type: 'timeEntry' | 'workSession' | 'breakSession' | 'screenCapture', id: string): void {
    const data = this.getOfflineData();
    
    switch (type) {
      case 'timeEntry':
        const timeEntryIndex = data.timeEntries.findIndex(item => item.id === id);
        if (timeEntryIndex !== -1) {
          data.timeEntries[timeEntryIndex].syncStatus = 'failed';
          data.timeEntries[timeEntryIndex].retryCount++;
          data.timeEntries[timeEntryIndex].lastSyncAttempt = new Date();
        }
        break;
      case 'workSession':
        const workSessionIndex = data.workSessions.findIndex(item => item.id === id);
        if (workSessionIndex !== -1) {
          data.workSessions[workSessionIndex].syncStatus = 'failed';
          data.workSessions[workSessionIndex].retryCount++;
          data.workSessions[workSessionIndex].lastSyncAttempt = new Date();
        }
        break;
      case 'breakSession':
        const breakSessionIndex = data.breakSessions.findIndex(item => item.id === id);
        if (breakSessionIndex !== -1) {
          data.breakSessions[breakSessionIndex].syncStatus = 'failed';
          data.breakSessions[breakSessionIndex].retryCount++;
          data.breakSessions[breakSessionIndex].lastSyncAttempt = new Date();
        }
        break;
      case 'screenCapture':
        const screenCaptureIndex = data.screenCaptures.findIndex(item => item.id === id);
        if (screenCaptureIndex !== -1) {
          data.screenCaptures[screenCaptureIndex].syncStatus = 'failed';
          data.screenCaptures[screenCaptureIndex].retryCount++;
          data.screenCaptures[screenCaptureIndex].lastSyncAttempt = new Date();
        }
        break;
    }
    
    this.saveOfflineData(data);
  }

  /**
   * Remove synced items from offline storage
   */
  removeSyncedItems(): void {
    const data = this.getOfflineData();
    
    data.timeEntries = data.timeEntries.filter(item => item.syncStatus !== 'synced');
    data.workSessions = data.workSessions.filter(item => item.syncStatus !== 'synced');
    data.breakSessions = data.breakSessions.filter(item => item.syncStatus !== 'synced');
    data.screenCaptures = data.screenCaptures.filter(item => item.syncStatus !== 'synced');
    
    this.saveOfflineData(data);
  }

  /**
   * Get offline data from localStorage
   */
  private getOfflineData(): OfflineData {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        // Convert date strings back to Date objects
        data.timeEntries = data.timeEntries.map((entry: Record<string, unknown>) => ({
          ...entry,
          timestamp: new Date(entry.timestamp as string),
          lastSyncAttempt: entry.lastSyncAttempt ? new Date(entry.lastSyncAttempt as string) : undefined,
        }));
        data.workSessions = data.workSessions.map((session: Record<string, unknown>) => ({
          ...session,
          clockInTime: new Date(session.clockInTime as string),
          clockOutTime: session.clockOutTime ? new Date(session.clockOutTime as string) : undefined,
          createdAt: new Date(session.createdAt as string),
          updatedAt: new Date(session.updatedAt as string),
          lastSyncAttempt: session.lastSyncAttempt ? new Date(session.lastSyncAttempt as string) : undefined,
        }));
        data.breakSessions = data.breakSessions.map((breakSession: Record<string, unknown>) => ({
          ...breakSession,
          startTime: new Date(breakSession.startTime as string),
          endTime: breakSession.endTime ? new Date(breakSession.endTime as string) : undefined,
          lastSyncAttempt: breakSession.lastSyncAttempt ? new Date(breakSession.lastSyncAttempt as string) : undefined,
        }));
        data.screenCaptures = data.screenCaptures.map((capture: Record<string, unknown>) => ({
          ...capture,
          timestamp: new Date(capture.timestamp as string),
          lastSyncAttempt: capture.lastSyncAttempt ? new Date(capture.lastSyncAttempt as string) : undefined,
        }));
        data.lastSyncTime = data.lastSyncTime ? new Date(data.lastSyncTime) : undefined;
        return data;
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
    
    return {
      timeEntries: [],
      workSessions: [],
      breakSessions: [],
      screenCaptures: [],
      isOnline: true,
    };
  }

  /**
   * Save offline data to localStorage
   */
  private saveOfflineData(data: OfflineData): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  /**
   * Get sync statistics
   */
  getSyncStats(): {
    totalPending: number;
    totalSynced: number;
    totalFailed: number;
    lastSyncTime?: Date;
  } {
    const data = this.getOfflineData();
    
    const allItems = [
      ...data.timeEntries,
      ...data.workSessions,
      ...data.breakSessions,
      ...data.screenCaptures,
    ];
    
    const totalPending = allItems.filter(item => item.syncStatus === 'pending').length;
    const totalSynced = allItems.filter(item => item.syncStatus === 'synced').length;
    const totalFailed = allItems.filter(item => item.syncStatus === 'failed').length;
    
    return {
      totalPending,
      totalSynced,
      totalFailed,
      lastSyncTime: data.lastSyncTime,
    };
  }

  /**
   * Clear all offline data (use with caution)
   */
  clearAllOfflineData(): void {
    localStorage.removeItem(this.storageKey);
    console.log('Cleared all offline data');
  }

  /**
   * Get items that are ready for retry (failed items that haven't exceeded max retries)
   */
  getRetryableItems(): {
    timeEntries: OfflineTimeEntry[];
    workSessions: OfflineWorkSession[];
    breakSessions: OfflineBreakSession[];
    screenCaptures: OfflineScreenCapture[];
  } {
    const data = this.getOfflineData();
    
    return {
      timeEntries: data.timeEntries.filter(item => 
        item.syncStatus === 'failed' && item.retryCount < this.maxRetries
      ),
      workSessions: data.workSessions.filter(item => 
        item.syncStatus === 'failed' && item.retryCount < this.maxRetries
      ),
      breakSessions: data.breakSessions.filter(item => 
        item.syncStatus === 'failed' && item.retryCount < this.maxRetries
      ),
      screenCaptures: data.screenCaptures.filter(item => 
        item.syncStatus === 'failed' && item.retryCount < this.maxRetries
      ),
    };
  }
}

// Export singleton instance
export const offlineStorageService = OfflineStorageService.getInstance();
