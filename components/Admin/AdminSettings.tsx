'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Settings, 
  Monitor, 
  Globe, 
  Camera, 
  Save, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Shield,
  Activity,
  Timer
} from 'lucide-react';
import { screenCaptureService } from '@/lib/screenCapture';
import type { ScreenCaptureSettings } from '@/lib/screenCapture';
import { idleManagementService } from '@/lib/idleManagement';
// import { applicationTrackingService } from '@/lib/applicationTracking';
// import { websiteTrackingService } from '@/lib/websiteTracking';
import { 
  getApplicationTrackingSettings, 
  updateApplicationTrackingSettings,
  getWebsiteTrackingSettings,
  updateWebsiteTrackingSettings
} from '@/lib/database';

interface AdminSettingsProps {
  employeeId?: string; // Optional for global settings vs employee-specific
}

export default function AdminSettings({ employeeId }: AdminSettingsProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'idle' | 'screen-capture' | 'tracking'>('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    defaultWorkHours: 8,
    breakReminderInterval: 30,
    overtimeThreshold: 40,
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  });

  // Idle Settings
  const [idleSettings, setIdleSettings] = useState({
    enabled: true,
    idleThresholdMinutes: 5,
    pauseTimerOnIdle: true,
    showIdleWarning: true,
    warningTimeMinutes: 1,
    autoResumeOnActivity: true
  });

  // Screen Capture Settings
  const [screenCaptureSettings, setScreenCaptureSettings] = useState<ScreenCaptureSettings>({
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

  // Application Tracking Settings
  const [appTrackingSettings, setAppTrackingSettings] = useState({
    enabled: true,
    trackApplications: true,
    trackWebsites: true,
    trackWindowTitles: true,
    samplingInterval: 5,
    maxIdleTime: 5,
    categoryRules: {} as { [key: string]: string },
    privacyMode: false
  });

  // Website Tracking Settings
  const [websiteTrackingSettings, setWebsiteTrackingSettings] = useState({
    enabled: true,
    trackWebsites: true,
    trackPageTitles: true,
    trackFullUrls: false,
    samplingInterval: 5,
    maxIdleTime: 5,
    categoryRules: {} as { [key: string]: string },
    productivityRules: {} as { [key: string]: string },
    privacyMode: false,
    blocklist: [] as string[],
    allowlist: [] as string[]
  });

  const loadAllSettings = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load screen capture settings
      const screenSettings = screenCaptureService.getSettings();
      setScreenCaptureSettings(screenSettings);

      // Load idle settings (from service)
      const idleSettingsData = idleManagementService.getSettings();
      if (idleSettingsData) {
        setIdleSettings(idleSettingsData);
      } else {
        // Set default idle settings if none exist
        setIdleSettings({
          enabled: true,
          idleThresholdMinutes: 5,
          pauseTimerOnIdle: true,
          showIdleWarning: true,
          warningTimeMinutes: 1,
          autoResumeOnActivity: true
        });
      }

      // Load tracking settings if employeeId is provided
      if (employeeId) {
        const [appSettings, websiteSettings] = await Promise.all([
          getApplicationTrackingSettings(employeeId),
          getWebsiteTrackingSettings(employeeId)
        ]);

        if (appSettings) {
          setAppTrackingSettings({
            enabled: appSettings.enabled,
            trackApplications: appSettings.trackApplications,
            trackWebsites: appSettings.trackWebsites,
            trackWindowTitles: appSettings.trackWindowTitles,
            samplingInterval: appSettings.samplingInterval,
            maxIdleTime: appSettings.maxIdleTime,
            categoryRules: appSettings.categoryRules,
            privacyMode: appSettings.privacyMode
          });
        }

        if (websiteSettings) {
          setWebsiteTrackingSettings({
            enabled: websiteSettings.enabled,
            trackWebsites: websiteSettings.trackWebsites,
            trackPageTitles: websiteSettings.trackPageTitles,
            trackFullUrls: websiteSettings.trackFullUrls,
            samplingInterval: websiteSettings.samplingInterval,
            maxIdleTime: websiteSettings.maxIdleTime,
            categoryRules: websiteSettings.categoryRules,
            productivityRules: websiteSettings.productivityRules,
            privacyMode: websiteSettings.privacyMode,
            blocklist: websiteSettings.blocklist,
            allowlist: websiteSettings.allowlist
          });
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    loadAllSettings();
  }, [loadAllSettings]);

  const handleSaveAllSettings = async () => {
    try {
      setSaving(true);
      setSaveStatus('saving');

      // Save screen capture settings
      screenCaptureService.updateSettings(screenCaptureSettings);

      // Save idle settings
      await idleManagementService.updateSettings(idleSettings);

      // Save tracking settings if employeeId is provided
      if (employeeId) {
        await Promise.all([
          updateApplicationTrackingSettings(employeeId, appTrackingSettings),
          updateWebsiteTrackingSettings(employeeId, websiteTrackingSettings)
        ]);
      }

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = () => {
    loadAllSettings();
    setSaveStatus('idle');
  };

  const updateGeneralSetting = (key: string, value: string | number | boolean) => {
    setGeneralSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateIdleSetting = (key: string, value: string | number | boolean) => {
    setIdleSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateScreenCaptureSetting = (key: keyof ScreenCaptureSettings, value: string | number | boolean) => {
    setScreenCaptureSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateAppTrackingSetting = (key: string, value: string | number | boolean) => {
    setAppTrackingSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateWebsiteTrackingSetting = (key: string, value: string | number | boolean) => {
    setWebsiteTrackingSettings(prev => ({ ...prev, [key]: value }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'idle', label: 'Idle Detection', icon: Timer },
    { id: 'screen-capture', label: 'Screen Capture', icon: Camera },
    { id: 'tracking', label: 'Activity Tracking', icon: Activity }
  ];

  if (loading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure global system settings and tracking preferences
          </p>
        </div>
        
        {/* Save Status */}
        <div className="flex items-center space-x-3">
          {saveStatus === 'saved' && (
            <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              Settings saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-sm text-red-600 dark:text-red-400 flex items-center">
              <XCircle className="h-4 w-4 mr-1" />
              Save failed
            </span>
          )}
          
          <button
            onClick={handleResetSettings}
            className="btn-secondary px-3 py-2 text-sm flex items-center space-x-1"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>
          
          <button
            onClick={handleSaveAllSettings}
            disabled={saving}
            className="btn-primary px-4 py-2 flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'general' | 'idle' | 'screen-capture' | 'tracking')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="card p-6">
        {activeTab === 'general' && (
          <GeneralSettings 
            settings={generalSettings} 
            onUpdate={updateGeneralSetting} 
          />
        )}
        
        {activeTab === 'idle' && (
          <IdleSettings 
            settings={idleSettings} 
            onUpdate={updateIdleSetting} 
          />
        )}
        
        {activeTab === 'screen-capture' && (
          <ScreenCaptureSettings 
            settings={screenCaptureSettings} 
            onUpdate={updateScreenCaptureSetting} 
          />
        )}
        
        {activeTab === 'tracking' && (
          <TrackingSettings 
            appSettings={appTrackingSettings}
            websiteSettings={websiteTrackingSettings}
            onUpdateApp={updateAppTrackingSetting}
            onUpdateWebsite={updateWebsiteTrackingSetting}
            employeeId={employeeId}
          />
        )}
      </div>
    </div>
  );
}

// General Settings Component
function GeneralSettings({ settings, onUpdate }: { settings: Record<string, unknown>, onUpdate: (key: string, value: string | number | boolean) => void }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">General System Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Default Work Hours per Day
          </label>
          <input
            type="number"
            min="1"
            max="24"
            value={settings.defaultWorkHours as number}
            onChange={(e) => onUpdate('defaultWorkHours', parseInt(e.target.value))}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Break Reminder Interval (minutes)
          </label>
          <input
            type="number"
            min="5"
            max="120"
            value={settings.breakReminderInterval as number}
            onChange={(e) => onUpdate('breakReminderInterval', parseInt(e.target.value))}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Overtime Threshold (hours)
          </label>
          <input
            type="number"
            min="1"
            max="80"
            value={settings.overtimeThreshold as number}
            onChange={(e) => onUpdate('overtimeThreshold', parseInt(e.target.value))}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Timezone
          </label>
          <select
            value={settings.timezone as string}
            onChange={(e) => onUpdate('timezone', e.target.value)}
            className="input-field"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date Format
          </label>
          <select
            value={settings.dateFormat as string}
            onChange={(e) => onUpdate('dateFormat', e.target.value)}
            className="input-field"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Time Format
          </label>
          <select
            value={settings.timeFormat as string}
            onChange={(e) => onUpdate('timeFormat', e.target.value)}
            className="input-field"
          >
            <option value="12h">12 Hour (AM/PM)</option>
            <option value="24h">24 Hour</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// Idle Settings Component
function IdleSettings({ settings, onUpdate }: { settings: Record<string, unknown>, onUpdate: (key: string, value: string | number | boolean) => void }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Idle Detection Settings</h3>
      
      <div className="space-y-4">
        {/* Enable Idle Detection */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable Idle Detection
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Automatically detect when users are inactive
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(settings.enabled)}
              onChange={(e) => onUpdate('enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Idle Threshold */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Idle Threshold (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={settings.idleThresholdMinutes as number}
            onChange={(e) => onUpdate('idleThresholdMinutes', parseInt(e.target.value))}
            className="input-field"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Time of inactivity before user is considered idle
          </p>
        </div>

        {/* Pause Timer on Idle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Pause Timer When Idle
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Automatically pause work timer when user becomes idle
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(settings.pauseTimerOnIdle)}
              onChange={(e) => onUpdate('pauseTimerOnIdle', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Show Idle Warning */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Show Idle Warning
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Display warning before marking user as idle
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(settings.showIdleWarning)}
              onChange={(e) => onUpdate('showIdleWarning', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Warning Time */}
        {Boolean(settings.showIdleWarning) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Warning Time (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={Number(settings.warningTimeMinutes) || 1}
              onChange={(e) => onUpdate('warningTimeMinutes', parseInt(e.target.value))}
              className="input-field"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Time to show warning before marking as idle
            </p>
          </div>
        )}

        {/* Auto Resume on Activity */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Auto Resume on Activity
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Automatically resume timer when user becomes active again
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(settings.autoResumeOnActivity)}
              onChange={(e) => onUpdate('autoResumeOnActivity', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
}

// Screen Capture Settings Component
function ScreenCaptureSettings({ settings, onUpdate }: { settings: ScreenCaptureSettings, onUpdate: (key: keyof ScreenCaptureSettings, value: string | number | boolean) => void }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Screen Capture Settings</h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          <Settings className="h-4 w-4" />
          <span>{showAdvanced ? 'Hide' : 'Show'} Advanced</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Enable Screen Capture */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable Screen Capture
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Automatically capture screenshots during work sessions
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(settings.enabled)}
              onChange={(e) => onUpdate('enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Capture Interval */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Capture Interval
          </label>
          <select
            value={settings.intervalMinutes as number}
            onChange={(e) => onUpdate('intervalMinutes', parseInt(e.target.value))}
            className="input-field"
          >
            <option value={5}>Every 5 minutes</option>
            <option value={10}>Every 10 minutes</option>
            <option value={15}>Every 15 minutes</option>
            <option value={30}>Every 30 minutes</option>
            <option value={60}>Every hour</option>
          </select>
        </div>

        {/* Require User Consent */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Require User Consent
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Ask for permission before starting screen capture
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(settings.requireUserConsent)}
              onChange={(e) => onUpdate('requireUserConsent', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Advanced Settings</h4>
            
            {/* Image Quality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image Quality: {Math.round(settings.quality * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={settings.quality as number}
                onChange={(e) => onUpdate('quality', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Daily Capture Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Daily Capture Limit
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={settings.maxCapturesPerDay as number}
                onChange={(e) => onUpdate('maxCapturesPerDay', parseInt(e.target.value))}
                className="input-field"
              />
            </div>

            {/* Random Timing */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Random Timing
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Add random variation to capture intervals
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(settings.useRandomTiming)}
                  onChange={(e) => onUpdate('useRandomTiming', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Burst Mode */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Burst Mode
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enable frequent captures during specific periods
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(settings.burstModeEnabled)}
                  onChange={(e) => onUpdate('burstModeEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start space-x-2">
          <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Privacy Notice</div>
            <div className="text-xs text-blue-800 dark:text-blue-400 mt-1">
              Screen captures are taken for productivity monitoring purposes only. 
              Images are stored locally and can be deleted at any time.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tracking Settings Component
function TrackingSettings({ 
  appSettings, 
  websiteSettings, 
  onUpdateApp, 
  onUpdateWebsite, 
  employeeId 
}: { 
  appSettings: Record<string, unknown>, 
  websiteSettings: Record<string, unknown>, 
  onUpdateApp: (key: string, value: string | number | boolean) => void, 
  onUpdateWebsite: (key: string, value: string | number | boolean) => void,
  employeeId?: string 
}) {
  const [activeSubTab, setActiveSubTab] = useState<'applications' | 'websites'>('applications');

  if (!employeeId) {
    return (
      <div className="text-center py-8">
        <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Employee-Specific Settings</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Tracking settings are configured per employee. Select an employee to configure their tracking preferences.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Tracking Settings</h3>
      
      {/* Sub-tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => setActiveSubTab('applications')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeSubTab === 'applications'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Monitor className="h-4 w-4" />
          <span>Applications</span>
        </button>
        <button
          onClick={() => setActiveSubTab('websites')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeSubTab === 'websites'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>Websites</span>
        </button>
      </div>

      {/* Application Settings */}
      {activeSubTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Application Tracking
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Track time spent on different applications
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(appSettings.enabled)}
                onChange={(e) => onUpdateApp('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Track Window Titles
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Include window titles in tracking data
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(appSettings.trackWindowTitles)}
                onChange={(e) => onUpdateApp('trackWindowTitles', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Privacy Mode
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Only track categories, not specific application names
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(appSettings.privacyMode)}
                onChange={(e) => onUpdateApp('privacyMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sampling Interval (seconds)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={Number(appSettings.samplingInterval) || 5}
              onChange={(e) => onUpdateApp('samplingInterval', parseInt(e.target.value))}
              className="input-field"
            />
          </div>
        </div>
      )}

      {/* Website Settings */}
      {activeSubTab === 'websites' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Website Tracking
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Track time spent on different websites
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(websiteSettings.enabled)}
                onChange={(e) => onUpdateWebsite('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Track Page Titles
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Include page titles in tracking data
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(websiteSettings.trackPageTitles)}
                onChange={(e) => onUpdateWebsite('trackPageTitles', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Track Full URLs
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Store complete URLs instead of just domains
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(websiteSettings.trackFullUrls)}
                onChange={(e) => onUpdateWebsite('trackFullUrls', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Privacy Mode
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Only track categories, not specific URLs
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(websiteSettings.privacyMode)}
                onChange={(e) => onUpdateWebsite('privacyMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sampling Interval (seconds)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={Number(websiteSettings.samplingInterval) || 5}
              onChange={(e) => onUpdateWebsite('samplingInterval', parseInt(e.target.value))}
              className="input-field"
            />
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Privacy Notice</h4>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              Activity tracking data is stored locally and can be synced to your organization&apos;s dashboard. 
              Enable privacy mode to only track categories instead of specific applications or URLs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
