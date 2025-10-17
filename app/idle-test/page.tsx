'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TimeTrackingService } from '@/lib/timeTracking';
import { ClientTimeTrackingService } from '@/lib/clientTimeTracking';
import { idleManagementService } from '@/lib/idleManagement';
import { inactivityDetectionService } from '@/lib/inactivityDetection';
import IdleStatusComponent from '@/components/TimeTracker/IdleStatus';
import IdleWarningComponent, { useIdleWarning } from '@/components/TimeTracker/IdleWarning';

export default function IdleTestPage() {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentState, setCurrentState] = useState<unknown>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const idleWarning = useIdleWarning();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  useEffect(() => {
    if (!user) return;

    const initializeIdleTest = async () => {
      try {
        addLog('Initializing idle detection test...');
        
        // Initialize idle management
        await idleManagementService.initialize(user.id);
        addLog('Idle management initialized');
        
        // Add state change callback
        const handleStateChange = (state: unknown) => {
          setCurrentState(state);
          const stateObj = state as { isIdle?: boolean; isMonitoring?: boolean };
          addLog(`State changed: isIdle=${stateObj.isIdle}, isMonitoring=${stateObj.isMonitoring}`);
        };
        
        idleManagementService.addStateCallback(handleStateChange);
        
        // Get initial state
        const initialState = idleManagementService.getCurrentState();
        setCurrentState(initialState);
        addLog('Initial state loaded');
        
        setIsInitialized(true);
      } catch (error) {
        addLog(`Initialization failed: ${error}`);
        console.error('Failed to initialize idle test:', error);
      }
    };

    initializeIdleTest();

    return () => {
      if (isInitialized) {
        idleManagementService.destroy();
        addLog('Idle management destroyed');
      }
    };
  }, [user]);

  const handleStartMonitoring = async () => {
    try {
      // Create a test work session
      const result = await ClientTimeTrackingService.clockIn({
        employeeId: user!.id,
        notes: 'Test session for idle detection'
      });
      
      await TimeTrackingService.initializeIdleManagement(user!.id, result.workSessionId);
      addLog(`Started monitoring for work session: ${result.workSessionId}`);
    } catch (error) {
      addLog(`Failed to start monitoring: ${error}`);
    }
  };

  const handleStopMonitoring = async () => {
    try {
      await TimeTrackingService.stopIdleManagement();
      addLog('Stopped monitoring');
    } catch (error) {
      addLog(`Failed to stop monitoring: ${error}`);
    }
  };

  const handleManualIdle = async () => {
    try {
      await TimeTrackingService.manualStartIdle('Manual test idle');
      addLog('Manually started idle session');
    } catch (error) {
      addLog(`Failed to start manual idle: ${error}`);
    }
  };

  const handleEndIdle = async () => {
    try {
      await TimeTrackingService.manualEndIdle();
      addLog('Manually ended idle session');
    } catch (error) {
      addLog(`Failed to end idle: ${error}`);
    }
  };

  const handleResetIdleTime = () => {
    inactivityDetectionService.resetIdleTime();
    addLog('Reset idle time');
  };

  const handleUpdateSettings = async () => {
    try {
      await TimeTrackingService.updateIdleSettings({
        idleThresholdMinutes: 2, // 2 minutes for testing
        warningTimeMinutes: 30, // 30 seconds warning
        showIdleWarning: true,
        enabled: true
      });
      addLog('Updated idle settings for testing');
    } catch (error) {
      addLog(`Failed to update settings: ${error}`);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please log in to test idle detection
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Idle Detection Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test the idle detection system functionality
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Test Controls
              </h2>
              
              <div className="space-y-3">
                <button
                  onClick={handleStartMonitoring}
                  disabled={!isInitialized}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Start Monitoring
                </button>
                
                <button
                  onClick={handleStopMonitoring}
                  disabled={!isInitialized}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Stop Monitoring
                </button>
                
                <button
                  onClick={handleUpdateSettings}
                  disabled={!isInitialized}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Update Settings (2min threshold)
                </button>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleManualIdle}
                    disabled={!isInitialized}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Manual Idle
                  </button>
                  
                  <button
                    onClick={handleEndIdle}
                    disabled={!isInitialized}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    End Idle
                  </button>
                </div>
                
                <button
                  onClick={handleResetIdleTime}
                  disabled={!isInitialized}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Reset Idle Time
                </button>
              </div>
            </div>

            {/* Current State */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Current State
              </h2>
              
              {currentState ? (
                <div className="space-y-2 text-sm">
                  {(() => {
                    const state = currentState as {
                      isIdle?: boolean;
                      isMonitoring?: boolean;
                      totalIdleTime?: number;
                      settings?: {
                        idleThresholdMinutes?: number;
                        warningTimeMinutes?: number;
                        enabled?: boolean;
                      };
                    };
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Is Idle:</span>
                          <span className={`font-medium ${state.isIdle ? 'text-orange-600' : 'text-green-600'}`}>
                            {state.isIdle ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Is Monitoring:</span>
                          <span className={`font-medium ${state.isMonitoring ? 'text-green-600' : 'text-gray-600'}`}>
                            {state.isMonitoring ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Total Idle Time:</span>
                          <span className="font-medium">{state.totalIdleTime || 0} minutes</span>
                        </div>
                        {state.settings && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Threshold:</span>
                              <span className="font-medium">{state.settings.idleThresholdMinutes} minutes</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Warning Time:</span>
                              <span className="font-medium">{state.settings.warningTimeMinutes} minutes</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Enabled:</span>
                              <span className={`font-medium ${state.settings.enabled ? 'text-green-600' : 'text-red-600'}`}>
                                {state.settings.enabled ? 'Yes' : 'No'}
                              </span>
                            </div>
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No state data available</p>
              )}
            </div>
          </div>

          {/* Idle Status Component and Logs */}
          <div className="space-y-6">
            <IdleStatusComponent />
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Activity Log
              </h2>
              
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 h-64 overflow-y-auto">
                {logs.length > 0 ? (
                  <div className="space-y-1">
                    {logs.map((log, index) => (
                      <div key={index} className="text-sm font-mono text-gray-800 dark:text-gray-200">
                        {log}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No activity logged yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Test Instructions
          </h3>
          <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-sm">
            <li>1. Click &quot;Start Monitoring&quot; to begin idle detection</li>
            <li>2. Click &quot;Update Settings&quot; to set a 2-minute threshold for testing</li>
            <li>3. Stop moving your mouse/keyboard for 2+ minutes to trigger idle detection</li>
            <li>4. You should see a warning after 1.5 minutes of inactivity</li>
            <li>5. After 2 minutes, you should be marked as idle</li>
            <li>6. Move your mouse/keyboard to resume from idle state</li>
            <li>7. Use manual controls to test manual idle/resume functionality</li>
          </ul>
        </div>
      </div>

      {/* Idle Warning Modal */}
      <IdleWarningComponent
        isVisible={idleWarning.isVisible}
        onClose={idleWarning.hideWarning}
        onGoIdle={idleWarning.handleGoIdle}
        onKeepActive={idleWarning.handleKeepActive}
        timeRemaining={idleWarning.timeRemaining}
      />
    </div>
  );
}
