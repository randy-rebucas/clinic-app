/**
 * Website Tracking Service
 * Monitors visited websites and tracks time spent on each
 */

import { IWebsiteActivity } from './models';

export interface WebsiteActivity {
  id: string;
  employeeId: string;
  workSessionId: string;
  domain: string;
  url: string;
  pageTitle: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  isActive: boolean;
  category?: 'work' | 'social' | 'news' | 'entertainment' | 'shopping' | 'education' | 'other';
  productivity?: 'productive' | 'neutral' | 'distracting';
  createdAt: Date;
  updatedAt: Date;
}

export interface WebsiteTrackingSettings {
  id: string;
  employeeId: string;
  enabled: boolean;
  trackWebsites: boolean;
  trackPageTitles: boolean;
  trackFullUrls: boolean;
  samplingInterval: number; // seconds between samples
  maxIdleTime: number; // seconds before considering inactive
  categoryRules: {
    [key: string]: string; // domain -> category
  };
  productivityRules: {
    [key: string]: string; // domain -> productivity level
  };
  privacyMode: boolean; // if true, only track categories, not specific URLs
  blocklist: string[]; // domains to not track
  allowlist: string[]; // domains to always track (if empty, track all except blocklist)
  createdAt: Date;
  updatedAt: Date;
}

class WebsiteTrackingService {
  private static instance: WebsiteTrackingService;
  private isTracking = false;
  private currentActivity: WebsiteActivity | null = null;
  private trackingInterval: NodeJS.Timeout | null = null;
  private settings: WebsiteTrackingSettings | null = null;
  private employeeId: string | null = null;
  private workSessionId: string | null = null;
  private lastUrl: string | null = null;
  private lastTitle: string | null = null;

  private constructor() {
    // Set up browser event listeners if in browser environment
    if (typeof window !== 'undefined') {
      this.setupBrowserListeners();
    }
  }

  static getInstance(): WebsiteTrackingService {
    if (!WebsiteTrackingService.instance) {
      WebsiteTrackingService.instance = new WebsiteTrackingService();
    }
    return WebsiteTrackingService.instance;
  }

  /**
   * Initialize the tracking service
   */
  async initialize(employeeId: string, settings?: Partial<WebsiteTrackingSettings>): Promise<void> {
    this.employeeId = employeeId;
    
    if (settings) {
      this.settings = settings as WebsiteTrackingSettings;
    } else {
      // Load settings from database or use defaults
      this.settings = await this.getDefaultSettings(employeeId);
    }

    console.log('Website tracking service initialized');
  }

  /**
   * Start tracking websites
   */
  async startTracking(workSessionId: string): Promise<void> {
    if (!this.employeeId || !this.settings?.enabled) {
      console.log('Website tracking not enabled or not initialized');
      return;
    }

    this.workSessionId = workSessionId;
    this.isTracking = true;

    // Start periodic tracking
    this.trackingInterval = setInterval(() => {
      this.trackCurrentWebsite();
    }, (this.settings.samplingInterval || 5) * 1000);

    // Initial tracking
    this.trackCurrentWebsite();

    console.log('Website tracking started');
  }

  /**
   * Stop tracking websites
   */
  stopTracking(): void {
    this.isTracking = false;
    
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }

    // End current activity if any
    if (this.currentActivity) {
      this.endCurrentActivity();
    }

