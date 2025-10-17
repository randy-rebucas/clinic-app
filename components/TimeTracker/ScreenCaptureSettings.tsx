'use client';

import React, { useState, useEffect } from 'react';
import { screenCaptureService, ScreenCaptureSettings } from '@/lib/screenCapture';
import { Camera, Settings, Shield, AlertTriangle, CheckCircle, XCircle, Save, RotateCcw } from 'lucide-react';

interface ScreenCaptureSettingsProps {
  onSettingsChange?: (settings: ScreenCaptureSettings) => void;
}

export default function ScreenCaptureSettingsComponent({ onSettingsChange }: ScreenCaptureSettingsProps) {
  const [settings, setSettings] = useState<ScreenCaptureSettings>({
    enabled: false,
    intervalMinutes: 15,
    quality: 0.8,
    maxCapturesPerDay: 32,
    requireUserConsent: true,
    useRandomTiming: true,
    randomVariationPercent: 25,
    burstModeEnabled: false,
    burstIntervalSeconds: 30,
    burstDurationMinutes: 5,
    burstFrequency: 'medium',
    customBurstIntervalMinutes: 30,
  });
  const [originalSettings, setOriginalSettings] = useState<ScreenCaptureSettings>({
    enabled: false,
    intervalMinutes: 15,
    quality: 0.8,
    maxCapturesPerDay: 32,
    requireUserConsent: true,
    useRandomTiming: true,
    randomVariationPercent: 25,
    burstModeEnabled: false,
    burstIntervalSeconds: 30,
    burstDurationMinutes: 5,
    burstFrequency: 'medium',
    customBurstIntervalMinutes: 30,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    // Load current settings
    const currentSettings = screenCaptureService.getSettings();
    console.log('Loading settings on mount:', currentSettings);
    setSettings(currentSettings);
    setOriginalSettings(currentSettings);
    
    // Check permission status
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    try {
      // Check if we can access the API
      if (navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices) {
        setPermissionStatus('granted');
      } else {
        setPermissionStatus('denied');
      }
    } catch {
      setPermissionStatus('denied');
    }
  };

  const handleRequestPermission = async () => {
    setIsLoading(true);
    try {
      const granted = await screenCaptureService.requestPermission();
      setPermissionStatus(granted ? 'granted' : 'denied');
    } catch (err) {
      console.error('Permission request failed:', err);
      setPermissionStatus('denied');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key: keyof ScreenCaptureSettings, value: boolean | number) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setSaveStatus('idle'); // Reset save status when settings change
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      // Save settings to the service
      screenCaptureService.updateSettings(settings);
      setOriginalSettings(settings);
      setSaveStatus('saved');
      onSettingsChange?.(settings);
      
      // Verify settings were saved by reloading them
      const savedSettings = screenCaptureService.getSettings();
      console.log('Settings saved successfully:', savedSettings);
      
      // Clear the saved status after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    setSettings(originalSettings);
    setSaveStatus('idle');
  };

  const hasUnsavedChanges = () => {
    return JSON.stringify(settings) !== JSON.stringify(originalSettings);
  };

  const getPermissionIcon = () => {
    switch (permissionStatus) {
      case 'granted':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'denied':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getPermissionText = () => {
    switch (permissionStatus) {
      case 'granted':
        return 'Screen capture permission granted';
      case 'denied':
        return 'Screen capture permission denied';
      default:
        return 'Screen capture permission unknown';
    }
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Camera className="h-4 w-4 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Screen Capture Settings</h3>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          <Settings className="h-3 w-3" />
          <span>{showAdvanced ? 'Hide' : 'Show'} Advanced</span>
        </button>
      </div>

      {/* Permission Status */}
      <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getPermissionIcon()}
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{getPermissionText()}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Required for automatic screen capture
              </div>
            </div>
          </div>
          {permissionStatus !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              disabled={isLoading}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? 'Requesting...' : 'Request Permission'}
            </button>
          )}
        </div>
      </div>

      {/* Capture Status */}
      {settings.enabled && (
        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div>
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100">Capture Active</div>
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  {settings.useRandomTiming ? 'Random timing' : 'Fixed interval'} • 
                  {settings.burstModeEnabled ? ' Burst mode enabled' : ' Normal mode'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-blue-700 dark:text-blue-300">
                Every {settings.intervalMinutes} min
                {settings.useRandomTiming && ` ±${settings.randomVariationPercent}%`}
              </div>
              {settings.burstModeEnabled && (
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  Burst: {settings.burstIntervalSeconds}s
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Basic Settings */}
      <div className="space-y-3">
        {/* Enable Screen Capture */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">Enable Screen Capture</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Automatically capture screenshots during work sessions
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => handleSettingChange('enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Capture Interval */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Capture Interval
          </label>
          <select
            value={settings.intervalMinutes}
            onChange={(e) => handleSettingChange('intervalMinutes', parseInt(e.target.value))}
            className="input-field text-sm"
          >
            <option value={5}>Every 5 minutes</option>
            <option value={10}>Every 10 minutes</option>
            <option value={15}>Every 15 minutes</option>
            <option value={30}>Every 30 minutes</option>
            <option value={60}>Every hour</option>
          </select>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            How often to capture screenshots during work sessions
          </div>
        </div>

        {/* Require User Consent */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">Require User Consent</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Ask for permission before starting screen capture
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.requireUserConsent}
              onChange={(e) => handleSettingChange('requireUserConsent', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Advanced Settings</h4>
          
          {/* Image Quality */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Image Quality: {Math.round(settings.quality * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={settings.quality}
              onChange={(e) => handleSettingChange('quality', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Higher quality = larger file sizes
            </div>
          </div>

          {/* Daily Capture Limit */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Daily Capture Limit
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={settings.maxCapturesPerDay}
              onChange={(e) => handleSettingChange('maxCapturesPerDay', parseInt(e.target.value))}
              className="input-field text-sm"
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Maximum number of captures per day to prevent storage overflow
            </div>
          </div>

          {/* Random Timing */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Random Timing
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.useRandomTiming}
                  onChange={(e) => handleSettingChange('useRandomTiming', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Add random variation to capture intervals to reduce predictability
            </div>
            {settings.useRandomTiming && (
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Random Variation: {settings.randomVariationPercent}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={settings.randomVariationPercent}
                  onChange={(e) => handleSettingChange('randomVariationPercent', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Burst Mode */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Burst Mode
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.burstModeEnabled}
                  onChange={(e) => handleSettingChange('burstModeEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Enable frequent captures during specific periods (minimum 30 seconds)
            </div>
            {settings.burstModeEnabled && (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Burst Interval: {settings.burstIntervalSeconds} seconds
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="300"
                    step="30"
                    value={settings.burstIntervalSeconds}
                    onChange={(e) => handleSettingChange('burstIntervalSeconds', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Burst Duration: {settings.burstDurationMinutes} minutes
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={settings.burstDurationMinutes}
                    onChange={(e) => handleSettingChange('burstDurationMinutes', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {hasUnsavedChanges() && (
              <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Unsaved changes
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-xs text-green-600 dark:text-green-400 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Settings saved
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-xs text-red-600 dark:text-red-400 flex items-center">
                <XCircle className="h-3 w-3 mr-1" />
                Save failed
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {hasUnsavedChanges() && (
              <button
                onClick={handleResetSettings}
                className="flex items-center space-x-1 px-2 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-500 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            )}
            
            <button
              onClick={handleSaveSettings}
              disabled={!hasUnsavedChanges() || isSaving}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Save className="h-3 w-3" />
              <span>
                {isSaving ? 'Saving...' : 'Save Settings'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start space-x-2">
          <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Privacy Notice</div>
            <div className="text-xs text-blue-800 dark:text-blue-400 mt-1">
              Screen captures are taken for productivity monitoring purposes only. 
              Images are stored locally and can be deleted at any time. 
              No personal data or sensitive information is intentionally captured.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
