/**
 * Screen Capture Service for Time Tracking
 * Captures screenshots every 15 minutes during active work sessions
 */

import { offlineStorageService } from './offlineStorage';
import { networkDetectionService } from './networkDetection';

export interface ScreenCaptureSettings {
  enabled: boolean;
  intervalMinutes: number;
  quality: number; // 0.1 to 1.0
  maxCapturesPerDay: number;
  requireUserConsent: boolean;
  // New random timing settings
  useRandomTiming: boolean;
  randomVariationPercent: number; // 0-100, percentage of variation
  // Burst mode settings
  burstModeEnabled: boolean;
  burstIntervalSeconds: number; // Minimum 30 seconds
  burstDurationMinutes: number; // How long burst mode lasts
  burstFrequency: 'low' | 'medium' | 'high' | 'custom'; // How often bursts occur
  customBurstIntervalMinutes: number; // For custom frequency
}

export interface ScreenCapture {
  id: string;
  employeeId: string;
  workSessionId: string;
  timestamp: Date;
  imageData: string; // Base64 encoded image
  thumbnail: string; // Base64 encoded thumbnail
  fileSize: number;
  isActive: boolean; // Whether user was actively working
}

export class ScreenCaptureService {
  private static instance: ScreenCaptureService;
  private captureInterval: NodeJS.Timeout | null = null;
  private burstInterval: NodeJS.Timeout | null = null;
  private burstTimeout: NodeJS.Timeout | null = null;
  private isCapturing = false;
  private isBurstMode = false;
  private currentStream: MediaStream | null = null;
  private lastCaptureTime = 0;
  private burstStartTime = 0;
  private settings: ScreenCaptureSettings = {
    enabled: false,
    intervalMinutes: 15,
    quality: 0.8,
    maxCapturesPerDay: 32, // 8 hours * 4 captures per hour
    requireUserConsent: true,
    useRandomTiming: true,
    randomVariationPercent: 25, // 25% variation by default
    burstModeEnabled: false,
    burstIntervalSeconds: 30,
    burstDurationMinutes: 5,
    burstFrequency: 'medium',
    customBurstIntervalMinutes: 30,
  };

  static getInstance(): ScreenCaptureService {
    if (!ScreenCaptureService.instance) {
      ScreenCaptureService.instance = new ScreenCaptureService();
    }
    return ScreenCaptureService.instance;
  }

  /**
   * Initialize screen capture service
   */
  async initialize(): Promise<boolean> {
    try {
      // Check if screen capture is supported
      if (!this.isScreenCaptureSupported()) {
        console.warn('Screen capture not supported in this browser');
        return false;
      }

      // Load settings from localStorage
      this.loadSettings();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize screen capture service:', error);
      return false;
    }
  }

  /**
   * Check if screen capture is supported
   */
  private isScreenCaptureSupported(): boolean {
    return typeof navigator !== 'undefined' && 
           'mediaDevices' in navigator && 
           'getDisplayMedia' in navigator.mediaDevices;
  }

