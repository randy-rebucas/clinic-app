/**
 * Network Detection Service
 * Monitors network connectivity and provides offline/online state management
 */

export interface NetworkState {
  isOnline: boolean;
  connectionType?: string;
  lastOnlineTime?: Date;
  lastOfflineTime?: Date;
  offlineDuration?: number; // in milliseconds
}

export type NetworkStateChangeCallback = (state: NetworkState) => void;

export class NetworkDetectionService {
  private static instance: NetworkDetectionService;
  private isOnline = navigator.onLine;
  private connectionType?: string;
  private lastOnlineTime?: Date;
  private lastOfflineTime?: Date;
  private callbacks: NetworkStateChangeCallback[] = [];
  private heartbeatInterval?: NodeJS.Timeout;
  private heartbeatUrl = 'https://www.google.com/favicon.ico'; // Lightweight endpoint
  private heartbeatIntervalMs = 30000; // 30 seconds

  static getInstance(): NetworkDetectionService {
    if (!NetworkDetectionService.instance) {
      NetworkDetectionService.instance = new NetworkDetectionService();
    }
    return NetworkDetectionService.instance;
  }

  /**
   * Initialize network detection service
   */
  async initialize(): Promise<void> {
    try {
      // Set initial state
      this.updateConnectionType();
      
      // Listen for online/offline events
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
      
      // Start heartbeat monitoring for more accurate detection
      this.startHeartbeat();
      
      // Initial state notification
      this.notifyCallbacks();
      
      console.log('Network detection service initialized');
    } catch (error) {
      console.error('Failed to initialize network detection service:', error);
    }
  }

  /**
   * Add callback for network state changes
   */
  addCallback(callback: NetworkStateChangeCallback): void {
    this.callbacks.push(callback);
  }

  /**
   * Remove callback for network state changes
   */
  removeCallback(callback: NetworkStateChangeCallback): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  /**
   * Get current network state
   */
  getNetworkState(): NetworkState {
    return {
      isOnline: this.isOnline,
      connectionType: this.connectionType,
      lastOnlineTime: this.lastOnlineTime,
      lastOfflineTime: this.lastOfflineTime,
      offlineDuration: this.calculateOfflineDuration(),
    };
  }

  /**
   * Check if currently online
   */
  isCurrentlyOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Force network check
   */
  async checkNetworkStatus(): Promise<boolean> {
    try {
      // Try to fetch a lightweight resource
      await fetch(this.heartbeatUrl, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache',
      });
      
      // If we get here without an error, we're online
      if (!this.isOnline) {
        this.handleOnline();
      }
      return true;
    } catch {
      // If we get an error, we're likely offline
      if (this.isOnline) {
        this.handleOffline();
      }
      return false;
    }
  }

  /**
   * Handle online event
   */
  private handleOnline(): void {
    const wasOffline = !this.isOnline;
    this.isOnline = true;
    this.lastOnlineTime = new Date();
    this.updateConnectionType();
    
    console.log('Network: Online', {
      connectionType: this.connectionType,
      wasOffline,
      offlineDuration: this.calculateOfflineDuration(),
    });
    
    this.notifyCallbacks();
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    const wasOnline = this.isOnline;
    this.isOnline = false;
    this.lastOfflineTime = new Date();
    
    console.log('Network: Offline', {
      wasOnline,
      lastOnlineTime: this.lastOnlineTime,
    });
    
    this.notifyCallbacks();
  }

  /**
   * Update connection type information
   */
  private updateConnectionType(): void {
    try {
      // Check for connection API support
      if ('connection' in navigator) {
        const connection = (navigator as Navigator & { connection?: { effectiveType?: string; type?: string } }).connection;
        this.connectionType = connection?.effectiveType || connection?.type || 'unknown';
      } else if ('mozConnection' in navigator) {
        const connection = (navigator as Navigator & { mozConnection?: { type?: string } }).mozConnection;
        this.connectionType = connection?.type || 'unknown';
      } else if ('webkitConnection' in navigator) {
        const connection = (navigator as Navigator & { webkitConnection?: { type?: string } }).webkitConnection;
        this.connectionType = connection?.type || 'unknown';
      } else {
        this.connectionType = 'unknown';
      }
    } catch (error) {
      console.warn('Failed to detect connection type:', error);
      this.connectionType = 'unknown';
    }
  }

  /**
   * Start heartbeat monitoring
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(async () => {
      await this.checkNetworkStatus();
    }, this.heartbeatIntervalMs);
  }

  /**
   * Stop heartbeat monitoring
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }

  /**
   * Calculate offline duration in milliseconds
   */
  private calculateOfflineDuration(): number | undefined {
    if (this.isOnline || !this.lastOfflineTime) {
      return undefined;
    }
    return Date.now() - this.lastOfflineTime.getTime();
  }

  /**
   * Notify all callbacks of state change
   */
  private notifyCallbacks(): void {
    const state = this.getNetworkState();
    this.callbacks.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('Error in network state callback:', error);
      }
    });
  }

  /**
   * Get connection quality indicator
   */
  getConnectionQuality(): 'excellent' | 'good' | 'fair' | 'poor' | 'unknown' {
    if (!this.connectionType || this.connectionType === 'unknown') {
      return 'unknown';
    }

    switch (this.connectionType) {
      case '4g':
        return 'excellent';
      case '3g':
        return 'good';
      case '2g':
        return 'fair';
      case 'slow-2g':
        return 'poor';
      default:
        return 'unknown';
    }
  }

  /**
   * Get estimated sync capability based on connection
   */
  canSyncData(): boolean {
    if (!this.isOnline) {
      return false;
    }

    const quality = this.getConnectionQuality();
    return quality !== 'poor' && quality !== 'unknown';
  }

  /**
   * Get recommended sync batch size based on connection
   */
  getRecommendedBatchSize(): number {
    if (!this.isOnline) {
      return 0;
    }

    const quality = this.getConnectionQuality();
    switch (quality) {
      case 'excellent':
        return 50;
      case 'good':
        return 20;
      case 'fair':
        return 10;
      case 'poor':
        return 5;
      default:
        return 10;
    }
  }

  /**
   * Cleanup service
   */
  destroy(): void {
    this.stopHeartbeat();
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    this.callbacks = [];
  }
}

// Export singleton instance
export const networkDetectionService = NetworkDetectionService.getInstance();
