/**
 * Sync Service for Offline Data
 * Handles automatic synchronization of offline data when connection is restored
 */

import { offlineStorageService } from './offlineStorage';
import { networkDetectionService, NetworkState } from './networkDetection';
import { ITimeEntry, IWorkSession, IBreakSession } from './models';
import { 
  createTimeEntry, 
  createWorkSession, 
  createBreakSession
} from './database';

export interface SyncProgress {
  totalItems: number;
  syncedItems: number;
  failedItems: number;
  currentItem?: string;
  isRunning: boolean;
  lastSyncTime?: Date;
  errors: string[];
}

export type SyncProgressCallback = (progress: SyncProgress) => void;

export class SyncService {
  private static instance: SyncService;
  private isRunning = false;
  private progressCallbacks: SyncProgressCallback[] = [];
  private syncInterval?: NodeJS.Timeout;
  private autoSyncEnabled = true;
  private syncIntervalMs = 60000; // 1 minute

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * Initialize sync service
   */
  async initialize(): Promise<void> {
    try {
      // Listen for network state changes
      networkDetectionService.addCallback(this.handleNetworkStateChange.bind(this));
      
      // Start periodic sync check
      this.startPeriodicSync();
      
      // Initial sync if online
      if (networkDetectionService.isCurrentlyOnline()) {
        await this.syncOfflineData();
      }
      
      console.log('Sync service initialized');
    } catch (error) {
      console.error('Failed to initialize sync service:', error);
    }
  }

  /**
   * Add callback for sync progress updates
   */
  addProgressCallback(callback: SyncProgressCallback): void {
    this.progressCallbacks.push(callback);
  }

  /**
   * Remove callback for sync progress updates
   */
  removeProgressCallback(callback: SyncProgressCallback): void {
    const index = this.progressCallbacks.indexOf(callback);
    if (index > -1) {
      this.progressCallbacks.splice(index, 1);
    }
  }

  /**
   * Handle network state changes
   */
  private async handleNetworkStateChange(state: NetworkState): Promise<void> {
    if (state.isOnline && this.autoSyncEnabled) {
      console.log('Network back online, starting sync...');
      await this.syncOfflineData();
    }
  }

  /**
   * Start periodic sync check
   */
  private startPeriodicSync(): void {
    this.syncInterval = setInterval(async () => {
      if (networkDetectionService.isCurrentlyOnline() && this.autoSyncEnabled) {
        await this.syncOfflineData();
      }
    }, this.syncIntervalMs);
  }

