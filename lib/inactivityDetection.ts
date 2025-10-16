/**
 * Inactivity Detection Service
 * Monitors user activity and manages idle state for time tracking
 */

export interface IdleSettings {
  enabled: boolean;
  idleThresholdMinutes: number; // Minutes of inactivity before considered idle
  pauseTimerOnIdle: boolean; // Whether to pause timer when idle
  showIdleWarning: boolean; // Whether to show warning before going idle
  warningTimeMinutes: number; // Minutes before idle to show warning
  autoResumeOnActivity: boolean; // Whether to auto-resume timer when activity detected
}

export interface IdleState {
  isIdle: boolean;
  idleStartTime?: Date;
  lastActivityTime: Date;
  warningShown: boolean;
  totalIdleTime: number; // in minutes
}

export type IdleStateChangeCallback = (state: IdleState) => void;
export type IdleWarningCallback = () => void;

export class InactivityDetectionService {
  private static instance: InactivityDetectionService;
  private isMonitoring = false;
  private idleTimer?: NodeJS.Timeout;
  private warningTimer?: NodeJS.Timeout;
  private lastActivityTime = new Date();
  private currentIdleStartTime?: Date;
  private totalIdleTime = 0;
  private stateCallbacks: IdleStateChangeCallback[] = [];
  private warningCallbacks: IdleWarningCallback[] = [];
  private settings: IdleSettings = {
    enabled: true,
    idleThresholdMinutes: 5, // 5 minutes default
    pauseTimerOnIdle: true,
    showIdleWarning: true,
    warningTimeMinutes: 1, // 1 minute warning
    autoResumeOnActivity: true,
  };

