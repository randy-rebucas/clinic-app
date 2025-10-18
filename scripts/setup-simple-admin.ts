/**
 * Simple Admin Setup Script
 * This script creates a basic admin user with minimal settings to avoid Mongoose Map issues
 * 
 * Run with: npx tsx scripts/setup-simple-admin.ts
 */

import { createEmployee } from '../lib/database';
import { createAttendanceSettings } from '../lib/database';
import { createIdleSettings } from '../lib/database';
import { Types } from 'mongoose';

async function createSimpleAdmin(): Promise<void> {
  try {
    console.log('🚀 Creating simple admin user...\n');

    // Create admin employee (password will be hashed by the Employee model)
    const adminId = await createEmployee({
      name: 'System Administrator',
      email: 'admin@localpro.asia',
      password: 'P@$$w0rd2025!',
      role: 'admin',
      department: 'Administration',
      position: 'System Administrator'
    });

    console.log(`✅ Admin user created with ID: ${adminId}`);

    // Create attendance settings
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
    } as any);
    console.log('✅ Attendance settings created');

    // Create idle settings
    await createIdleSettings({
      employeeId: new Types.ObjectId(adminId),
      enabled: true,
      idleThresholdMinutes: 10, // 10 minutes idle threshold for admin
      pauseTimerOnIdle: true,
      showIdleWarning: true,
      warningTimeMinutes: 2,
      autoResumeOnActivity: true
    } as any);
    console.log('✅ Idle settings created');

    console.log('\n🎉 Simple admin setup completed successfully!');
    console.log('\n📋 Admin Account Details:');
    console.log('═'.repeat(60));
    console.log('Name: System Administrator');
    console.log('Email: admin@localpro.asia');
    console.log('Password: P@$$w0rd2025!');
    console.log('Role: ADMIN');
    console.log('Department: Administration');
    console.log('Position: System Administrator');
    console.log('Admin ID:', adminId);
    console.log('\n⏰ Work Schedule:');
    console.log('Start Time: 08:00');
    console.log('End Time: 18:00');
    console.log('Break Duration: 60 minutes');
    console.log('Working Days: Monday - Friday');
    console.log('\n🔧 Features Enabled:');
    console.log('   ✅ Time Tracking');
    console.log('   ✅ Idle Detection (10 min threshold)');
    console.log('   ✅ Admin Panel Access');
    console.log('\n⚠️  Important Security Notes:');
    console.log('   • Change the default admin password after first login');
    console.log('   • Configure additional tracking settings as needed');
    console.log('   • Ensure compliance with privacy regulations');

  } catch (error) {
    console.error('❌ Error creating simple admin:', error);
    throw error;
  }
}

// Run the script
createSimpleAdmin()
  .then(() => {
    console.log('\n✨ Simple admin setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Simple admin setup failed:', error);
    process.exit(1);
  });