  /**
   * Request user permission for screen capture
   */
  async requestPermission(): Promise<boolean> {
    try {
      if (!this.isScreenCaptureSupported()) {
        throw new Error('Screen capture not supported');
      }

      // Request screen capture permission
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop());
      
      return true;
    } catch (error) {
      console.error('Screen capture permission denied:', error);
      return false;
    }
  }

  /**
   * Start screen capture for a work session
   */
  async startCapture(employeeId: string, workSessionId: string): Promise<boolean> {
    if (!this.settings.enabled) {
      console.log('Screen capture is disabled');
      return false;
    }

    if (this.isCapturing) {
      console.log('Screen capture already active');
      return true;
    }

    try {
      // Request permission if required
      if (this.settings.requireUserConsent) {
        const hasPermission = await this.requestPermission();
        if (!hasPermission) {
          throw new Error('User denied screen capture permission');
        }
      }

      // Start capture with random timing or burst mode
      this.scheduleNextCapture(employeeId, workSessionId);
      
      // Start burst mode if enabled
      if (this.settings.burstModeEnabled) {
        this.startBurstMode(employeeId, workSessionId);
      }

      this.isCapturing = true;
      console.log(`Screen capture started - ${this.settings.useRandomTiming ? 'random timing' : 'fixed interval'} mode`);
      
      return true;
    } catch (error) {
      console.error('Failed to start screen capture:', error);
      return false;
    }
  }

  /**
   * Stop screen capture
   */
  stopCapture(): void {
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }

    if (this.burstInterval) {
      clearInterval(this.burstInterval);
      this.burstInterval = null;
    }

    if (this.burstTimeout) {
      clearTimeout(this.burstTimeout);
      this.burstTimeout = null;
    }

    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
      this.currentStream = null;
    }

    this.isCapturing = false;
    this.isBurstMode = false;
    console.log('Screen capture stopped');
  }

  /**
   * Capture a single screenshot
   */
  private async captureScreen(employeeId: string, workSessionId: string): Promise<void> {
    try {
      // Check if we've reached the daily limit
      const todayCaptures = await this.getTodayCaptureCount(employeeId);
      if (todayCaptures >= this.settings.maxCapturesPerDay) {
        console.log('Daily capture limit reached');
        return;
      }

      // Get screen stream
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for video to be ready
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      // Create canvas to capture frame
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Set canvas dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', this.settings.quality);
      
      // Create thumbnail
      const thumbnailCanvas = document.createElement('canvas');
      const thumbnailCtx = thumbnailCanvas.getContext('2d');
      
      if (!thumbnailCtx) {
        throw new Error('Failed to get thumbnail canvas context');
      }

      // Create thumbnail (200x150)
      const thumbnailSize = 200;
      const aspectRatio = canvas.width / canvas.height;
      thumbnailCanvas.width = thumbnailSize;
      thumbnailCanvas.height = thumbnailSize / aspectRatio;

      thumbnailCtx.drawImage(canvas, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
      const thumbnail = thumbnailCanvas.toDataURL('image/jpeg', 0.6);

      // Stop the stream
      stream.getTracks().forEach(track => track.stop());

      // Create capture record
      const capture: ScreenCapture = {
        id: `capture-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        employeeId,
        workSessionId,
        timestamp: new Date(),
        imageData,
        thumbnail,
        fileSize: this.getBase64Size(imageData),
        isActive: await this.detectActivity(),
      };

      // Save capture (online or offline)
      const isOnline = networkDetectionService.isCurrentlyOnline();
      if (isOnline) {
        await this.saveCapture(capture);
      } else {
        // Store offline for later sync
        await offlineStorageService.storeScreenCapture(capture);
        console.log('Offline: Screen capture stored locally for sync');
      }

      console.log(`Screen captured at ${capture.timestamp.toLocaleTimeString()}`);
      
    } catch (error) {
      console.error('Failed to capture screen:', error);
    }
  }

  /**
   * Schedule the next capture with random timing
   */
  private scheduleNextCapture(employeeId: string, workSessionId: string): void {
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
    }

    const baseInterval = this.settings.intervalMinutes * 60 * 1000; // Convert to milliseconds
    let nextInterval = baseInterval;

    if (this.settings.useRandomTiming) {
      // Add random variation
      const variation = this.settings.randomVariationPercent / 100;
      const randomFactor = 1 + (Math.random() - 0.5) * 2 * variation; // -variation to +variation
      nextInterval = Math.floor(baseInterval * randomFactor);
      
      // Ensure minimum interval of 1 minute
      nextInterval = Math.max(nextInterval, 60 * 1000);
    }

    this.captureInterval = setTimeout(async () => {
      await this.captureScreen(employeeId, workSessionId);
      this.lastCaptureTime = Date.now();
      
      // Schedule next capture
      this.scheduleNextCapture(employeeId, workSessionId);
    }, nextInterval);

    console.log(`Next capture scheduled in ${Math.round(nextInterval / 1000 / 60)} minutes`);
  }

  /**
   * Start burst mode for frequent captures
   */
  private startBurstMode(employeeId: string, workSessionId: string): void {
    if (this.burstInterval) {
      clearInterval(this.burstInterval);
    }

    const burstIntervalMs = this.settings.burstIntervalSeconds * 1000;
    const burstDurationMs = this.settings.burstDurationMinutes * 60 * 1000;

    // Start burst mode
    this.isBurstMode = true;
    this.burstStartTime = Date.now();

    this.burstInterval = setInterval(async () => {
      if (this.isBurstMode) {
        await this.captureScreen(employeeId, workSessionId);
      }
    }, burstIntervalMs);

    // Schedule burst mode end
    this.burstTimeout = setTimeout(() => {
      this.isBurstMode = false;
      if (this.burstInterval) {
        clearInterval(this.burstInterval);
        this.burstInterval = null;
      }
      console.log('Burst mode ended');
    }, burstDurationMs);

    console.log(`Burst mode started - capturing every ${this.settings.burstIntervalSeconds} seconds for ${this.settings.burstDurationMinutes} minutes`);
  }

  /**
   * Get burst frequency interval in minutes
   */
  private getBurstFrequencyInterval(): number {
    switch (this.settings.burstFrequency) {
      case 'low':
        return 60; // Every hour
      case 'medium':
        return 30; // Every 30 minutes
      case 'high':
        return 15; // Every 15 minutes
      case 'custom':
        return this.settings.customBurstIntervalMinutes;
      default:
        return 30;
    }
  }

  /**
   * Detect if user is actively working
   */
  private async detectActivity(): Promise<boolean> {
    // Simple activity detection based on mouse/keyboard events
    // In a real implementation, you might want more sophisticated detection
    return new Promise((resolve) => {
      let activityDetected = false;
      
      const activityHandler = () => {
        activityDetected = true;
      };

      // Listen for activity for 1 second
      document.addEventListener('mousemove', activityHandler);
      document.addEventListener('keydown', activityHandler);
      document.addEventListener('click', activityHandler);

      setTimeout(() => {
        document.removeEventListener('mousemove', activityHandler);
        document.removeEventListener('keydown', activityHandler);
        document.removeEventListener('click', activityHandler);
        resolve(activityDetected);
      }, 1000);
    });
  }

  /**
   * Save screen capture to storage
   */
  private async saveCapture(capture: ScreenCapture): Promise<void> {
    try {
      // In a real implementation, you would save to a database
      // For now, we'll save to localStorage as a demo
      const captures = this.getStoredCaptures();
      captures.push(capture);
      
      // Keep only last 100 captures to prevent storage overflow
      if (captures.length > 100) {
        captures.splice(0, captures.length - 100);
      }
      
      localStorage.setItem('screenCaptures', JSON.stringify(captures));
      
      // You could also send to server here
      // await this.sendToServer(capture);
      
    } catch (error) {
      console.error('Failed to save screen capture:', error);
    }
  }

  /**
   * Get stored captures from localStorage
   */
  private getStoredCaptures(): ScreenCapture[] {
    try {
      const stored = localStorage.getItem('screenCaptures');
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Initialize with demo captures if none exist
      const demoCaptures: ScreenCapture[] = [
        {
          id: 'demo-capture-1',
          employeeId: 'demo-employee-1',
          workSessionId: 'demo-session-1',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
          thumbnail: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
          fileSize: 1024,
          isActive: true,
        },
        {
          id: 'demo-capture-2',
          employeeId: 'demo-employee-1',
          workSessionId: 'demo-session-1',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
          thumbnail: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
          fileSize: 1024,
          isActive: true,
        },
      ];
      
      localStorage.setItem('screenCaptures', JSON.stringify(demoCaptures));
      return demoCaptures;
    } catch (error) {
      console.error('Failed to load stored captures:', error);
      return [];
    }
  }

  /**
   * Get today's capture count for an employee
   */
  private async getTodayCaptureCount(employeeId: string): Promise<number> {
    const captures = this.getStoredCaptures();
    const today = new Date().toDateString();
    
    return captures.filter(capture => 
      capture.employeeId === employeeId && 
      capture.timestamp.toDateString() === today
    ).length;
  }

  /**
   * Get base64 string size in bytes
   */
  private getBase64Size(base64: string): number {
    return Math.round((base64.length * 3) / 4);
  }

  /**
   * Update settings
   */
  updateSettings(newSettings: Partial<ScreenCaptureSettings>): void {
    console.log('Updating settings:', newSettings);
    this.settings = { ...this.settings, ...newSettings };
    console.log('New settings after update:', this.settings);
    this.saveSettings();
  }

  /**
   * Get current settings
   */
  getSettings(): ScreenCaptureSettings {
    // Always load settings from localStorage to ensure we have the latest
    this.loadSettings();
    return { ...this.settings };
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): void {
    try {
      const stored = localStorage.getItem('screenCaptureSettings');
      console.log('Loading settings from localStorage:', stored);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        console.log('Parsed settings from localStorage:', parsedSettings);
        this.settings = { ...this.settings, ...parsedSettings };
        console.log('Final settings after loading:', this.settings);
      } else {
        console.log('No stored settings found, using defaults');
      }
    } catch (error) {
      console.error('Failed to load screen capture settings:', error);
    }
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      console.log('Saving settings to localStorage:', this.settings);
      localStorage.setItem('screenCaptureSettings', JSON.stringify(this.settings));
      console.log('Settings saved successfully to localStorage');
    } catch (error) {
      console.error('Failed to save screen capture settings:', error);
    }
  }

  /**
   * Get captures for a specific work session
   */
  getCapturesForSession(workSessionId: string): ScreenCapture[] {
    const captures = this.getStoredCaptures();
    return captures.filter(capture => capture.workSessionId === workSessionId);
  }

  /**
   * Get captures for a specific employee
   */
  getCapturesForEmployee(employeeId: string, date?: Date): ScreenCapture[] {
    const captures = this.getStoredCaptures();
    let filtered = captures.filter(capture => capture.employeeId === employeeId);
    
    if (date) {
      const targetDate = date.toDateString();
      filtered = filtered.filter(capture => capture.timestamp.toDateString() === targetDate);
    }
    
    return filtered;
  }

  /**
   * Delete a specific capture
   */
  deleteCapture(captureId: string): boolean {
    try {
      const captures = this.getStoredCaptures();
      const filtered = captures.filter(capture => capture.id !== captureId);
      localStorage.setItem('screenCaptures', JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to delete capture:', error);
      return false;
    }
  }

  /**
   * Check if screen capture is currently active
   */
  isActive(): boolean {
    return this.isCapturing;
  }

  /**
   * Get capture statistics
   */
  getStats(employeeId: string, date?: Date): {
    totalCaptures: number;
    activeCaptures: number;
    totalSize: number;
    averageSize: number;
  } {
    const captures = this.getCapturesForEmployee(employeeId, date);
    const activeCaptures = captures.filter(capture => capture.isActive).length;
    const totalSize = captures.reduce((sum, capture) => sum + capture.fileSize, 0);
    
    return {
      totalCaptures: captures.length,
      activeCaptures,
      totalSize,
      averageSize: captures.length > 0 ? Math.round(totalSize / captures.length) : 0,
    };
  }

  /**
   * Get current capture status
   */
  getCaptureStatus(): {
    isCapturing: boolean;
    isBurstMode: boolean;
    lastCaptureTime: number;
    nextCaptureIn?: number;
    burstModeRemaining?: number;
  } {
    const now = Date.now();
    let nextCaptureIn: number | undefined;
    let burstModeRemaining: number | undefined;

    if (this.isCapturing && this.captureInterval) {
      // Calculate approximate next capture time (this is an estimate)
      const baseInterval = this.settings.intervalMinutes * 60 * 1000;
      const timeSinceLastCapture = now - this.lastCaptureTime;
      nextCaptureIn = Math.max(0, baseInterval - timeSinceLastCapture);
    }

    if (this.isBurstMode) {
      const burstDurationMs = this.settings.burstDurationMinutes * 60 * 1000;
      const burstElapsed = now - this.burstStartTime;
      burstModeRemaining = Math.max(0, burstDurationMs - burstElapsed);
    }

    return {
      isCapturing: this.isCapturing,
      isBurstMode: this.isBurstMode,
      lastCaptureTime: this.lastCaptureTime,
      nextCaptureIn,
      burstModeRemaining,
    };
  }

  /**
   * Manually trigger a burst mode session
   */
  async triggerBurstMode(employeeId: string, workSessionId: string): Promise<void> {
    if (!this.isCapturing) {
      console.log('Cannot trigger burst mode - capture not active');
      return;
    }

    // Stop any existing burst mode
    if (this.burstInterval) {
      clearInterval(this.burstInterval);
      this.burstInterval = null;
    }
    if (this.burstTimeout) {
      clearTimeout(this.burstTimeout);
      this.burstTimeout = null;
    }

    // Start new burst mode
    this.startBurstMode(employeeId, workSessionId);
  }
}

// Export singleton instance
export const screenCaptureService = ScreenCaptureService.getInstance();
