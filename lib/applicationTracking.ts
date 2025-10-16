/**
 * Application Tracking Service
 * Monitors active applications and tracks time spent on each
 */

import { Types } from 'mongoose';
import { IApplicationActivity } from './models/ApplicationActivity';

export interface ApplicationActivity {
  id: string;
  employeeId: string;
  workSessionId: string;
  applicationName: string;
  windowTitle: string;
  processName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  isActive: boolean;
  category?: 'productivity' | 'communication' | 'development' | 'design' | 'browsing' | 'entertainment' | 'other';
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationTrackingSettings {
  id: string;
  employeeId: string;
  enabled: boolean;
  trackApplications: boolean;
  trackWebsites: boolean;
  trackWindowTitles: boolean;
  samplingInterval: number; // seconds between samples
  maxIdleTime: number; // seconds before considering inactive
  categoryRules: {
    [key: string]: string; // process name or domain -> category
  };
  privacyMode: boolean; // if true, only track categories, not specific apps
  createdAt: Date;
  updatedAt: Date;
}

class ApplicationTrackingService {
  private static instance: ApplicationTrackingService;
  private isTracking = false;
  private currentActivity: ApplicationActivity | null = null;
  private trackingInterval: NodeJS.Timeout | null = null;
  private settings: ApplicationTrackingSettings | null = null;
  private employeeId: string | null = null;
  private workSessionId: string | null = null;

  private constructor() {}

  static getInstance(): ApplicationTrackingService {
    if (!ApplicationTrackingService.instance) {
      ApplicationTrackingService.instance = new ApplicationTrackingService();
    }
    return ApplicationTrackingService.instance;
  }

  /**
   * Initialize the tracking service
   */
  async initialize(employeeId: string, settings?: Partial<ApplicationTrackingSettings>): Promise<void> {
    this.employeeId = employeeId;
    
    if (settings) {
      this.settings = settings as ApplicationTrackingSettings;
    } else {
      // Load settings from database or use defaults
      this.settings = await this.getDefaultSettings(employeeId);
    }

    console.log('Application tracking service initialized');
  }

  /**
   * Start tracking applications
   */
  async startTracking(workSessionId: string): Promise<void> {
    if (!this.employeeId || !this.settings?.enabled) {
      console.log('Application tracking not enabled or not initialized');
      return;
    }

    this.workSessionId = workSessionId;
    this.isTracking = true;

    // Start periodic tracking
    this.trackingInterval = setInterval(() => {
      this.trackCurrentApplication();
    }, (this.settings.samplingInterval || 5) * 1000);

    console.log('Application tracking started');
  }

  /**
   * Stop tracking applications
   */
  stopTracking(): void {
    this.isTracking = false;
    
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }

    // End current activity if any
    if (this.currentActivity) {
      this.endCurrentActivity();
    }

    console.log('Application tracking stopped');
  }

  /**
   * Track the currently active application
   */
  private async trackCurrentApplication(): Promise<void> {
    if (!this.isTracking || !this.employeeId || !this.workSessionId || !this.settings) {
      return;
    }

    try {
      const activeApp = await this.getActiveApplication();
      
      if (!activeApp) {
        return;
      }

      // Check if we're still on the same application
      if (this.currentActivity && 
          this.currentActivity.processName === activeApp.processName &&
          this.currentActivity.windowTitle === activeApp.windowTitle) {
        return; // Same application, no need to update
      }

      // End current activity
      if (this.currentActivity) {
        await this.endCurrentActivity();
      }

      // Start new activity
      await this.startNewActivity(activeApp);

    } catch (error) {
      console.error('Error tracking application:', error);
    }
  }

  /**
   * Get the currently active application
   */
  private async getActiveApplication(): Promise<{
    applicationName: string;
    windowTitle: string;
    processName: string;
  } | null> {
    try {
      // This would need to be implemented based on the platform
      // For now, we'll use a mock implementation
      // In a real implementation, you'd use platform-specific APIs
      
      if (typeof window !== 'undefined' && 'navigator' in window) {
        // Browser environment - limited tracking capabilities
        return {
          applicationName: 'Browser',
          windowTitle: document.title || 'Unknown',
          processName: 'browser'
        };
      }

      // For desktop applications, you'd need platform-specific code
      // This is a placeholder for the actual implementation
      return {
        applicationName: 'Unknown Application',
        windowTitle: 'Unknown Window',
        processName: 'unknown'
      };

    } catch (error) {
      console.error('Error getting active application:', error);
      return null;
    }
  }

