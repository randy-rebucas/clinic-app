/**
 * Initial Configuration Setup Script
 * This script sets up the initial application settings and creates the admin user
 * after the database has been cleaned up.
 * 
 * Run with: npx tsx scripts/setup-initial-config.ts
 */

import { createEmployee } from '../lib/database';
import { createAttendanceSettings } from '../lib/database';
import { createIdleSettings } from '../lib/database';
import { createApplicationTrackingSettings } from '../lib/database';
import { createWebsiteTrackingSettings } from '../lib/database';
import { createScreenCaptureSettings } from '../lib/database';
import { hashPassword } from '../lib/auth';
import { Types } from 'mongoose';

interface AdminConfig {
  name: string;
  email: string;
  password: string;
  department: string;
  position: string;
  workStartTime: string;
  workEndTime: string;
}

const adminConfig: AdminConfig = {
  name: 'System Administrator',
  email: 'admin@localpro.com',
  password: 'Admin123!',
  department: 'Administration',
  position: 'System Administrator',
  workStartTime: '08:00',
  workEndTime: '18:00'
};

async function createAdminUser(): Promise<string> {
  try {
    console.log('👤 Creating admin user...');
    
    // Hash the admin password
    const hashedPassword = await hashPassword(adminConfig.password);
    
    // Create admin employee
    const adminId = await createEmployee({
      name: adminConfig.name,
      email: adminConfig.email,
      password: hashedPassword,
      role: 'admin',
      department: adminConfig.department,
      position: adminConfig.position
    });

    console.log(`✅ Admin user created with ID: ${adminId}`);
    return adminId;
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

async function setupAdminSettings(adminId: string): Promise<void> {
  try {
    console.log('⚙️  Setting up admin settings...');
    
    const objectId = new Types.ObjectId(adminId);

    // Create attendance settings
    await createAttendanceSettings({
      employeeId: objectId,
      workStartTime: adminConfig.workStartTime,
      workEndTime: adminConfig.workEndTime,
      breakDuration: 60, // 1 hour break
      lateThreshold: 15, // 15 minutes late threshold
      earlyLeaveThreshold: 15, // 15 minutes early leave threshold
      overtimeThreshold: 0, // No overtime threshold
      workingDays: [1, 2, 3, 4, 5], // Monday to Friday
      timezone: 'UTC',
      requireLocation: false,
      allowRemoteWork: true,
      autoPunchOut: false
    } as any);
    console.log('✅ Attendance settings created');

    // Create idle settings
    await createIdleSettings({
      employeeId: objectId,
      enabled: true,
      idleThresholdMinutes: 10, // 10 minutes idle threshold for admin
      pauseTimerOnIdle: true,
      showIdleWarning: true,
      warningTimeMinutes: 2,
      autoResumeOnActivity: true
    } as any);
    console.log('✅ Idle settings created');

    // Create application tracking settings
    await createApplicationTrackingSettings({
      employeeId: objectId,
      enabled: true,
      trackApplications: true,
      trackWebsites: true,
      trackWindowTitles: true,
      samplingInterval: 30, // 30 seconds between samples
      maxIdleTime: 300, // 5 minutes before considering inactive
      categoryRules: {
        // Development tools
        'Visual Studio Code': 'productive',
        'IntelliJ IDEA': 'productive',
        'Sublime Text': 'productive',
        'Atom': 'productive',
        'WebStorm': 'productive',
        'Eclipse': 'productive',
        'Android Studio': 'productive',
        'Xcode': 'productive',
        
        // Browsers
        'Chrome': 'productive',
        'Firefox': 'productive',
        'Safari': 'productive',
        'Edge': 'productive',
        
        // Terminal/Command Line
        'Terminal': 'productive',
        'Command Prompt': 'productive',
        'PowerShell': 'productive',
        'Git Bash': 'productive',
        'Windows Terminal': 'productive',
        
        // Development utilities
        'Docker Desktop': 'productive',
        'Postman': 'productive',
        'Insomnia': 'productive',
        'Figma': 'productive',
        'Adobe XD': 'productive',
        'Sketch': 'productive',
        
        // Communication tools
        'Slack': 'productive',
        'Microsoft Teams': 'productive',
        'Discord': 'productive',
        'Zoom': 'productive',
        'Skype': 'productive',
        
        // Productivity tools
        'Notion': 'productive',
        'Trello': 'productive',
        'Jira': 'productive',
        'Asana': 'productive',
        'Monday': 'productive',
        
        // Admin tools
        'Admin Panel': 'productive',
        'Database Tools': 'productive',
        'Server Management': 'productive',
        'MongoDB Compass': 'productive',
        'MySQL Workbench': 'productive',
        'pgAdmin': 'productive',
        
        // Entertainment (unproductive)
        'Steam': 'unproductive',
        'Spotify': 'unproductive',
        'YouTube': 'unproductive',
        'Netflix': 'unproductive',
        'Games': 'unproductive',
        'Social Media': 'unproductive'
      },
      privacyMode: false
    } as any);
    console.log('✅ Application tracking settings created');

    // Create website tracking settings
    await createWebsiteTrackingSettings({
      employeeId: objectId,
      enabled: true,
      trackWebsites: true,
      trackPageTitles: true,
      trackFullUrls: false, // Don't track full URLs for privacy
      samplingInterval: 30, // 30 seconds between samples
      maxIdleTime: 300, // 5 minutes before considering inactive
      categoryRules: {
        // Development
        'github.com': 'development',
        'gitlab.com': 'development',
        'bitbucket.org': 'development',
        'stackoverflow.com': 'development',
        'developer.mozilla.org': 'development',
        'docs.microsoft.com': 'development',
        'angular.io': 'development',
        'reactjs.org': 'development',
        'vuejs.org': 'development',
        'nodejs.org': 'development',
        'npmjs.com': 'development',
        'yarnpkg.com': 'development',
        
        // Work tools
        'jira.atlassian.com': 'work',
        'trello.com': 'work',
        'notion.so': 'work',
        'asana.com': 'work',
        'monday': 'work',
        'airtable.com': 'work',
        
        // Communication
        'slack.com': 'communication',
        'teams.microsoft.com': 'communication',
        'discord.com': 'communication',
        'zoom.us': 'communication',
        'meet.google.com': 'communication',
        
        // Design
        'figma.com': 'design',
        'adobe.com': 'design',
        'sketch.com': 'design',
        'canva.com': 'design',
        
        // Admin/Management
        'admin.panel': 'administration',
        'database.admin': 'administration',
        'server.management': 'administration',
        'cloud.console': 'administration',
        
        // Social/Entertainment
        'facebook.com': 'social',
        'instagram.com': 'social',
        'twitter.com': 'social',
        'linkedin.com': 'social',
        'tiktok.com': 'social',
        'youtube.com': 'entertainment',
        'netflix.com': 'entertainment',
        'reddit.com': 'entertainment',
        'twitch.tv': 'entertainment'
      },
      productivityRules: {
        // Productive websites
        'github.com': 'productive',
        'gitlab.com': 'productive',
        'stackoverflow.com': 'productive',
        'developer.mozilla.org': 'productive',
        'docs.microsoft.com': 'productive',
        'angular.io': 'productive',
        'reactjs.org': 'productive',
        'vuejs.org': 'productive',
        'nodejs.org': 'productive',
        'npmjs.com': 'productive',
        'jira.atlassian.com': 'productive',
        'trello.com': 'productive',
        'notion.so': 'productive',
        'slack.com': 'productive',
        'teams.microsoft.com': 'productive',
        'figma.com': 'productive',
        'admin.panel': 'productive',
        'database.admin': 'productive',
        'server.management': 'productive',
        
        // Unproductive websites
        'facebook.com': 'unproductive',
        'instagram.com': 'unproductive',
        'twitter.com': 'unproductive',
        'tiktok.com': 'unproductive',
        'youtube.com': 'unproductive',
        'netflix.com': 'unproductive',
        'reddit.com': 'unproductive',
        'twitch.tv': 'unproductive'
      },
      privacyMode: false,
      blocklist: [], // No blocked domains
      allowlist: [] // No specific allowlist
    } as any);
    console.log('✅ Website tracking settings created');

    // Create screen capture settings
    await createScreenCaptureSettings({
      employeeId: objectId,
      enabled: true,
      intervalMinutes: 10, // 10 minutes for admin
      quality: 0.9, // High quality for admin
      maxCapturesPerDay: 48, // More captures for admin
      requireUserConsent: true,
      useRandomTiming: true,
      randomVariationPercent: 25,
      burstModeEnabled: false,
      burstIntervalSeconds: 30,
      burstDurationMinutes: 5,
      burstFrequency: 'medium',
      customBurstIntervalMinutes: 30
    } as any);
    console.log('✅ Screen capture settings created');

  } catch (error) {
    console.error('❌ Error setting up admin settings:', error);
    throw error;
  }
}

async function setupInitialConfiguration(): Promise<void> {
  try {
    console.log('🚀 Setting up initial configuration...\n');

    // Create admin user
    const adminId = await createAdminUser();
    
    // Setup admin settings
    await setupAdminSettings(adminId);

    console.log('\n🎉 Initial configuration completed successfully!');
    console.log('\n📋 Admin Account Details:');
    console.log('═'.repeat(60));
    console.log(`Name: ${adminConfig.name}`);
    console.log(`Email: ${adminConfig.email}`);
    console.log(`Password: ${adminConfig.password}`);
    console.log(`Role: ADMIN`);
    console.log(`Department: ${adminConfig.department}`);
    console.log(`Position: ${adminConfig.position}`);
    console.log(`Admin ID: ${adminId}`);
    console.log('\n⏰ Work Schedule:');
    console.log(`Start Time: ${adminConfig.workStartTime}`);
    console.log(`End Time: ${adminConfig.workEndTime}`);
    console.log(`Break Duration: 60 minutes`);
    console.log(`Working Days: Monday - Friday`);
    console.log('\n🔧 Features Enabled:');
    console.log('   ✅ Time Tracking');
    console.log('   ✅ Idle Detection (10 min threshold)');
    console.log('   ✅ Application Tracking');
    console.log('   ✅ Website Tracking');
    console.log('   ✅ Screen Capture (10 min intervals)');
    console.log('   ✅ Admin Panel Access');
    console.log('\n⚠️  Important Security Notes:');
    console.log('   • Change the default admin password after first login');
    console.log('   • Configure proper authentication in production');
    console.log('   • Review and adjust tracking settings as needed');
    console.log('   • Ensure compliance with privacy regulations');

  } catch (error) {
    console.error('❌ Error setting up initial configuration:', error);
    throw error;
  }
}

// Run the setup script
setupInitialConfiguration()
  .then(() => {
    console.log('\n✨ Setup script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup script failed:', error);
    process.exit(1);
  });
