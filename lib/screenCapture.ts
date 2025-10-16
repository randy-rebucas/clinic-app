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
  private isCapturing = false;
  private currentStream: MediaStream | null = null;
  private settings: ScreenCaptureSettings = {
    enabled: false,
    intervalMinutes: 15,
    quality: 0.8,
    maxCapturesPerDay: 32, // 8 hours * 4 captures per hour
    requireUserConsent: true,
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

      // Start capture interval
      this.captureInterval = setInterval(async () => {
        await this.captureScreen(employeeId, workSessionId);
      }, this.settings.intervalMinutes * 60 * 1000);

      this.isCapturing = true;
      console.log(`Screen capture started - capturing every ${this.settings.intervalMinutes} minutes`);
      
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

    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
      this.currentStream = null;
    }

    this.isCapturing = false;
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
}

// Export singleton instance
export const screenCaptureService = ScreenCaptureService.getInstance();
