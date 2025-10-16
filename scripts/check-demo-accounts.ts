/**
 * Script to check existing demo accounts
 * Run with: npx tsx scripts/check-demo-accounts.ts
 */

import { getEmployeeByEmail, getAllEmployees } from '../lib/database';

async function checkDemoAccounts(): Promise<void> {
  try {
    console.log('🔍 Checking existing demo accounts...\n');

    const demoEmails = [
      'john.doe@demo.com',
      'jane.smith@demo.com',
      'admin@demo.com'
    ];

    console.log('📋 Checking for demo accounts:');
    console.log('═'.repeat(60));

    for (const email of demoEmails) {
      try {
        const employee = await getEmployeeByEmail(email);
        if (employee) {
          console.log(`✅ Found: ${employee.name} (${employee.email})`);
          console.log(`   Role: ${employee.role}`);
          console.log(`   Department: ${employee.department || 'N/A'}`);
          console.log(`   Position: ${employee.position || 'N/A'}`);
          console.log(`   ID: ${employee._id}`);
          console.log(`   Created: ${employee.createdAt}`);
        } else {
          console.log(`❌ Not found: ${email}`);
        }
      } catch (error) {
        console.log(`❌ Error checking ${email}: ${error}`);
      }
      console.log('');
    }

    // Also show all employees
    console.log('📊 All employees in database:');
    console.log('═'.repeat(60));
    
    const allEmployees = await getAllEmployees();
    if (allEmployees.length === 0) {
      console.log('No employees found in database.');
    } else {
      allEmployees.forEach((employee, index) => {
        console.log(`${index + 1}. ${employee.name} (${employee.email})`);
        console.log(`   Role: ${employee.role}`);
        console.log(`   Department: ${employee.department || 'N/A'}`);
        console.log(`   Position: ${employee.position || 'N/A'}`);
        console.log(`   ID: ${employee._id}`);
        console.log(`   Created: ${employee.createdAt}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error checking demo accounts:', error);
    throw error;
  }
}

// Run the script
checkDemoAccounts()
  .then(() => {
    console.log('✨ Check completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Check failed:', error);
    process.exit(1);
  });
