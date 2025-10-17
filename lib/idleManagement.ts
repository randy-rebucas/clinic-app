/**
 * Idle Management Service
 * Integrates inactivity detection with time tracking system
 */

import { inactivityDetectionService, IdleState, IdleSettings } from './inactivityDetection';
import { IIdleSession } from './models';
// Database functions are now accessed via API routes
import { networkDetectionService } from './networkDetection';
import { IdleSession } from '@/types';

export interface IdleManagementState {
  isIdle: boolean;
  currentIdleSession?: IdleSession;
  totalIdleTime: number;
  settings: IdleSettings | null;
  isMonitoring: boolean;
}

export type IdleManagementCallback = (state: IdleManagementState) => void;

export class IdleManagementService {
  private static instance: IdleManagementService;
  private currentEmployeeId?: string;
  private currentWorkSessionId?: string;
  private currentIdleSession?: IdleSession;
  private settings: IdleSettings | null = null;
  private settingsId?: string;
  private stateCallbacks: IdleManagementCallback[] = [];
  private isInitialized = false;

  static getInstance(): IdleManagementService {
    if (!IdleManagementService.instance) {
      IdleManagementService.instance = new IdleManagementService();
    }
    return IdleManagementService.instance;
  }

  /**
   * Initialize idle management for an employee
   */
  async initialize(employeeId: string, workSessionId?: string): Promise<void> {
    try {
      this.currentEmployeeId = employeeId;
      this.currentWorkSessionId = workSessionId;

      // Load employee's idle settings
      await this.loadIdleSettings(employeeId);

      // Initialize inactivity detection with employee settings
      if (this.settings?.enabled) {
        await this.initializeInactivityDetection();
      }

      // Load any existing idle session
      if (workSessionId) {
        await this.loadActiveIdleSession(workSessionId);
      }

      this.isInitialized = true;
      this.notifyStateChange();

      console.log('Idle management initialized for employee:', employeeId);
    } catch (error) {
      console.error('Failed to initialize idle management:', error);
    }
  }

  /**
   * Start monitoring for a work session
   */
  async startMonitoring(workSessionId: string): Promise<void> {
    this.currentWorkSessionId = workSessionId;
    
    if (this.settings?.enabled) {
      await this.initializeInactivityDetection();
    }

    // Load any existing idle session for this work session
    await this.loadActiveIdleSession(workSessionId);
    
    this.notifyStateChange();
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    inactivityDetectionService.stopMonitoring();
    this.currentIdleSession = undefined;
    this.notifyStateChange();
  }

  /**
   * Load idle settings for employee
   */
  private async loadIdleSettings(employeeId: string): Promise<void> {
    try {
      // Fetch idle settings from API
      const response = await fetch(`/api/idle/settings?employeeId=${employeeId}`);
      if (!response.ok) {
        console.log('Idle settings fetch failed:', response.status, response.statusText);
        return;
      }
      const data = await response.json();
      console.log('Idle settings fetch response:', data);
      const dbSettings = data.data;
      if (dbSettings) {
        this.settingsId = dbSettings._id.toString();
        this.settings = {
          enabled: dbSettings.enabled,
          idleThresholdMinutes: dbSettings.idleThresholdMinutes,
          pauseTimerOnIdle: dbSettings.pauseTimerOnIdle,
          showIdleWarning: dbSettings.showIdleWarning,
          warningTimeMinutes: dbSettings.warningTimeMinutes,
          autoResumeOnActivity: dbSettings.autoResumeOnActivity,
        };
      }
      
      // Create default settings if none exist
      if (!this.settings) {
        const defaultSettings = {
          enabled: true,
          idleThresholdMinutes: 5,
          pauseTimerOnIdle: true,
          showIdleWarning: true,
          warningTimeMinutes: 1,
          autoResumeOnActivity: true,
        };

        // Create idle settings via API
        const createResponse = await fetch('/api/idle/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            employeeId,
            ...defaultSettings
          }),
        });
        
