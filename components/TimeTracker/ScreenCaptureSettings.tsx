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
  });
  const [originalSettings, setOriginalSettings] = useState<ScreenCaptureSettings>({
    enabled: false,
    intervalMinutes: 15,
    quality: 0.8,
    maxCapturesPerDay: 32,
    requireUserConsent: true,
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
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Camera className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Screen Capture Settings</h3>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
        >
          <Settings className="h-4 w-4" />
          <span>{showAdvanced ? 'Hide' : 'Show'} Advanced</span>
        </button>
      </div>

      {/* Permission Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getPermissionIcon()}
            <div>
              <div className="font-medium text-gray-900">{getPermissionText()}</div>
              <div className="text-sm text-gray-500">
                Required for automatic screen capture during work sessions
              </div>
            </div>
          </div>
          {permissionStatus !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Requesting...' : 'Request Permission'}
            </button>
          )}
        </div>
      </div>

      {/* Basic Settings */}
      <div className="space-y-4">
        {/* Enable Screen Capture */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900">Enable Screen Capture</div>
            <div className="text-sm text-gray-500">
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
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Capture Interval */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Capture Interval
          </label>
          <select
            value={settings.intervalMinutes}
            onChange={(e) => handleSettingChange('intervalMinutes', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={5}>Every 5 minutes</option>
            <option value={10}>Every 10 minutes</option>
            <option value={15}>Every 15 minutes</option>
            <option value={30}>Every 30 minutes</option>
            <option value={60}>Every hour</option>
          </select>
          <div className="text-sm text-gray-500 mt-1">
            How often to capture screenshots during work sessions
          </div>
        </div>

        {/* Require User Consent */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900">Require User Consent</div>
            <div className="text-sm text-gray-500">
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
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
          <h4 className="font-medium text-gray-900">Advanced Settings</h4>
          
          {/* Image Quality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Quality: {Math.round(settings.quality * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={settings.quality}
              onChange={(e) => handleSettingChange('quality', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-sm text-gray-500 mt-1">
              Higher quality = larger file sizes
            </div>
          </div>

          {/* Daily Capture Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily Capture Limit
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={settings.maxCapturesPerDay}
              onChange={(e) => handleSettingChange('maxCapturesPerDay', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="text-sm text-gray-500 mt-1">
              Maximum number of captures per day to prevent storage overflow
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {hasUnsavedChanges() && (
              <span className="text-sm text-amber-600 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                You have unsaved changes
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-sm text-green-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Settings saved successfully
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-sm text-red-600 flex items-center">
                <XCircle className="h-4 w-4 mr-1" />
                Failed to save settings
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {hasUnsavedChanges() && (
              <button
                onClick={handleResetSettings}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>
            )}
            
            <button
              onClick={handleSaveSettings}
              disabled={!hasUnsavedChanges() || isSaving}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>
                {isSaving ? 'Saving...' : 'Save Settings'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <div className="font-medium text-blue-900">Privacy Notice</div>
            <div className="text-sm text-blue-800 mt-1">
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