    console.log('Website tracking stopped');
  }

  /**
   * Set up browser event listeners
   */
  private setupBrowserListeners(): void {
    if (typeof window === 'undefined') {
      return;
    }

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden, pause tracking
        this.pauseTracking();
      } else {
        // Page is visible, resume tracking
        this.resumeTracking();
      }
    });

    // Listen for page unload
    window.addEventListener('beforeunload', () => {
      this.endCurrentActivity();
    });

    // Listen for URL changes (for SPAs)
    let currentUrl = window.location.href;
    setInterval(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        this.handleUrlChange();
      }
    }, 1000);
  }

  /**
   * Track the current website
   */
  private async trackCurrentWebsite(): Promise<void> {
    if (!this.isTracking || !this.employeeId || !this.workSessionId || !this.settings) {
      return;
    }

    try {
      const websiteInfo = this.getCurrentWebsiteInfo();
      
      if (!websiteInfo) {
        return;
      }

      // Check if we should track this website
      if (!this.shouldTrackWebsite(websiteInfo.domain)) {
        if (this.currentActivity) {
          await this.endCurrentActivity();
        }
        return;
      }

      // Check if we're still on the same page
      if (this.currentActivity && 
          this.currentActivity.url === websiteInfo.url &&
          this.currentActivity.pageTitle === websiteInfo.pageTitle) {
        return; // Same page, no need to update
      }

      // End current activity
      if (this.currentActivity) {
        await this.endCurrentActivity();
      }

      // Start new activity
      await this.startNewActivity(websiteInfo);

    } catch (error) {
      console.error('Error tracking website:', error);
    }
  }

  /**
   * Get current website information
   */
  private getCurrentWebsiteInfo(): {
    domain: string;
    url: string;
    pageTitle: string;
  } | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const url = new URL(window.location.href);
      const domain = url.hostname;
      const pageTitle = document.title || 'Untitled Page';

      return {
        domain,
        url: this.settings?.trackFullUrls ? window.location.href : `${url.protocol}//${domain}`,
        pageTitle: this.settings?.trackPageTitles ? pageTitle : ''
      };
    } catch (error) {
      console.error('Error getting website info:', error);
      return null;
    }
  }

  /**
   * Check if a website should be tracked
   */
  private shouldTrackWebsite(domain: string): boolean {
    if (!this.settings) {
      return false;
    }

    // Check blocklist
    if (this.settings.blocklist.includes(domain)) {
      return false;
    }

    // Check allowlist (if not empty, only track allowed domains)
    if (this.settings.allowlist.length > 0) {
      return this.settings.allowlist.includes(domain);
    }

    return true;
  }

  /**
   * Start tracking a new website activity
   */
  private async startNewActivity(websiteInfo: {
    domain: string;
    url: string;
    pageTitle: string;
  }): Promise<void> {
    if (!this.employeeId || !this.workSessionId || !this.settings) {
      return;
    }

    const category = this.categorizeWebsite(websiteInfo.domain);
    const productivity = this.assessProductivity(websiteInfo.domain);
    
    this.currentActivity = {
      id: `website-activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      employeeId: this.employeeId,
      workSessionId: this.workSessionId,
      domain: this.settings.privacyMode ? this.getCategoryDisplayName(category) : websiteInfo.domain,
      url: this.settings.privacyMode ? `${websiteInfo.url.split('://')[0]}://[hidden]` : websiteInfo.url,
      pageTitle: this.settings.privacyMode ? this.getCategoryDisplayName(category) : websiteInfo.pageTitle,
      startTime: new Date(),
      isActive: true,
      category: category as 'work' | 'entertainment' | 'social' | 'news' | 'shopping' | 'education' | 'other',
      productivity: productivity as 'productive' | 'neutral' | 'distracting',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.lastUrl = websiteInfo.url;
    this.lastTitle = websiteInfo.pageTitle;

    // Store in database
    await this.storeActivity(this.currentActivity);
  }

  /**
   * End the current activity
   */
  private async endCurrentActivity(): Promise<void> {
    if (!this.currentActivity) {
      return;
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - this.currentActivity.startTime.getTime()) / 1000);

    this.currentActivity.endTime = endTime;
    this.currentActivity.duration = duration;
    this.currentActivity.isActive = false;
    this.currentActivity.updatedAt = endTime;

    // Update in database
    await this.updateActivity(this.currentActivity);

    this.currentActivity = null;
  }

  /**
   * Handle URL change (for SPAs)
   */
  private handleUrlChange(): void {
    if (this.isTracking) {
      this.trackCurrentWebsite();
    }
  }

  /**
   * Pause tracking (when page is hidden)
   */
  private pauseTracking(): void {
    // Could implement pause logic here
    console.log('Website tracking paused (page hidden)');
  }

  /**
   * Resume tracking (when page becomes visible)
   */
  private resumeTracking(): void {
    // Could implement resume logic here
    console.log('Website tracking resumed (page visible)');
  }

  /**
   * Categorize a website based on domain
   */
  private categorizeWebsite(domain: string): string {
    if (!this.settings?.categoryRules) {
      return 'other';
    }

    const lowerDomain = domain.toLowerCase();

    // Check category rules
    for (const [pattern, category] of Object.entries(this.settings.categoryRules)) {
      if (lowerDomain.includes(pattern.toLowerCase())) {
        return category;
      }
    }

    // Default categorization based on common patterns
    if (lowerDomain.includes('github.com') || lowerDomain.includes('stackoverflow.com') || lowerDomain.includes('dev.to')) {
      return 'work';
    }
    if (lowerDomain.includes('facebook.com') || lowerDomain.includes('twitter.com') || lowerDomain.includes('instagram.com') || lowerDomain.includes('linkedin.com')) {
      return 'social';
    }
    if (lowerDomain.includes('news.') || lowerDomain.includes('cnn.com') || lowerDomain.includes('bbc.com') || lowerDomain.includes('reuters.com')) {
      return 'news';
    }
    if (lowerDomain.includes('youtube.com') || lowerDomain.includes('netflix.com') || lowerDomain.includes('twitch.tv') || lowerDomain.includes('reddit.com')) {
      return 'entertainment';
    }
    if (lowerDomain.includes('amazon.com') || lowerDomain.includes('ebay.com') || lowerDomain.includes('shopify.com')) {
      return 'shopping';
    }
    if (lowerDomain.includes('coursera.org') || lowerDomain.includes('udemy.com') || lowerDomain.includes('khanacademy.org')) {
      return 'education';
    }

    return 'other';
  }

  /**
   * Assess productivity level of a website
   */
  private assessProductivity(domain: string): string {
    if (!this.settings?.productivityRules) {
      return 'neutral';
    }

    const lowerDomain = domain.toLowerCase();

    // Check productivity rules
    for (const [pattern, productivity] of Object.entries(this.settings.productivityRules)) {
      if (lowerDomain.includes(pattern.toLowerCase())) {
        return productivity;
      }
    }

    // Default productivity assessment
    const productiveDomains = ['github.com', 'stackoverflow.com', 'dev.to', 'docs.', 'api.', 'admin.'];
    const distractingDomains = ['facebook.com', 'twitter.com', 'instagram.com', 'youtube.com', 'reddit.com', 'netflix.com'];

    if (productiveDomains.some(d => lowerDomain.includes(d))) {
      return 'productive';
    }
    if (distractingDomains.some(d => lowerDomain.includes(d))) {
      return 'distracting';
    }

    return 'neutral';
  }

  /**
   * Get display name for category
   */
  private getCategoryDisplayName(category: string): string {
    const categoryNames: { [key: string]: string } = {
      'work': 'Work Website',
      'social': 'Social Media',
      'news': 'News Site',
      'entertainment': 'Entertainment',
      'shopping': 'Shopping Site',
      'education': 'Educational Site',
      'other': 'Other Website'
    };
    return categoryNames[category] || 'Unknown Website';
  }

  /**
   * Store activity in database
   */
  private async storeActivity(activity: WebsiteActivity): Promise<void> {
    try {
      const { createWebsiteActivity } = await import('./database');
      await createWebsiteActivity(activity as unknown as Omit<IWebsiteActivity, '_id' | 'createdAt' | 'updatedAt'>);
    } catch (error) {
      console.error('Error storing website activity:', error);
    }
  }

  /**
   * Update activity in database
   */
  private async updateActivity(activity: WebsiteActivity): Promise<void> {
    try {
      const { updateWebsiteActivity } = await import('./database');
      await updateWebsiteActivity(activity.id, activity as unknown as Partial<IWebsiteActivity>);
    } catch (error) {
      console.error('Error updating website activity:', error);
    }
  }

  /**
   * Get default settings for an employee
   */
  private async getDefaultSettings(employeeId: string): Promise<WebsiteTrackingSettings> {
    return {
      id: `website-tracking-settings-${employeeId}`,
      employeeId,
      enabled: true,
      trackWebsites: true,
      trackPageTitles: true,
      trackFullUrls: false,
      samplingInterval: 5,
      maxIdleTime: 30,
      categoryRules: {
        'github.com': 'work',
        'stackoverflow.com': 'work',
        'dev.to': 'work',
        'docs.': 'work',
        'api.': 'work',
        'admin.': 'work',
        'facebook.com': 'social',
        'twitter.com': 'social',
        'instagram.com': 'social',
        'linkedin.com': 'social',
        'youtube.com': 'entertainment',
        'netflix.com': 'entertainment',
        'twitch.tv': 'entertainment',
        'reddit.com': 'entertainment',
        'amazon.com': 'shopping',
        'ebay.com': 'shopping',
        'shopify.com': 'shopping',
        'coursera.org': 'education',
        'udemy.com': 'education',
        'khanacademy.org': 'education'
      },
      productivityRules: {
        'github.com': 'productive',
        'stackoverflow.com': 'productive',
        'dev.to': 'productive',
        'docs.': 'productive',
        'api.': 'productive',
        'admin.': 'productive',
        'facebook.com': 'distracting',
        'twitter.com': 'distracting',
        'instagram.com': 'distracting',
        'youtube.com': 'distracting',
        'reddit.com': 'distracting',
        'netflix.com': 'distracting'
      },
      privacyMode: false,
      blocklist: [],
      allowlist: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Get current tracking status
   */
  getTrackingStatus(): {
    isTracking: boolean;
    currentActivity: WebsiteActivity | null;
    settings: WebsiteTrackingSettings | null;
  } {
    return {
      isTracking: this.isTracking,
      currentActivity: this.currentActivity,
      settings: this.settings
    };
  }

  /**
   * Update tracking settings
   */
  async updateSettings(updates: Partial<WebsiteTrackingSettings>): Promise<void> {
    if (!this.settings) {
      return;
    }

    this.settings = {
      ...this.settings,
      ...updates,
      updatedAt: new Date()
    };

    // Save to database
    // await updateWebsiteTrackingSettings(this.settings.id, updates);
  }
}

export const websiteTrackingService = WebsiteTrackingService.getInstance();