        if (createResponse.ok) {
          const createData = await createResponse.json();
          console.log('Idle settings creation response:', createData);
          this.settingsId = createData.data.id;
        } else {
          const errorData = await createResponse.json();
          console.error('Failed to create idle settings:', errorData);
          return;
        }
        this.settings = {
          enabled: defaultSettings.enabled,
          idleThresholdMinutes: defaultSettings.idleThresholdMinutes,
          pauseTimerOnIdle: defaultSettings.pauseTimerOnIdle,
          showIdleWarning: defaultSettings.showIdleWarning,
          warningTimeMinutes: defaultSettings.warningTimeMinutes,
          autoResumeOnActivity: defaultSettings.autoResumeOnActivity,
        };
      }
    } catch (error) {
      console.error('Failed to load idle settings:', error);
      // Set default settings if loading fails
      this.settings = {
        enabled: true,
        idleThresholdMinutes: 5,
        pauseTimerOnIdle: true,
        showIdleWarning: true,
        warningTimeMinutes: 1,
        autoResumeOnActivity: true,
      };
    }
  }

  /**
   * Initialize inactivity detection with current settings
   */
  private async initializeInactivityDetection(): Promise<void> {
    if (!this.settings) {
      return;
    }

    // Update inactivity detection settings
    inactivityDetectionService.updateSettings({
      enabled: this.settings.enabled,
      idleThresholdMinutes: this.settings.idleThresholdMinutes,
      pauseTimerOnIdle: this.settings.pauseTimerOnIdle,
      showIdleWarning: this.settings.showIdleWarning,
      warningTimeMinutes: this.settings.warningTimeMinutes,
      autoResumeOnActivity: this.settings.autoResumeOnActivity,
    });

    // Add callbacks
    inactivityDetectionService.addStateCallback(this.handleIdleStateChange.bind(this));
    inactivityDetectionService.addWarningCallback(this.handleIdleWarning.bind(this));

    // Start monitoring
    inactivityDetectionService.startMonitoring();
  }

  /**
   * Load active idle session for work session
   */
  private async loadActiveIdleSession(workSessionId: string): Promise<void> {
    try {
      const dbSession = await getActiveIdleSession(workSessionId);
      if (dbSession) {
        this.currentIdleSession = {
          id: dbSession._id.toString(),
          workSessionId: dbSession.workSessionId.toString(),
          startTime: dbSession.startTime,
          endTime: dbSession.endTime,
          duration: dbSession.duration,
          reason: dbSession.reason,
          status: dbSession.status,
        };
      } else {
        this.currentIdleSession = undefined;
      }
    } catch (error) {
      console.error('Failed to load active idle session:', error);
    }
  }

  /**
   * Handle idle state changes
   */
  private async handleIdleStateChange(idleState: IdleState): Promise<void> {
    if (!this.currentWorkSessionId || !this.settings) {
      return;
    }

    if (idleState.isIdle && !this.currentIdleSession) {
      // Start idle session
      await this.startIdleSession();
    } else if (!idleState.isIdle && this.currentIdleSession) {
      // End idle session
      await this.endIdleSession();
    }

    this.notifyStateChange();
  }

  /**
   * Handle idle warning
   */
  private handleIdleWarning(): void {
    // This could trigger a notification or UI warning
    console.log('Idle warning: User will be marked idle soon');
  }

  /**
   * Start idle session
   */
  private async startIdleSession(): Promise<void> {
    if (!this.currentWorkSessionId || !this.settings?.pauseTimerOnIdle) {
      return;
    }

    try {
      const now = new Date();
      const isOnline = networkDetectionService.isCurrentlyOnline();

      if (isOnline) {
        const { Types } = await import('mongoose');
        const idleSessionData = {
          workSessionId: new Types.ObjectId(this.currentWorkSessionId),
          startTime: now,
          reason: 'inactivity' as const,
          status: 'active' as const,
        };
        const sessionId = await createIdleSession(idleSessionData as Omit<IIdleSession, '_id'>);
        this.currentIdleSession = {
          id: sessionId,
          workSessionId: this.currentWorkSessionId,
          startTime: now,
          reason: 'inactivity',
          status: 'active',
        };
      } else {
        // Store offline
        const sessionId = `offline-idle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.currentIdleSession = {
          id: sessionId,
          workSessionId: this.currentWorkSessionId,
          startTime: now,
          reason: 'inactivity',
          status: 'active',
        };
        // Store in offline storage
        try {
          await offlineStorageService.store('idleSession', this.currentIdleSession);
        } catch (error) {
          console.error('Failed to store idle session offline:', error);
        }
      }

      console.log('Started idle session:', this.currentIdleSession.id);
    } catch (error) {
      console.error('Failed to start idle session:', error);
    }
  }

  /**
   * End idle session
   */
  private async endIdleSession(): Promise<void> {
    if (!this.currentIdleSession) {
      return;
    }

    try {
      const now = new Date();
      const duration = Math.floor(
        (now.getTime() - this.currentIdleSession.startTime.getTime()) / (1000 * 60)
      );

      const isOnline = networkDetectionService.isCurrentlyOnline();

      if (isOnline) {
        await updateIdleSession(this.currentIdleSession.id, {
          endTime: now,
          duration,
          status: 'completed',
        });
      } else {
        // Update in offline storage
        try {
          const updatedSession = {
            ...this.currentIdleSession,
            endTime: now,
            duration,
            status: 'completed' as const,
          };
          await offlineStorageService.update('idleSession', this.currentIdleSession.id, updatedSession);
        } catch (error) {
          console.error('Failed to update idle session offline:', error);
        }
      }

      console.log('Ended idle session:', this.currentIdleSession.id, `Duration: ${duration} minutes`);
      this.currentIdleSession = undefined;
    } catch (error) {
      console.error('Failed to end idle session:', error);
    }
  }

  /**
   * Manually start idle session
   */
  async manualStartIdle(notes?: string): Promise<void> {
    if (!this.currentWorkSessionId) {
      throw new Error('No active work session');
    }

    try {
      const now = new Date();
      const isOnline = networkDetectionService.isCurrentlyOnline();

      if (isOnline) {
        const { Types } = await import('mongoose');
        const idleSessionData = {
          workSessionId: new Types.ObjectId(this.currentWorkSessionId),
          startTime: now,
          reason: 'manual' as const,
          notes,
          status: 'active' as const,
        };
        const sessionId = await createIdleSession(idleSessionData as Omit<IIdleSession, '_id'>);
        this.currentIdleSession = {
          id: sessionId,
          workSessionId: this.currentWorkSessionId,
          startTime: now,
          reason: 'manual',
          notes,
          status: 'active',
        };
      } else {
        const sessionId = `offline-idle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.currentIdleSession = {
          id: sessionId,
          workSessionId: this.currentWorkSessionId,
          startTime: now,
          reason: 'manual',
          notes,
          status: 'active',
        };
      }

      this.notifyStateChange();
      console.log('Manually started idle session');
    } catch (error) {
      console.error('Failed to manually start idle session:', error);
      throw error;
    }
  }

  /**
   * Manually end idle session
   */
  async manualEndIdle(): Promise<void> {
    if (!this.currentIdleSession) {
      throw new Error('No active idle session');
    }

    await this.endIdleSession();
    this.notifyStateChange();
    console.log('Manually ended idle session');
  }

  /**
   * Update idle settings
   */
  async updateSettings(updates: Partial<IdleSettings>): Promise<void> {
    if (!this.settings) {
      throw new Error('No idle settings found');
    }

    try {
      const isOnline = networkDetectionService.isCurrentlyOnline();

      if (isOnline && this.settingsId) {
        await updateIdleSettings(this.settingsId, updates);
      }

      // Update local settings
      this.settings = { ...this.settings, ...updates };

      // Update inactivity detection service
      if (this.isInitialized) {
        await this.initializeInactivityDetection();
      }

      this.notifyStateChange();
      console.log('Updated idle settings:', updates);
    } catch (error) {
      console.error('Failed to update idle settings:', error);
      throw error;
    }
  }

  /**
   * Get current state
   */
  getCurrentState(): IdleManagementState {
    const idleStats = inactivityDetectionService.getStats();
    
    return {
      isIdle: idleStats.isIdle,
      currentIdleSession: this.currentIdleSession,
      totalIdleTime: idleStats.totalIdleTime,
      settings: this.settings,
      isMonitoring: this.isInitialized && this.settings?.enabled === true,
    };
  }

  /**
   * Get idle sessions for current work session
   */
  async getIdleSessions(): Promise<IdleSession[]> {
    if (!this.currentWorkSessionId) {
      return [];
    }

    try {
      return await getIdleSessions(this.currentWorkSessionId);
    } catch (error) {
      console.error('Failed to get idle sessions:', error);
      return [];
    }
  }

  /**
   * Add state change callback
   */
  addStateCallback(callback: IdleManagementCallback): void {
    this.stateCallbacks.push(callback);
  }

  /**
   * Remove state change callback
   */
  removeStateCallback(callback: IdleManagementCallback): void {
    const index = this.stateCallbacks.indexOf(callback);
    if (index > -1) {
      this.stateCallbacks.splice(index, 1);
    }
  }

  /**
   * Notify state change callbacks
   */
  private notifyStateChange(): void {
    const state = this.getCurrentState();
    this.stateCallbacks.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('Error in idle management state callback:', error);
      }
    });
  }

  /**
   * Reset idle time
   */
  resetIdleTime(): void {
    inactivityDetectionService.resetIdleTime();
    this.notifyStateChange();
  }

  /**
   * Cleanup service
   */
  destroy(): void {
    this.stopMonitoring();
    this.stateCallbacks = [];
    this.currentEmployeeId = undefined;
    this.currentWorkSessionId = undefined;
    this.currentIdleSession = undefined;
    this.settings = null;
    this.isInitialized = false;
  }
}

// Export singleton instance
export const idleManagementService = IdleManagementService.getInstance();
