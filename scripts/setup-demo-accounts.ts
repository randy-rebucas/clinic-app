/**
 * Script to create demo employee and admin accounts
 * Run with: npx tsx scripts/setup-demo-accounts.ts
 */

import { createEmployee } from '../lib/database';
import { createAttendanceSettings } from '../lib/database';
import { createIdleSettings } from '../lib/database';
import { createApplicationTrackingSettings } from '../lib/database';
import { createWebsiteTrackingSettings } from '../lib/database';
import { createScreenCaptureSettings } from '../lib/database';
import { Types } from 'mongoose';

interface DemoAccount {
  name: string;
  email: string;
  role: 'employee' | 'admin';
  department: string;
  position: string;
  workStartTime: string;
  workEndTime: string;
}

const demoAccounts: DemoAccount[] = [
  {
    name: 'John Doe',
    email: 'john.doe@demo.com',
    role: 'employee',
    department: 'Engineering',
    position: 'Software Developer',
    workStartTime: '09:00',
    workEndTime: '17:00'
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@demo.com',
    role: 'employee',
    department: 'Marketing',
    position: 'Marketing Manager',
    workStartTime: '08:30',
    workEndTime: '17:30'
  },
  {
    name: 'Admin User',
    email: 'admin@demo.com',
    role: 'admin',
    department: 'Administration',
    position: 'System Administrator',
    workStartTime: '08:00',
    workEndTime: '18:00'
  }
];

async function createAccountSettings(employeeId: string, account: DemoAccount): Promise<void> {
  const objectId = new Types.ObjectId(employeeId);

  // Create attendance settings
  await createAttendanceSettings({
    employeeId: objectId,
    workStartTime: account.workStartTime,
    workEndTime: account.workEndTime,
    breakDuration: 60, // 1 hour break
    lateThreshold: 15, // 15 minutes late threshold
    earlyLeaveThreshold: 15, // 15 minutes early leave threshold
    overtimeThreshold: 0, // No overtime threshold
    workingDays: [1, 2, 3, 4, 5], // Monday to Friday
    timezone: 'UTC',
    requireLocation: false,
    allowRemoteWork: true,
    autoPunchOut: false
  });

  // Create idle settings
  await createIdleSettings({
    employeeId: objectId,
    enabled: true,
    idleThresholdMinutes: account.role === 'admin' ? 10 : 5,
    pauseTimerOnIdle: true,
    showIdleWarning: true,
    warningTimeMinutes: account.role === 'admin' ? 2 : 1,
    autoResumeOnActivity: true
  });

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
      'Visual Studio Code': 'productive',
      'IntelliJ IDEA': 'productive',
      'Sublime Text': 'productive',
      'Atom': 'productive',
      'WebStorm': 'productive',
      'Chrome': 'productive',
      'Firefox': 'productive',
      'Safari': 'productive',
      'Terminal': 'productive',
      'Command Prompt': 'productive',
      'PowerShell': 'productive',
      'Git Bash': 'productive',
      'Docker Desktop': 'productive',
      'Postman': 'productive',
      'Figma': 'productive',
      'Adobe XD': 'productive',
      'Slack': 'productive',
      'Microsoft Teams': 'productive',
      'Zoom': 'productive',
      'Notion': 'productive',
      'Trello': 'productive',
      'Jira': 'productive',
      'Steam': 'unproductive',
      'Discord': 'unproductive',
      'Spotify': 'unproductive',
      'YouTube': 'unproductive',
      'Netflix': 'unproductive',
      'Facebook': 'unproductive',
      'Instagram': 'unproductive',
      'Twitter': 'unproductive',
      'TikTok': 'unproductive',
      'Games': 'unproductive',
      ...(account.role === 'admin' ? {
        'Admin Panel': 'productive',
        'Database Tools': 'productive',
        'Server Management': 'productive'
      } : {})
    },
    privacyMode: false
  });

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
      'github.com': 'development',
      'stackoverflow.com': 'development',
      'developer.mozilla.org': 'development',
      'docs.microsoft.com': 'development',
      'angular.io': 'development',
      'reactjs.org': 'development',
      'vuejs.org': 'development',
      'nodejs.org': 'development',
      'npmjs.com': 'development',
      'jira.atlassian.com': 'work',
      'trello.com': 'work',
      'notion.so': 'work',
      'slack.com': 'communication',
      'teams.microsoft.com': 'communication',
      'zoom.us': 'communication',
      'figma.com': 'design',
      'adobe.com': 'design',
      'facebook.com': 'social',
      'instagram.com': 'social',
      'twitter.com': 'social',
      'tiktok.com': 'social',
      'youtube.com': 'entertainment',
      'netflix.com': 'entertainment',
      'reddit.com': 'entertainment',
      '9gag.com': 'entertainment',
      'buzzfeed.com': 'entertainment',
      ...(account.role === 'admin' ? {
        'admin.panel': 'administration',
        'database.admin': 'administration',
        'server.management': 'administration'
      } : {})
    },
    productivityRules: {
      'github.com': 'productive',
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
      'zoom.us': 'productive',
      'figma.com': 'productive',
      'adobe.com': 'productive',
      'facebook.com': 'unproductive',
      'instagram.com': 'unproductive',
      'twitter.com': 'unproductive',
      'tiktok.com': 'unproductive',
      'youtube.com': 'unproductive',
      'netflix.com': 'unproductive',
      'reddit.com': 'unproductive',
      '9gag.com': 'unproductive',
      'buzzfeed.com': 'unproductive',
      ...(account.role === 'admin' ? {
        'admin.panel': 'productive',
        'database.admin': 'productive',
        'server.management': 'productive'
      } : {})
    },
    privacyMode: false,
    blocklist: [], // No blocked domains
    allowlist: [] // No specific allowlist
  });

  // Create screen capture settings
  await createScreenCaptureSettings({
    employeeId: objectId,
    enabled: true,
    intervalMinutes: account.role === 'admin' ? 10 : 5, // 10 minutes for admin, 5 for employees
    quality: account.role === 'admin' ? 0.9 : 0.8, // High quality for admin, medium for employees
    maxCapturesPerDay: account.role === 'admin' ? 48 : 32, // More captures for admin
    requireUserConsent: true,
    useRandomTiming: true,
    randomVariationPercent: 25,
    burstModeEnabled: false,
    burstIntervalSeconds: 30,
    burstDurationMinutes: 5,
    burstFrequency: 'medium',
    customBurstIntervalMinutes: 30
  });

  // Note: Notification settings would be created here if the function existed
  // For now, basic notification settings are handled by the application defaults
}

