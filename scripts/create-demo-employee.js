/**
 * Script to create a demo employee account
 * Run with: node scripts/create-demo-employee.js
 */

const { createEmployee } = require('../lib/database');
const { createAttendanceSettings } = require('../lib/database');
const { createIdleSettings } = require('../lib/database');
const { createApplicationTrackingSettings } = require('../lib/database');
const { createWebsiteTrackingSettings } = require('../lib/database');
const { createScreenCaptureSettings } = require('../lib/database');

async function createDemoEmployee() {
  try {
    console.log('🚀 Creating demo employee account...');

    // Create demo employee
    const employeeId = await createEmployee({
      name: 'John Doe',
      email: 'john.doe@demo.com',
      role: 'employee',
      department: 'Engineering',
      position: 'Software Developer'
    });

    console.log(`✅ Demo employee created with ID: ${employeeId}`);

    // Create default attendance settings
    await createAttendanceSettings({
      employeeId: employeeId,
      workStartTime: '09:00',
      workEndTime: '17:00',
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

    console.log('✅ Attendance settings created');

    // Create default idle settings
    await createIdleSettings({
      employeeId: employeeId,
      enabled: true,
      idleThresholdMinutes: 5,
      pauseTimerOnIdle: true,
      showIdleWarning: true,
      warningTimeMinutes: 1,
      autoResumeOnActivity: true
    });

    console.log('✅ Idle settings created');

    // Create default application tracking settings
    await createApplicationTrackingSettings({
      employeeId: employeeId,
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
        'Jira'
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
      screenshotInterval: 300, // 5 minutes
      privacyMode: false
    });

    console.log('✅ Application tracking settings created');

    // Create default website tracking settings
    await createWebsiteTrackingSettings({
      employeeId: employeeId,
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
        'adobe.com'
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
      screenshotInterval: 300, // 5 minutes
      privacyMode: false
    });

    console.log('✅ Website tracking settings created');

    // Create default screen capture settings
    await createScreenCaptureSettings({
      employeeId: employeeId,
      enabled: true,
      captureInterval: 300, // 5 minutes
      maxStorageDays: 30,
      quality: 'medium',
      privacyMode: false,
      blurSensitiveData: true
    });

    console.log('✅ Screen capture settings created');

    // Note: Notification settings would be created here if the function existed
    // For now, basic notification settings are handled by the application defaults

    console.log('\n🎉 Demo employee account created successfully!');
    console.log('\n📋 Account Details:');
    console.log(`   Name: John Doe`);
    console.log(`   Email: john.doe@demo.com`);
    console.log(`   Role: Employee`);
    console.log(`   Department: Engineering`);
    console.log(`   Position: Software Developer`);
    console.log(`   Employee ID: ${employeeId}`);
    console.log('\n⏰ Work Schedule:');
    console.log(`   Start Time: 09:00`);
    console.log(`   End Time: 17:00`);
    console.log(`   Break Duration: 60 minutes`);
    console.log(`   Working Days: Monday - Friday`);
    console.log('\n🔧 Features Enabled:');
    console.log(`   ✅ Time Tracking`);
    console.log(`   ✅ Idle Detection`);
    console.log(`   ✅ Application Tracking`);
    console.log(`   ✅ Website Tracking`);
    console.log(`   ✅ Screen Capture`);

  } catch (error) {
    console.error('❌ Error creating demo employee:', error);
    process.exit(1);
  }
}

// Run the script
createDemoEmployee()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
