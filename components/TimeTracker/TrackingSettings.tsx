'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Settings, 
  Monitor, 
  Globe, 
  Save,
  X,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { applicationTrackingService } from '@/lib/applicationTracking';
import { websiteTrackingService } from '@/lib/websiteTracking';
import { 
  getApplicationTrackingSettings, 
  updateApplicationTrackingSettings,
  getWebsiteTrackingSettings,
  updateWebsiteTrackingSettings
} from '@/lib/database';

interface TrackingSettingsProps {
  employeeId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TrackingSettings({ employeeId, isOpen, onClose }: TrackingSettingsProps) {
  const [appSettings, setAppSettings] = useState<{
    id: string;
    employeeId: string;
    enabled: boolean;
    trackApplications: boolean;
    trackWebsites: boolean;
    trackWindowTitles: boolean;
    samplingInterval: number;
    maxIdleTime: number;
    categoryRules: { [key: string]: string };
    privacyMode: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null>(null);
  const [websiteSettings, setWebsiteSettings] = useState<{
    id: string;
    employeeId: string;
    enabled: boolean;
    trackWebsites: boolean;
    trackPageTitles: boolean;
    trackFullUrls: boolean;
    samplingInterval: number;
    maxIdleTime: number;
    categoryRules: { [key: string]: string };
    productivityRules: { [key: string]: string };
    privacyMode: boolean;
    blocklist: string[];
    allowlist: string[];
    createdAt: Date;
    updatedAt: Date;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'applications' | 'websites'>('applications');

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const [app, website] = await Promise.all([
        getApplicationTrackingSettings(employeeId),
        getWebsiteTrackingSettings(employeeId)
      ]);
      setAppSettings(app ? {
        id: app._id.toString(),
        employeeId: app.employeeId.toString(),
        enabled: app.enabled,
        trackApplications: app.trackApplications,
        trackWebsites: app.trackWebsites,
        trackWindowTitles: app.trackWindowTitles,
        samplingInterval: app.samplingInterval,
        maxIdleTime: app.maxIdleTime,
        categoryRules: app.categoryRules,
        privacyMode: app.privacyMode,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt
      } : null);
      setWebsiteSettings(website ? {
        id: website._id.toString(),
        employeeId: website.employeeId.toString(),
        enabled: website.enabled,
        trackWebsites: website.trackWebsites,
        trackPageTitles: website.trackPageTitles,
        trackFullUrls: website.trackFullUrls,
        samplingInterval: website.samplingInterval,
        maxIdleTime: website.maxIdleTime,
        categoryRules: website.categoryRules,
        productivityRules: website.productivityRules,
        privacyMode: website.privacyMode,
        blocklist: website.blocklist,
        allowlist: website.allowlist,
        createdAt: website.createdAt,
        updatedAt: website.updatedAt
      } : null);
    } catch (error) {
      console.error('Error loading tracking settings:', error);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen, employeeId, loadSettings]);

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      if (appSettings) {
        await updateApplicationTrackingSettings(appSettings.id, {
          enabled: appSettings.enabled,
          trackApplications: appSettings.trackApplications,
          trackWebsites: appSettings.trackWebsites,
          trackWindowTitles: appSettings.trackWindowTitles,
          samplingInterval: appSettings.samplingInterval,
          maxIdleTime: appSettings.maxIdleTime,
          categoryRules: appSettings.categoryRules,
          privacyMode: appSettings.privacyMode
        });
        await applicationTrackingService.updateSettings(appSettings);
      }
      
      if (websiteSettings) {
        await updateWebsiteTrackingSettings(websiteSettings.id, {
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
        await websiteTrackingService.updateSettings(websiteSettings);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateAppSetting = (key: string, value: boolean | number) => {
    setAppSettings((prev) => prev ? ({
      ...prev,
      [key]: value
    }) : null);
  };

  const updateWebsiteSetting = (key: string, value: boolean | number | string[]) => {
    setWebsiteSettings((prev) => prev ? ({
      ...prev,
      [key]: value
    }) : null);
  };

  const removeCategoryRule = (type: 'app' | 'website', pattern: string) => {
    if (type === 'app') {
      setAppSettings((prev) => {
        if (!prev) return null;
        const newRules = { ...prev.categoryRules };
        delete newRules[pattern];
        return {
          ...prev,
          categoryRules: newRules
        };
      });
    } else {
      setWebsiteSettings((prev) => {
        if (!prev) return null;
        const newRules = { ...prev.categoryRules };
        delete newRules[pattern];
        return {
          ...prev,
          categoryRules: newRules
        };
      });
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
            <Settings className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tracking Settings</h2>
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
            onClick={() => setActiveTab('applications')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'applications'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Monitor className="h-4 w-4" />
            Applications
          </button>
          <button
            onClick={() => setActiveTab('websites')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'websites'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Globe className="h-4 w-4" />
            Websites
          </button>
        </div>

        {/* Application Settings */}
        {activeTab === 'applications' && appSettings && (
          <div className="space-y-6">
            {/* Basic Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Settings</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enable Application Tracking
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Track time spent on different applications
                  </p>
                </div>
                <button
                  onClick={() => updateAppSetting('enabled', !appSettings.enabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    appSettings.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      appSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
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
                <button
                  onClick={() => updateAppSetting('trackWindowTitles', !appSettings.trackWindowTitles)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    appSettings.trackWindowTitles ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      appSettings.trackWindowTitles ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
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
                <button
                  onClick={() => updateAppSetting('privacyMode', !appSettings.privacyMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    appSettings.privacyMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      appSettings.privacyMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Sampling Interval (seconds)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={appSettings.samplingInterval}
                  onChange={(e) => updateAppSetting('samplingInterval', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Category Rules */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Category Rules</h3>
              <div className="space-y-2">
                {Object.entries(appSettings.categoryRules || {}).map(([pattern, category]) => (
                  <div key={pattern} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                      <strong>{pattern}</strong> → {category}
                    </span>
                    <button
                      onClick={() => removeCategoryRule('app', pattern)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Website Settings */}
        {activeTab === 'websites' && websiteSettings && (
          <div className="space-y-6">
            {/* Basic Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Settings</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enable Website Tracking
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Track time spent on different websites
                  </p>
                </div>
                <button
                  onClick={() => updateWebsiteSetting('enabled', !websiteSettings.enabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    websiteSettings.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      websiteSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
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
                <button
                  onClick={() => updateWebsiteSetting('trackPageTitles', !websiteSettings.trackPageTitles)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    websiteSettings.trackPageTitles ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      websiteSettings.trackPageTitles ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
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
                <button
                  onClick={() => updateWebsiteSetting('trackFullUrls', !websiteSettings.trackFullUrls)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    websiteSettings.trackFullUrls ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      websiteSettings.trackFullUrls ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
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
                <button
                  onClick={() => updateWebsiteSetting('privacyMode', !websiteSettings.privacyMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    websiteSettings.privacyMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      websiteSettings.privacyMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Sampling Interval (seconds)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={websiteSettings.samplingInterval}
                  onChange={(e) => updateWebsiteSetting('samplingInterval', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Blocklist */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Blocklist</h3>
              <div className="space-y-2">
                {websiteSettings.blocklist?.map((domain: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{domain}</span>
                    <button
                      onClick={() => {
                        const newBlocklist = websiteSettings.blocklist.filter((_, i: number) => i !== index);
                        updateWebsiteSetting('blocklist', newBlocklist);
                      }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Privacy Notice</h4>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Application and website tracking data is stored locally and can be synced to your organization&apos;s dashboard. 
                Enable privacy mode to only track categories instead of specific applications or URLs.
              </p>
            </div>
          </div>
        </div>

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