async function setupDemoAccounts(): Promise<void> {
  try {
    console.log('🚀 Setting up demo accounts...\n');

    const createdAccounts = [];

    for (const account of demoAccounts) {
      console.log(`Creating ${account.role} account: ${account.name}...`);

      // Create employee/admin
      const employeeId = await createEmployee({
        name: account.name,
        email: account.email,
        role: account.role,
        department: account.department,
        position: account.position
      });

      // Create all settings
      await createAccountSettings(employeeId, account);

      createdAccounts.push({
        ...account,
        id: employeeId
      });

      console.log(`✅ ${account.role} account created successfully!\n`);
    }

    // Display summary
    console.log('🎉 All demo accounts created successfully!\n');
    console.log('📋 Created Accounts:');
    console.log('═'.repeat(80));

    createdAccounts.forEach((account, index) => {
      console.log(`\n${index + 1}. ${account.name}`);
      console.log(`   Email: ${account.email}`);
      console.log(`   Role: ${account.role.toUpperCase()}`);
      console.log(`   Department: ${account.department}`);
      console.log(`   Position: ${account.position}`);
      console.log(`   Work Hours: ${account.workStartTime} - ${account.workEndTime}`);
      console.log(`   ID: ${account.id}`);
    });

    console.log('\n═'.repeat(80));
    console.log('\n🔧 Features Enabled for All Accounts:');
    console.log('   ✅ Time Tracking');
    console.log('   ✅ Idle Detection');
    console.log('   ✅ Application Tracking');
    console.log('   ✅ Website Tracking');
    console.log('   ✅ Screen Capture');
    console.log('   ✅ Admin Panel Access (for admin accounts)');

    console.log('\n📝 Login Credentials:');
    console.log('   Note: These are demo accounts. In a real application,');
    console.log('   you would need to implement proper authentication.');
    console.log('   For now, you can use the email addresses to identify users.');

  } catch (error) {
    console.error('❌ Error setting up demo accounts:', error);
    throw error;
  }
}

// Run the script
setupDemoAccounts()
  .then(() => {
    console.log('\n✨ Setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });
