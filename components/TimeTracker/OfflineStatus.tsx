'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Database,
  Upload,
  Download
} from 'lucide-react';
import { networkDetectionService, NetworkState } from '@/lib/networkDetection';
import { syncService, SyncProgress } from '@/lib/syncService';
import { offlineStorageService } from '@/lib/offlineStorage';

export default function OfflineStatus() {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isOnline: true,
  });
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({
    totalItems: 0,
    syncedItems: 0,
    failedItems: 0,
    isRunning: false,
    errors: [],
  });
  const [showDetails, setShowDetails] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | undefined>();

  useEffect(() => {
    // Initialize services
    const initializeServices = async () => {
      await networkDetectionService.initialize();
      await syncService.initialize();
      await offlineStorageService.initialize();
    };

    initializeServices();

    // Add callbacks
    const handleNetworkChange = (state: NetworkState) => {
      setNetworkState(state);
    };

    const handleSyncProgress = (progress: SyncProgress) => {
      setSyncProgress(progress);
      if (progress.lastSyncTime) {
        setLastSyncTime(progress.lastSyncTime);
      }
    };

    networkDetectionService.addCallback(handleNetworkChange);
    syncService.addProgressCallback(handleSyncProgress);

    // Get initial state
    setNetworkState(networkDetectionService.getNetworkState());
    setSyncProgress(syncService.getCurrentProgress());

    return () => {
      networkDetectionService.removeCallback(handleNetworkChange);
      syncService.removeProgressCallback(handleSyncProgress);
    };
  }, []);

  const handleForceSync = async () => {
    try {
      await syncService.forceSyncNow();
    } catch (error) {
      console.error('Failed to force sync:', error);
    }
  };

  const handleRetryFailed = async () => {
    try {
      await syncService.retryFailedItems();
    } catch (error) {
      console.error('Failed to retry failed items:', error);
    }
  };

  const getConnectionQualityColor = () => {
    const quality = networkDetectionService.getConnectionQuality();
    switch (quality) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'fair':
        return 'text-yellow-600';
      case 'poor':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSyncStatusColor = () => {
    if (syncProgress.isRunning) {
      return 'text-blue-600';
    }
    if (syncProgress.failedItems > 0) {
      return 'text-red-600';
    }
    if (syncProgress.totalItems === 0) {
      return 'text-gray-600';
    }
    return 'text-green-600';
  };

  const formatLastSyncTime = (time: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      return `${diffHours}h ago`;
    }
  };

  const formatOfflineDuration = (duration: number) => {
    const minutes = Math.floor(duration / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-100 rounded-lg">
            {networkState.isOnline ? (
              <Wifi className="h-4 w-4 text-indigo-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {networkState.isOnline ? 'Online' : 'Offline'}
          </h3>
        </div>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          {showDetails ? 'Hide' : 'Details'}
        </button>
      </div>

      {/* Connection Status */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`flex items-center gap-2 ${getConnectionQualityColor()}`}>
          {networkState.isOnline ? (
            <>
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Connected</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Disconnected</span>
            </>
          )}
        </div>
        
        {networkState.connectionType && networkState.connectionType !== 'unknown' && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {networkState.connectionType.toUpperCase()}
          </span>
        )}
      </div>

      {/* Offline Duration */}
      {!networkState.isOnline && networkState.offlineDuration && (
        <div className="flex items-center gap-2 mb-3 text-orange-600">
          <Clock className="h-4 w-4" />
          <span className="text-sm">
            Offline for {formatOfflineDuration(networkState.offlineDuration)}
          </span>
        </div>
      )}

      {/* Sync Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Sync Status</span>
        </div>
        
        <div className={`flex items-center gap-2 ${getSyncStatusColor()}`}>
          {syncProgress.isRunning ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Syncing...</span>
            </>
          ) : syncProgress.failedItems > 0 ? (
            <>
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{syncProgress.failedItems} failed</span>
            </>
          ) : syncProgress.totalItems > 0 ? (
            <>
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Synced</span>
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Up to date</span>
            </>
          )}
        </div>
      </div>

      {/* Last Sync Time */}
      {lastSyncTime && (
        <div className="flex items-center gap-2 mb-3 text-gray-600 dark:text-gray-400">
          <Clock className="h-4 w-4" />
          <span className="text-sm">
            Last sync: {formatLastSyncTime(lastSyncTime)}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {networkState.isOnline && (syncProgress.totalItems > 0 || syncProgress.failedItems > 0) && (
          <button
            onClick={handleForceSync}
            disabled={syncProgress.isRunning}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <Upload className="h-4 w-4" />
            {syncProgress.isRunning ? 'Syncing...' : 'Sync Now'}
          </button>
        )}
        
        {syncProgress.failedItems > 0 && (
          <button
            onClick={handleRetryFailed}
            disabled={syncProgress.isRunning}
            className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Failed
          </button>
        )}
      </div>

      {/* Detailed Information */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Pending Items:</span>
              <span className="font-medium">{syncProgress.totalItems - syncProgress.syncedItems - syncProgress.failedItems}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Synced Items:</span>
              <span className="font-medium text-green-600">{syncProgress.syncedItems}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Failed Items:</span>
              <span className="font-medium text-red-600">{syncProgress.failedItems}</span>
            </div>
            
            {networkState.isOnline && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Connection Quality:</span>
                <span className="font-medium capitalize">{networkDetectionService.getConnectionQuality()}</span>
              </div>
            )}
          </div>

          {/* Sync Errors */}
          {syncProgress.errors.length > 0 && (
            <div className="mt-3">
              <div className="text-sm font-medium text-red-600 mb-2">Recent Errors:</div>
              <div className="space-y-1">
                {syncProgress.errors.slice(-3).map((error, index) => (
                  <div key={index} className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