  // Activity detection events
  private activityEvents = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click',
    'keydown',
    'wheel',
  ];

  static getInstance(): InactivityDetectionService {
    if (!InactivityDetectionService.instance) {
      InactivityDetectionService.instance = new InactivityDetectionService();
    }
    return InactivityDetectionService.instance;
  }

  /**
   * Initialize inactivity detection service
   */
  async initialize(): Promise<void> {
    try {
      // Load settings from localStorage
      this.loadSettings();
      
      // Start monitoring if enabled
      if (this.settings.enabled) {
        this.startMonitoring();
      }
      
      console.log('Inactivity detection service initialized');
    } catch (error) {
      console.error('Failed to initialize inactivity detection service:', error);
    }
  }

  /**
   * Start monitoring for inactivity
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.lastActivityTime = new Date();
    this.currentIdleStartTime = undefined;
    this.totalIdleTime = 0;

    // Add event listeners for activity detection
    this.activityEvents.forEach(event => {
      document.addEventListener(event, this.handleActivity.bind(this), true);
    });

    // Start the idle timer
    this.resetIdleTimer();
    
    console.log('Started monitoring for inactivity');
  }

  /**
   * Stop monitoring for inactivity
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;

    // Remove event listeners
    this.activityEvents.forEach(event => {
      document.removeEventListener(event, this.handleActivity.bind(this), true);
    });

    // Clear timers
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = undefined;
    }

    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = undefined;
    }

    console.log('Stopped monitoring for inactivity');
  }

  /**
   * Handle user activity
   */
  private handleActivity(): void {
    const now = new Date();
    const wasIdle = this.isCurrentlyIdle();
    
    this.lastActivityTime = now;

    // If we were idle and now have activity, resume
    if (wasIdle && this.settings.autoResumeOnActivity) {
      this.resumeFromIdle();
    }

    // Reset timers
    this.resetIdleTimer();
  }

  /**
   * Reset the idle timer
   */
  private resetIdleTimer(): void {
    // Clear existing timers
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
    }

    // Set warning timer if enabled
    if (this.settings.showIdleWarning && this.settings.warningTimeMinutes > 0) {
      const warningDelay = (this.settings.idleThresholdMinutes - this.settings.warningTimeMinutes) * 60 * 1000;
      this.warningTimer = setTimeout(() => {
        this.showIdleWarning();
      }, warningDelay);
    }

    // Set idle timer
    this.idleTimer = setTimeout(() => {
      this.setIdle();
    }, this.settings.idleThresholdMinutes * 60 * 1000);
  }

  /**
   * Show idle warning
   */
  private showIdleWarning(): void {
    this.warningCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in idle warning callback:', error);
      }
    });
  }

  /**
   * Set user as idle
   */
  private setIdle(): void {
    if (this.isCurrentlyIdle()) {
      return; // Already idle
    }

    this.currentIdleStartTime = new Date();
    const state = this.getCurrentState();
    
    this.notifyStateChange(state);
    
    console.log('User is now idle');
  }

  /**
   * Resume from idle state
   */
  private resumeFromIdle(): void {
    if (!this.isCurrentlyIdle()) {
      return; // Not idle
    }

    // Calculate total idle time
    if (this.currentIdleStartTime) {
      const idleDuration = Math.floor(
        (Date.now() - this.currentIdleStartTime.getTime()) / (1000 * 60)
      );
      this.totalIdleTime += idleDuration;
    }

    this.currentIdleStartTime = undefined;
    const state = this.getCurrentState();
    
    this.notifyStateChange(state);
    
    console.log('User resumed from idle');
  }

  /**
   * Check if user is currently idle
   */
  isCurrentlyIdle(): boolean {
    return this.currentIdleStartTime !== undefined;
  }

  /**
   * Get current idle state
   */
  getCurrentState(): IdleState {
    const currentIdleTime = this.isCurrentlyIdle() && this.currentIdleStartTime
      ? Math.floor((Date.now() - this.currentIdleStartTime.getTime()) / (1000 * 60))
      : 0;

    return {
      isIdle: this.isCurrentlyIdle(),
      idleStartTime: this.currentIdleStartTime,
      lastActivityTime: this.lastActivityTime,
      warningShown: false, // This would be set by the warning system
      totalIdleTime: this.totalIdleTime + currentIdleTime,
    };
  }

  /**
   * Get current settings
   */
  getSettings(): IdleSettings {
    return { ...this.settings };
  }

  /**
   * Update settings
   */
  updateSettings(newSettings: Partial<IdleSettings>): void {
    const oldEnabled = this.settings.enabled;
    this.settings = { ...this.settings, ...newSettings };
    
    // Save to localStorage
    this.saveSettings();
    
    // Restart monitoring if settings changed
    if (oldEnabled !== this.settings.enabled) {
      if (this.settings.enabled) {
        this.startMonitoring();
      } else {
        this.stopMonitoring();
      }
    } else if (this.settings.enabled && this.isMonitoring) {
      // Reset timers with new settings
      this.resetIdleTimer();
    }
    
    console.log('Updated inactivity detection settings:', this.settings);
  }

  /**
   * Add callback for idle state changes
   */
  addStateCallback(callback: IdleStateChangeCallback): void {
    this.stateCallbacks.push(callback);
  }

  /**
   * Remove callback for idle state changes
   */
  removeStateCallback(callback: IdleStateChangeCallback): void {
    const index = this.stateCallbacks.indexOf(callback);
    if (index > -1) {
      this.stateCallbacks.splice(index, 1);
    }
  }

  /**
   * Add callback for idle warnings
   */
  addWarningCallback(callback: IdleWarningCallback): void {
    this.warningCallbacks.push(callback);
  }

  /**
   * Remove callback for idle warnings
   */
  removeWarningCallback(callback: IdleWarningCallback): void {
    const index = this.warningCallbacks.indexOf(callback);
    if (index > -1) {
      this.warningCallbacks.splice(index, 1);
    }
  }

  /**
   * Notify state change callbacks
   */
  private notifyStateChange(state: IdleState): void {
    this.stateCallbacks.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('Error in idle state callback:', error);
      }
    });
  }

  /**
   * Reset idle time counter
   */
  resetIdleTime(): void {
    this.totalIdleTime = 0;
    this.currentIdleStartTime = undefined;
    this.lastActivityTime = new Date();
    this.resetIdleTimer();
    
    const state = this.getCurrentState();
    this.notifyStateChange(state);
  }

  /**
   * Get idle statistics
   */
  getStats(): {
    totalIdleTime: number;
    currentIdleTime: number;
    isIdle: boolean;
    lastActivityTime: Date;
    settings: IdleSettings;
  } {
    const currentIdleTime = this.isCurrentlyIdle() && this.currentIdleStartTime
      ? Math.floor((Date.now() - this.currentIdleStartTime.getTime()) / (1000 * 60))
      : 0;

    return {
      totalIdleTime: this.totalIdleTime,
      currentIdleTime,
      isIdle: this.isCurrentlyIdle(),
      lastActivityTime: this.lastActivityTime,
      settings: this.getSettings(),
    };
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): void {
    try {
      const stored = localStorage.getItem('inactivityDetectionSettings');
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        this.settings = { ...this.settings, ...parsedSettings };
      }
    } catch (error) {
      console.error('Failed to load inactivity detection settings:', error);
    }
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem('inactivityDetectionSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save inactivity detection settings:', error);
    }
  }

  /**
   * Cleanup service
   */
  destroy(): void {
    this.stopMonitoring();
    this.stateCallbacks = [];
    this.warningCallbacks = [];
  }
}

// Export singleton instance
export const inactivityDetectionService = InactivityDetectionService.getInstance();
