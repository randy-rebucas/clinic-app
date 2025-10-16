/**
 * Script to create simple demo accounts with basic settings
 * Run with: npx tsx scripts/create-simple-demo-accounts.ts
 */

import { createEmployee } from '../lib/database';
import { createAttendanceSettings } from '../lib/database';
import { createIdleSettings } from '../lib/database';
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

async function createBasicAccountSettings(employeeId: string, account: DemoAccount): Promise<void> {
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

  // Note: Notification settings would be created here if the function existed
  // For now, basic notification settings are handled by the application defaults
}

async function createSimpleDemoAccounts(): Promise<void> {
  try {
    console.log('🚀 Creating simple demo accounts...\n');

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

      // Create basic settings
      await createBasicAccountSettings(employeeId, account);

      createdAccounts.push({
        ...account,
        id: employeeId
      });

      console.log(`✅ ${account.role} account created successfully!\n`);
    }

    // Display summary
    console.log('🎉 Simple demo accounts created successfully!\n');
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
    console.log('\n🔧 Basic Features Enabled:');
    console.log('   ✅ Time Tracking');
    console.log('   ✅ Idle Detection');
    console.log('   ✅ Admin Panel Access (for admin accounts)');
    console.log('\n📝 Note: Advanced tracking features (application/website/screen capture)');
    console.log('   can be configured later through the admin panel.');

  } catch (error) {
    console.error('❌ Error creating simple demo accounts:', error);
    throw error;
  }
}

// Run the script
createSimpleDemoAccounts()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