  /**
   * Stop periodic sync check
   */
  private stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
  }

  /**
   * Sync all offline data
   */
  async syncOfflineData(): Promise<SyncProgress> {
    if (this.isRunning) {
      console.log('Sync already running, skipping...');
      return this.getCurrentProgress();
    }

    if (!networkDetectionService.isCurrentlyOnline()) {
      console.log('No network connection, skipping sync');
      return this.getCurrentProgress();
    }

    this.isRunning = true;
    
    try {
      const pendingItems = offlineStorageService.getPendingSyncItems();
      const totalItems = pendingItems.timeEntries.length + 
                        pendingItems.workSessions.length + 
                        pendingItems.breakSessions.length + 
                        pendingItems.screenCaptures.length;

      let syncedItems = 0;
      let failedItems = 0;
      const errors: string[] = [];

      console.log(`Starting sync of ${totalItems} offline items`);

      // Sync time entries
      for (const timeEntry of pendingItems.timeEntries) {
        try {
          this.updateProgress({
            totalItems,
            syncedItems,
            failedItems,
            currentItem: `Time Entry: ${timeEntry.type}`,
            isRunning: true,
            errors,
          });

          offlineStorageService.markAsSyncing('timeEntry', timeEntry.id!);
          
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, isOffline, syncStatus, lastSyncAttempt, retryCount, ...cleanTimeEntry } = timeEntry;
          await createTimeEntry(cleanTimeEntry as unknown as Omit<ITimeEntry, '_id'>);
          
          offlineStorageService.markAsSynced('timeEntry', timeEntry.id!);
          syncedItems++;
          
          console.log(`Synced time entry: ${timeEntry.id}`);
        } catch (error) {
          const errorMsg = `Failed to sync time entry ${timeEntry.id}: ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
          offlineStorageService.markAsFailed('timeEntry', timeEntry.id!);
          failedItems++;
        }
      }

      // Sync work sessions
      for (const workSession of pendingItems.workSessions) {
        try {
          this.updateProgress({
            totalItems,
            syncedItems,
            failedItems,
            currentItem: `Work Session: ${workSession.employeeId}`,
            isRunning: true,
            errors,
          });

          offlineStorageService.markAsSyncing('workSession', workSession.id!);
          
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, isOffline, syncStatus, lastSyncAttempt, retryCount, ...cleanWorkSession } = workSession;
          await createWorkSession(cleanWorkSession as unknown as Omit<IWorkSession, '_id' | 'createdAt' | 'updatedAt'>);
          
          offlineStorageService.markAsSynced('workSession', workSession.id!);
          syncedItems++;
          
          console.log(`Synced work session: ${workSession.id}`);
        } catch (error) {
          const errorMsg = `Failed to sync work session ${workSession.id}: ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
          offlineStorageService.markAsFailed('workSession', workSession.id!);
          failedItems++;
        }
      }

      // Sync break sessions
      for (const breakSession of pendingItems.breakSessions) {
        try {
          this.updateProgress({
            totalItems,
            syncedItems,
            failedItems,
            currentItem: `Break Session: ${breakSession.workSessionId}`,
            isRunning: true,
            errors,
          });

          offlineStorageService.markAsSyncing('breakSession', breakSession.id!);
          
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, isOffline, syncStatus, lastSyncAttempt, retryCount, ...cleanBreakSession } = breakSession;
          await createBreakSession(cleanBreakSession as unknown as Omit<IBreakSession, '_id'>);
          
          offlineStorageService.markAsSynced('breakSession', breakSession.id!);
          syncedItems++;
          
          console.log(`Synced break session: ${breakSession.id}`);
        } catch (error) {
          const errorMsg = `Failed to sync break session ${breakSession.id}: ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
          offlineStorageService.markAsFailed('breakSession', breakSession.id!);
          failedItems++;
        }
      }

      // Note: Screen captures would need a separate endpoint to upload files
      // For now, we'll mark them as synced if they're stored locally
      for (const screenCapture of pendingItems.screenCaptures) {
        try {
          this.updateProgress({
            totalItems,
            syncedItems,
            failedItems,
            currentItem: `Screen Capture: ${screenCapture.id}`,
            isRunning: true,
            errors,
          });

          // Upload screen capture to server
          try {
            const formData = new FormData();
            formData.append('file', screenCapture.imageData);
            formData.append('employeeId', screenCapture.employeeId);
            formData.append('timestamp', screenCapture.timestamp.toISOString());
            formData.append('workSessionId', screenCapture.workSessionId || '');
            
            const response = await fetch('/api/screen-captures', {
              method: 'POST',
              body: formData,
            });
            
            if (response.ok) {
              offlineStorageService.markAsSynced('screenCapture', screenCapture.id);
            } else {
              throw new Error(`Server responded with status: ${response.status}`);
            }
          } catch (uploadError) {
            // If upload fails, keep it in offline storage for retry
            console.warn(`Failed to upload screen capture ${screenCapture.id}, keeping offline:`, uploadError);
            throw uploadError;
          }
          syncedItems++;
          
          console.log(`Synced screen capture: ${screenCapture.id}`);
        } catch (error) {
          const errorMsg = `Failed to sync screen capture ${screenCapture.id}: ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
          offlineStorageService.markAsFailed('screenCapture', screenCapture.id);
          failedItems++;
        }
      }

      // Clean up synced items
      offlineStorageService.removeSyncedItems();

      const finalProgress: SyncProgress = {
        totalItems,
        syncedItems,
        failedItems,
        isRunning: false,
        lastSyncTime: new Date(),
        errors,
      };

      this.updateProgress(finalProgress);
      
      console.log(`Sync completed: ${syncedItems}/${totalItems} items synced, ${failedItems} failed`);
      
      return finalProgress;
      
    } catch (error) {
      const errorMsg = `Sync failed: ${error}`;
      console.error(errorMsg);
      
      const finalProgress: SyncProgress = {
        totalItems: 0,
        syncedItems: 0,
        failedItems: 0,
        isRunning: false,
        lastSyncTime: new Date(),
        errors: [errorMsg],
      };
      
      this.updateProgress(finalProgress);
      return finalProgress;
      
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Force sync now
   */
  async forceSyncNow(): Promise<SyncProgress> {
    console.log('Force sync requested');
    return await this.syncOfflineData();
  }

  /**
   * Get current sync progress
   */
  getCurrentProgress(): SyncProgress {
    const stats = offlineStorageService.getSyncStats();
    
    return {
      totalItems: stats.totalPending + stats.totalSynced + stats.totalFailed,
      syncedItems: stats.totalSynced,
      failedItems: stats.totalFailed,
      isRunning: this.isRunning,
      lastSyncTime: stats.lastSyncTime,
      errors: [],
    };
  }

  /**
   * Update progress and notify callbacks
   */
  private updateProgress(progress: SyncProgress): void {
    this.progressCallbacks.forEach(callback => {
      try {
        callback(progress);
      } catch (error) {
        console.error('Error in sync progress callback:', error);
      }
    });
  }

  /**
   * Enable/disable auto sync
   */
  setAutoSyncEnabled(enabled: boolean): void {
    this.autoSyncEnabled = enabled;
    console.log(`Auto sync ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if auto sync is enabled
   */
  isAutoSyncEnabled(): boolean {
    return this.autoSyncEnabled;
  }

  /**
   * Get sync statistics
   */
  getSyncStats(): {
    totalPending: number;
    totalSynced: number;
    totalFailed: number;
    lastSyncTime?: Date;
    isOnline: boolean;
    canSync: boolean;
  } {
    const stats = offlineStorageService.getSyncStats();
    const networkState = networkDetectionService.getNetworkState();
    
    return {
      ...stats,
      isOnline: networkState.isOnline,
      canSync: networkDetectionService.canSyncData(),
    };
  }

  /**
   * Retry failed items
   */
  async retryFailedItems(): Promise<SyncProgress> {
    console.log('Retrying failed items...');
    return await this.syncOfflineData();
  }

  /**
   * Cleanup service
   */
  destroy(): void {
    this.stopPeriodicSync();
    this.progressCallbacks = [];
    this.isRunning = false;
  }
}

// Export singleton instance
export const syncService = SyncService.getInstance();
