/**
 * Script to create a demo admin account
 * Run with: npx tsx scripts/create-demo-admin.ts
 */

import { createEmployee } from '../lib/database';
import { createAttendanceSettings } from '../lib/database';
import { createIdleSettings } from '../lib/database';
import { createApplicationTrackingSettings } from '../lib/database';
import { createWebsiteTrackingSettings } from '../lib/database';
import { createScreenCaptureSettings } from '../lib/database';
import { Types } from 'mongoose';

async function createDemoAdmin(): Promise<void> {
  try {
    console.log('🚀 Creating demo admin account...');

    // Create demo admin
    const adminId = await createEmployee({
      name: 'Admin User',
      email: 'admin@demo.com',
      role: 'admin',
      department: 'Administration',
      position: 'System Administrator'
    });

    console.log(`✅ Demo admin created with ID: ${adminId}`);

    // Create default attendance settings for admin
    await createAttendanceSettings({
      employeeId: new Types.ObjectId(adminId),
      workStartTime: '08:00',
      workEndTime: '18:00',
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

    console.log('✅ Admin attendance settings created');

    // Create default idle settings for admin
    await createIdleSettings({
      employeeId: new Types.ObjectId(adminId),
      enabled: true,
      idleThresholdMinutes: 10, // Longer threshold for admin
      pauseTimerOnIdle: true,
      showIdleWarning: true,
      warningTimeMinutes: 2,
      autoResumeOnActivity: true
    });

    console.log('✅ Admin idle settings created');

    // Create default application tracking settings for admin
    await createApplicationTrackingSettings({
      employeeId: new Types.ObjectId(adminId),
      enabled: true,
      trackProductiveApps: true,
      trackUnproductiveApps: true,
      productiveApps: [
        'Visual Studio Code',
        'IntelliJ IDEA',
        'Sublime Text',
        'Atom',
        'WebStorm',
        'Chrome',
        'Firefox',
        'Safari',
        'Terminal',
        'Command Prompt',
        'PowerShell',
        'Git Bash',
        'Docker Desktop',
        'Postman',
        'Figma',
        'Adobe XD',
        'Slack',
        'Microsoft Teams',
        'Zoom',
        'Notion',
        'Trello',
        'Jira',
        'Admin Panel',
        'Database Tools',
        'Server Management'
      ],
      unproductiveApps: [
        'Steam',
        'Discord',
        'Spotify',
        'YouTube',
        'Netflix',
        'Facebook',
        'Instagram',
        'Twitter',
        'TikTok',
        'Games'
      ],
      screenshotInterval: 600, // 10 minutes for admin
      privacyMode: false
    });

    console.log('✅ Admin application tracking settings created');

    // Create default website tracking settings for admin
    await createWebsiteTrackingSettings({
      employeeId: new Types.ObjectId(adminId),
      enabled: true,
      trackProductiveSites: true,
      trackUnproductiveSites: true,
      productiveSites: [
        'github.com',
        'stackoverflow.com',
        'developer.mozilla.org',
        'docs.microsoft.com',
        'angular.io',
        'reactjs.org',
        'vuejs.org',
        'nodejs.org',
        'npmjs.com',
        'jira.atlassian.com',
        'trello.com',
        'notion.so',
        'slack.com',
        'teams.microsoft.com',
        'zoom.us',
        'figma.com',
        'adobe.com',
        'admin.panel',
        'database.admin',
        'server.management'
      ],
      unproductiveSites: [
        'facebook.com',
        'instagram.com',
        'twitter.com',
        'tiktok.com',
        'youtube.com',
        'netflix.com',
        'reddit.com',
        '9gag.com',
        'buzzfeed.com'
      ],
      screenshotInterval: 600, // 10 minutes for admin
      privacyMode: false
    });

    console.log('✅ Admin website tracking settings created');

    // Create default screen capture settings for admin
    await createScreenCaptureSettings({
      employeeId: new Types.ObjectId(adminId),
      enabled: true,
      captureInterval: 600, // 10 minutes for admin
      maxStorageDays: 60, // Longer storage for admin
      quality: 'high',
      privacyMode: false,
      blurSensitiveData: true
    });

    console.log('✅ Admin screen capture settings created');

    // Note: Notification settings would be created here if the function existed
    // For now, basic notification settings are handled by the application defaults

    console.log('\n🎉 Demo admin account created successfully!');
    console.log('\n📋 Account Details:');
    console.log(`   Name: Admin User`);
    console.log(`   Email: admin@demo.com`);
    console.log(`   Role: Admin`);
    console.log(`   Department: Administration`);
    console.log(`   Position: System Administrator`);
    console.log(`   Admin ID: ${adminId}`);
    console.log('\n⏰ Work Schedule:');
    console.log(`   Start Time: 08:00`);
    console.log(`   End Time: 18:00`);
    console.log(`   Break Duration: 60 minutes`);
    console.log(`   Working Days: Monday - Friday`);
    console.log('\n🔧 Features Enabled:');
    console.log(`   ✅ Time Tracking`);
    console.log(`   ✅ Idle Detection`);
    console.log(`   ✅ Application Tracking`);
    console.log(`   ✅ Website Tracking`);
    console.log(`   ✅ Screen Capture`);
    console.log(`   ✅ Admin Panel Access`);

  } catch (error) {
    console.error('❌ Error creating demo admin:', error);
    throw error;
  }
}

// Run the script
createDemoAdmin()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