  /**
   * Start tracking a new application activity
   */
  private async startNewActivity(appInfo: {
    applicationName: string;
    windowTitle: string;
    processName: string;
  }): Promise<void> {
    if (!this.employeeId || !this.workSessionId || !this.settings) {
      return;
    }

    const category = this.categorizeApplication(appInfo.processName, appInfo.windowTitle);
    
    this.currentActivity = {
      id: `app-activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      employeeId: this.employeeId,
      workSessionId: this.workSessionId,
      applicationName: this.settings.privacyMode ? this.getCategoryDisplayName(category) : appInfo.applicationName,
      windowTitle: this.settings.trackWindowTitles ? appInfo.windowTitle : '',
      processName: this.settings.privacyMode ? category : appInfo.processName,
      startTime: new Date(),
      isActive: true,
      category: category as 'productivity' | 'communication' | 'development' | 'design' | 'browsing' | 'entertainment' | 'other',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store in database
    await this.storeActivity(this.currentActivity);
  }

  /**
   * End the current activity
   */
  private async endCurrentActivity(): Promise<void> {
    if (!this.currentActivity) {
      return;
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - this.currentActivity.startTime.getTime()) / 1000);

    this.currentActivity.endTime = endTime;
    this.currentActivity.duration = duration;
    this.currentActivity.isActive = false;
    this.currentActivity.updatedAt = endTime;

    // Update in database
    await this.updateActivity(this.currentActivity);

    this.currentActivity = null;
  }

  /**
   * Categorize an application based on process name and window title
   */
  private categorizeApplication(processName: string, windowTitle: string): string {
    if (!this.settings?.categoryRules) {
      return 'other';
    }

    const lowerProcess = processName.toLowerCase();
    const lowerTitle = windowTitle.toLowerCase();

    // Check category rules
    for (const [pattern, category] of Object.entries(this.settings.categoryRules)) {
      const lowerPattern = pattern.toLowerCase();
      if (lowerProcess.includes(lowerPattern) || lowerTitle.includes(lowerPattern)) {
        return category;
      }
    }

    // Default categorization based on common patterns
    if (lowerProcess.includes('chrome') || lowerProcess.includes('firefox') || lowerProcess.includes('safari') || lowerProcess.includes('edge')) {
      return 'browsing';
    }
    if (lowerProcess.includes('slack') || lowerProcess.includes('teams') || lowerProcess.includes('discord') || lowerProcess.includes('zoom')) {
      return 'communication';
    }
    if (lowerProcess.includes('vscode') || lowerProcess.includes('code') || lowerProcess.includes('sublime') || lowerProcess.includes('atom')) {
      return 'development';
    }
    if (lowerProcess.includes('photoshop') || lowerProcess.includes('figma') || lowerProcess.includes('sketch') || lowerProcess.includes('illustrator')) {
      return 'design';
    }
    if (lowerProcess.includes('excel') || lowerProcess.includes('word') || lowerProcess.includes('powerpoint') || lowerProcess.includes('notion')) {
      return 'productivity';
    }

    return 'other';
  }

  /**
   * Get display name for category
   */
  private getCategoryDisplayName(category: string): string {
    const categoryNames: { [key: string]: string } = {
      'productivity': 'Productivity App',
      'communication': 'Communication App',
      'development': 'Development Tool',
      'design': 'Design Tool',
      'browsing': 'Web Browser',
      'entertainment': 'Entertainment',
      'other': 'Other Application'
    };
    return categoryNames[category] || 'Unknown Application';
  }

  /**
   * Store activity in database
   */
  private async storeActivity(activity: ApplicationActivity): Promise<void> {
    try {
      const { createApplicationActivity } = await import('./database');
      await createApplicationActivity({
        employeeId: activity.employeeId as unknown as Types.ObjectId,
        workSessionId: activity.workSessionId as unknown as Types.ObjectId,
        applicationName: activity.applicationName,
        windowTitle: activity.windowTitle,
        processName: activity.processName,
        startTime: activity.startTime,
        endTime: activity.endTime,
        duration: activity.duration,
        isActive: activity.isActive,
        category: activity.category
      } as Omit<IApplicationActivity, '_id' | 'createdAt' | 'updatedAt'>);
    } catch (error) {
      console.error('Error storing application activity:', error);
    }
  }

  /**
   * Update activity in database
   */
  private async updateActivity(activity: ApplicationActivity): Promise<void> {
    try {
      const { updateApplicationActivity } = await import('./database');
      await updateApplicationActivity(activity.id, {
        endTime: activity.endTime,
        duration: activity.duration,
        isActive: activity.isActive
      });
    } catch (error) {
      console.error('Error updating application activity:', error);
    }
  }

  /**
   * Get default settings for an employee
   */
  private async getDefaultSettings(employeeId: string): Promise<ApplicationTrackingSettings> {
    return {
      id: `app-tracking-settings-${employeeId}`,
      employeeId,
      enabled: true,
      trackApplications: true,
      trackWebsites: true,
      trackWindowTitles: true,
      samplingInterval: 5,
      maxIdleTime: 30,
      categoryRules: {
        'chrome': 'browsing',
        'firefox': 'browsing',
        'safari': 'browsing',
        'edge': 'browsing',
        'slack': 'communication',
        'teams': 'communication',
        'discord': 'communication',
        'zoom': 'communication',
        'vscode': 'development',
        'code': 'development',
        'sublime': 'development',
        'atom': 'development',
        'photoshop': 'design',
        'figma': 'design',
        'sketch': 'design',
        'illustrator': 'design',
        'excel': 'productivity',
        'word': 'productivity',
        'powerpoint': 'productivity',
        'notion': 'productivity'
      },
      privacyMode: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Get current tracking status
   */
  getTrackingStatus(): {
    isTracking: boolean;
    currentActivity: ApplicationActivity | null;
    settings: ApplicationTrackingSettings | null;
  } {
    return {
      isTracking: this.isTracking,
      currentActivity: this.currentActivity,
      settings: this.settings
    };
  }

  /**
   * Update tracking settings
   */
  async updateSettings(updates: Partial<ApplicationTrackingSettings>): Promise<void> {
    if (!this.settings) {
      return;
    }

    this.settings = {
      ...this.settings,
      ...updates,
      updatedAt: new Date()
    };

    // Save to database
    // await updateApplicationTrackingSettings(this.settings.id, updates);
  }
}

export const applicationTrackingService = ApplicationTrackingService.getInstance();
