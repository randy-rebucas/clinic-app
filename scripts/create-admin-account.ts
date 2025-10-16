/**
 * Script to create admin demo account
 * Run with: npx tsx scripts/create-admin-account.ts
 */

import { createEmployee } from '../lib/database';
import { createAttendanceSettings } from '../lib/database';
import { createIdleSettings } from '../lib/database';
import { Types } from 'mongoose';

async function createAdminAccount(): Promise<void> {
  try {
    console.log('🚀 Creating admin demo account...\n');

    // Create admin employee
    const adminId = await createEmployee({
      name: 'Admin User',
      email: 'admin@demo.com',
      role: 'admin',
      department: 'Administration',
      position: 'System Administrator'
    });

    console.log(`✅ Admin account created with ID: ${adminId}`);

    const objectId = new Types.ObjectId(adminId);

    // Create attendance settings
    await createAttendanceSettings({
      employeeId: objectId,
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

    // Create idle settings
    await createIdleSettings({
      employeeId: objectId,
      enabled: true,
      idleThresholdMinutes: 10, // Longer threshold for admin
      pauseTimerOnIdle: true,
      showIdleWarning: true,
      warningTimeMinutes: 2,
      autoResumeOnActivity: true
    });

    console.log('✅ Admin idle settings created');

    console.log('\n🎉 Admin demo account created successfully!');
    console.log('\n📋 Account Details:');
    console.log(`   Name: Admin User`);
    console.log(`   Email: admin@demo.com`);
    console.log(`   Role: ADMIN`);
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
    console.log(`   ✅ Admin Panel Access`);

  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    throw error;
  }
}

// Run the script
createAdminAccount()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
