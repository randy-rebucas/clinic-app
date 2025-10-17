'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Pause, 
  Play, 
  Settings, 
  AlertTriangle,
  EyeOff,
  Timer,
  Activity
} from 'lucide-react';
import { TimeTrackingService } from '@/lib/timeTracking';
import { IdleManagementState } from '@/lib/idleManagement';
import { TimeFormat } from '@/lib/timeFormat';

export default function IdleStatus() {
  const [idleState, setIdleState] = useState<IdleManagementState>({
    isIdle: false,
    totalIdleTime: 0,
    settings: null,
    isMonitoring: false,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isManualIdle, setIsManualIdle] = useState(false);

  useEffect(() => {
    // Get initial state
    const initialState = TimeTrackingService.getIdleState();
    setIdleState(initialState);

    // Set up state change callback
    const handleStateChange = (state: IdleManagementState) => {
      setIdleState(state);
    };

    // Add callback to idle management service
    import('@/lib/idleManagement').then(({ idleManagementService }) => {
      idleManagementService.addStateCallback(handleStateChange);
    });

    return () => {
      // Remove callback
      import('@/lib/idleManagement').then(({ idleManagementService }) => {
        idleManagementService.removeStateCallback(handleStateChange);
      });
    };
  }, []);

  const handleToggleManualIdle = async () => {
    try {
      if (isManualIdle) {
        await TimeTrackingService.manualEndIdle();
        setIsManualIdle(false);
      } else {
        await TimeTrackingService.manualStartIdle('Manual idle');
        setIsManualIdle(true);
      }
    } catch (error) {
      console.error('Failed to toggle manual idle:', error);
    }
  };

  const formatIdleTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getStatusColor = () => {
    if (idleState.isIdle) {
      return 'text-orange-600 bg-orange-100 border-orange-200';
    }
    if (idleState.isMonitoring) {
      return 'text-green-600 bg-green-100 border-green-200';
    }
    return 'text-gray-600 bg-gray-100 border-gray-200';
  };

  const getStatusText = () => {
    if (idleState.isIdle) {
      return 'Idle';
    }
    if (idleState.isMonitoring) {
      return 'Monitoring';
    }
    return 'Disabled';
  };

  const getStatusIcon = () => {
    if (idleState.isIdle) {
      return <Pause className="h-4 w-4" />;
    }
    if (idleState.isMonitoring) {
      return <Activity className="h-4 w-4" />;
    }
    return <EyeOff className="h-4 w-4" />;
  };

  return (
    <div className="card p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="icon-container icon-container-orange">
            <Timer className="h-4 w-4 text-orange-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Idle Detection</h3>
        </div>
        
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* Status Display */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
        
        {idleState.settings && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {idleState.settings.idleThresholdMinutes}m threshold
          </div>
        )}
      </div>

      {/* Idle Time Display */}
      {idleState.totalIdleTime > 0 && (
        <div className="flex items-center gap-2 mb-3 text-orange-600">
          <Clock className="h-4 w-4" />
          <span className="text-sm">
            Total idle time: {formatIdleTime(idleState.totalIdleTime)}
          </span>
        </div>
      )}

      {/* Current Idle Session */}
      {idleState.currentIdleSession && (
        <div className="mb-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
              Currently Idle
            </span>
          </div>
          <div className="text-xs text-orange-700 dark:text-orange-300">
            Since {TimeFormat.formatDisplayTime(idleState.currentIdleSession.startTime)}
            {idleState.currentIdleSession.reason === 'manual' && ' (Manual)'}
          </div>
        </div>
      )}

      {/* Manual Controls */}
      <div className="flex gap-2">
        <button
          onClick={handleToggleManualIdle}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isManualIdle
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-orange-600 text-white hover:bg-orange-700'
          }`}
        >
          {isManualIdle ? (
            <>
              <Play className="h-4 w-4" />
              Resume
            </>
          ) : (
            <>
              <Pause className="h-4 w-4" />
              Go Idle
            </>
          )}
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && idleState.settings && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <IdleSettingsPanel 
            settings={idleState.settings}
            onSettingsChange={(updates) => {
              TimeTrackingService.updateIdleSettings(updates);
            }}
          />
        </div>
      )}
    </div>
  );
}

interface IdleSettingsPanelProps {
  settings: {
    enabled: boolean;
    idleThresholdMinutes: number;
    pauseTimerOnIdle: boolean;
    showIdleWarning: boolean;
    warningTimeMinutes: number;
    autoResumeOnActivity: boolean;
  };
  onSettingsChange: (updates: Partial<{
    enabled: boolean;
    idleThresholdMinutes: number;
    pauseTimerOnIdle: boolean;
    showIdleWarning: boolean;
    warningTimeMinutes: number;
    autoResumeOnActivity: boolean;
  }>) => void;
}

function IdleSettingsPanel({ settings, onSettingsChange }: IdleSettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSettingChange = (key: string, value: boolean | number) => {
    const updates = { [key]: value };
    setLocalSettings({ ...localSettings, ...updates });
    onSettingsChange(updates);
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Idle Detection Settings</h4>
      
      {/* Enable/Disable */}
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-700 dark:text-gray-300">
          Enable Idle Detection
        </label>
        <button
          onClick={() => handleSettingChange('enabled', !localSettings.enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            localSettings.enabled ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              localSettings.enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Idle Threshold */}
      <div>
        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
          Idle Threshold (minutes)
        </label>
        <input
          type="number"
          min="1"
          max="60"
          value={localSettings.idleThresholdMinutes}
          onChange={(e) => handleSettingChange('idleThresholdMinutes', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>

      {/* Pause Timer on Idle */}
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-700 dark:text-gray-300">
          Pause Timer When Idle
        </label>
        <button
          onClick={() => handleSettingChange('pauseTimerOnIdle', !localSettings.pauseTimerOnIdle)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            localSettings.pauseTimerOnIdle ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              localSettings.pauseTimerOnIdle ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Show Idle Warning */}
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-700 dark:text-gray-300">
          Show Idle Warning
        </label>
        <button
          onClick={() => handleSettingChange('showIdleWarning', !localSettings.showIdleWarning)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            localSettings.showIdleWarning ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              localSettings.showIdleWarning ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Warning Time */}
      {localSettings.showIdleWarning && (
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
            Warning Time (minutes before idle)
          </label>
          <input
            type="number"
            min="1"
            max={localSettings.idleThresholdMinutes - 1}
            value={localSettings.warningTimeMinutes}
            onChange={(e) => handleSettingChange('warningTimeMinutes', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      )}

      {/* Auto Resume */}
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-700 dark:text-gray-300">
          Auto Resume on Activity
        </label>
        <button
          onClick={() => handleSettingChange('autoResumeOnActivity', !localSettings.autoResumeOnActivity)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            localSettings.autoResumeOnActivity ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              localSettings.autoResumeOnActivity ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
