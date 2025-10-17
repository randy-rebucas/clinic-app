'use client';

import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Settings, 
  Zap, 
  Save, 
  X,
  AlertTriangle,
  Info,
  RotateCcw
} from 'lucide-react';

interface ScreenCaptureSettingsProps {
  employeeId?: string; // If provided, settings are for specific employee
  isOpen: boolean;
  onClose: () => void;
}

interface ScreenCaptureSettings {
  enabled: boolean;
  intervalMinutes: number;
  quality: number;
  maxCapturesPerDay: number;
  requireUserConsent: boolean;
  useRandomTiming: boolean;
  randomVariationPercent: number;
  burstModeEnabled: boolean;
  burstIntervalSeconds: number;
  burstDurationMinutes: number;
  burstFrequency: 'low' | 'medium' | 'high' | 'custom';
  customBurstIntervalMinutes: number;
}

export default function ScreenCaptureSettings({ employeeId, isOpen, onClose }: ScreenCaptureSettingsProps) {
  const [settings, setSettings] = useState<ScreenCaptureSettings>({
    enabled: true,
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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'random' | 'burst'>('basic');

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen, employeeId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // In a real implementation, you would load settings from the database
      // For now, we'll use default settings
      console.log('Loading screen capture settings...');
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      // In a real implementation, you would save settings to the database
      console.log('Saving screen capture settings:', settings);
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof ScreenCaptureSettings, value: boolean | number | string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getBurstFrequencyDescription = (frequency: string) => {
    switch (frequency) {
      case 'low':
        return 'Burst mode occurs every hour';
      case 'medium':
        return 'Burst mode occurs every 30 minutes';
      case 'high':
        return 'Burst mode occurs every 15 minutes';
      case 'custom':
        return `Burst mode occurs every ${settings.customBurstIntervalMinutes} minutes`;
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Screen Capture Settings
            </h2>
            {employeeId && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                (Employee-specific)
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('basic')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'basic'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Settings className="h-4 w-4" />
            Basic Settings
          </button>
          <button
            onClick={() => setActiveTab('random')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'random'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <RotateCcw className="h-4 w-4" />
            Random Timing
          </button>
          <button
            onClick={() => setActiveTab('burst')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'burst'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Zap className="h-4 w-4" />
            Burst Mode
          </button>
        </div>

        {/* Basic Settings */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Configuration</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enable Screen Capture
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Allow screenshots to be taken during work sessions
                  </p>
                </div>
                <button
                  onClick={() => updateSetting('enabled', !settings.enabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Capture Interval (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.intervalMinutes}
                  onChange={(e) => updateSetting('intervalMinutes', parseInt(e.target.value))}
                  className="input-field"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  How often screenshots are taken (1-60 minutes)
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Image Quality
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={settings.quality}
                  onChange={(e) => updateSetting('quality', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Low (0.1)</span>
                  <span>{Math.round(settings.quality * 100)}%</span>
                  <span>High (1.0)</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Daily Capture Limit
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.maxCapturesPerDay}
                  onChange={(e) => updateSetting('maxCapturesPerDay', parseInt(e.target.value))}
                  className="input-field"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Maximum screenshots per day per employee
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Require User Consent
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Ask for permission before taking screenshots
                  </p>
                </div>
                <button
                  onClick={() => updateSetting('requireUserConsent', !settings.requireUserConsent)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.requireUserConsent ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.requireUserConsent ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Random Timing Settings */}
        {activeTab === 'random' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Random Timing</h3>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Random Timing Benefits</h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Random timing makes screenshot capture less predictable, reducing the chance that employees 
                      can time their activities around capture intervals.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enable Random Timing
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Add random variation to capture intervals
                  </p>
                </div>
                <button
                  onClick={() => updateSetting('useRandomTiming', !settings.useRandomTiming)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.useRandomTiming ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.useRandomTiming ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {settings.useRandomTiming && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Random Variation (%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={settings.randomVariationPercent}
                    onChange={(e) => updateSetting('randomVariationPercent', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>No variation (0%)</span>
                    <span>{settings.randomVariationPercent}%</span>
                    <span>High variation (50%)</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    With {settings.randomVariationPercent}% variation, a 15-minute interval could range from 
                    {Math.round(15 * (1 - settings.randomVariationPercent / 100))} to {Math.round(15 * (1 + settings.randomVariationPercent / 100))} minutes
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Burst Mode Settings */}
        {activeTab === 'burst' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Burst Mode</h3>
              
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Burst Mode Warning</h4>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                      Burst mode captures screenshots very frequently (as often as every 30 seconds). 
                      Use with caution as it may impact system performance and storage.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enable Burst Mode
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Allow frequent screenshot capture during specific periods
                  </p>
                </div>
                <button
                  onClick={() => updateSetting('burstModeEnabled', !settings.burstModeEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.burstModeEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.burstModeEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {settings.burstModeEnabled && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Burst Interval (seconds)
                    </label>
                    <input
                      type="number"
                      min="30"
                      max="300"
                      step="30"
                      value={settings.burstIntervalSeconds}
                      onChange={(e) => updateSetting('burstIntervalSeconds', parseInt(e.target.value))}
                      className="input-field"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      How often screenshots are taken during burst mode (minimum 30 seconds)
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Burst Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={settings.burstDurationMinutes}
                      onChange={(e) => updateSetting('burstDurationMinutes', parseInt(e.target.value))}
                      className="input-field"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      How long burst mode lasts each time it&apos;s triggered
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Burst Frequency
                    </label>
                    <select
                      value={settings.burstFrequency}
                      onChange={(e) => updateSetting('burstFrequency', e.target.value)}
                      className="input-field"
                    >
                      <option value="low">Low - Every hour</option>
                      <option value="medium">Medium - Every 30 minutes</option>
                      <option value="high">High - Every 15 minutes</option>
                      <option value="custom">Custom</option>
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {getBurstFrequencyDescription(settings.burstFrequency)}
                    </p>
                  </div>

                  {settings.burstFrequency === 'custom' && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Custom Burst Interval (minutes)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="120"
                        value={settings.customBurstIntervalMinutes}
                        onChange={(e) => updateSetting('customBurstIntervalMinutes', parseInt(e.target.value))}
                        className="input-field"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
