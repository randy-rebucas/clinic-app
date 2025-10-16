/**
 * Script to display a summary of all demo accounts
 * Run with: npx tsx scripts/demo-accounts-summary.ts
 */

import { getEmployeeByEmail, getAllEmployees } from '../lib/database';
import { getAttendanceSettings } from '../lib/database';
import { getIdleSettings } from '../lib/database';

async function displayDemoAccountsSummary(): Promise<void> {
  try {
    console.log('🎯 DEMO ACCOUNTS SUMMARY');
    console.log('═'.repeat(80));
    console.log('');

    const demoEmails = [
      'john.doe@demo.com',
      'jane.smith@demo.com',
      'admin@demo.com'
    ];

    for (const email of demoEmails) {
      try {
        const employee = await getEmployeeByEmail(email);
        if (employee) {
          console.log(`👤 ${employee.name.toUpperCase()}`);
          console.log('─'.repeat(40));
          console.log(`   📧 Email: ${employee.email}`);
          console.log(`   🎭 Role: ${employee.role.toUpperCase()}`);
          console.log(`   🏢 Department: ${employee.department || 'N/A'}`);
          console.log(`   💼 Position: ${employee.position || 'N/A'}`);
          console.log(`   🆔 ID: ${employee._id}`);
          console.log(`   📅 Created: ${employee.createdAt.toLocaleDateString()}`);
          
          // Get attendance settings
          try {
            const attendanceSettings = await getAttendanceSettings(employee._id.toString());
            if (attendanceSettings) {
              console.log(`   ⏰ Work Hours: ${attendanceSettings.workStartTime} - ${attendanceSettings.workEndTime}`);
              console.log(`   ☕ Break Duration: ${attendanceSettings.breakDuration} minutes`);
              console.log(`   📍 Remote Work: ${attendanceSettings.allowRemoteWork ? 'Allowed' : 'Not Allowed'}`);
            }
          } catch (error) {
            console.log(`   ⏰ Work Hours: Not configured`);
          }

          // Get idle settings
          try {
            const idleSettings = await getIdleSettings(employee._id.toString());
            if (idleSettings) {
              console.log(`   😴 Idle Detection: ${idleSettings.enabled ? 'Enabled' : 'Disabled'}`);
              console.log(`   ⏱️  Idle Threshold: ${idleSettings.idleThresholdMinutes} minutes`);
            }
          } catch (error) {
            console.log(`   😴 Idle Detection: Not configured`);
          }

          console.log('');
        } else {
          console.log(`❌ Account not found: ${email}`);
          console.log('');
        }
      } catch (error) {
        console.log(`❌ Error loading ${email}: ${error}`);
        console.log('');
      }
    }

    console.log('═'.repeat(80));
    console.log('📊 QUICK STATS');
    console.log('─'.repeat(20));
    
    const allEmployees = await getAllEmployees();
    const employees = allEmployees.filter(emp => emp.role === 'employee');
    const admins = allEmployees.filter(emp => emp.role === 'admin');
    
    console.log(`   👥 Total Employees: ${employees.length}`);
    console.log(`   👑 Total Admins: ${admins.length}`);
    console.log(`   📈 Total Accounts: ${allEmployees.length}`);
    
    console.log('');
    console.log('═'.repeat(80));
    console.log('🔐 LOGIN INFORMATION');
    console.log('─'.repeat(25));
    console.log('   Note: These are demo accounts for testing purposes.');
    console.log('   In a real application, you would need to implement');
    console.log('   proper authentication and password management.');
    console.log('');
    console.log('   📧 Employee Accounts:');
    console.log('      • john.doe@demo.com (Software Developer)');
    console.log('      • jane.smith@demo.com (Marketing Manager)');
    console.log('');
    console.log('   👑 Admin Account:');
    console.log('      • admin@demo.com (System Administrator)');
    console.log('');
    console.log('═'.repeat(80));
    console.log('✨ Demo accounts are ready for testing!');

  } catch (error) {
    console.error('❌ Error displaying demo accounts summary:', error);
    throw error;
  }
}

// Run the script
displayDemoAccountsSummary()
  .then(() => {
    console.log('');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
