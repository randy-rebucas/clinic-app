/**
 * Script to add passwords to existing demo accounts
 * Run with: npx tsx scripts/add-passwords-to-demo-accounts.ts
 */

import connectDB from '../lib/mongodb';
import { Employee } from '../lib/models/Employee';

async function addPasswordsToDemoAccounts(): Promise<void> {
  try {
    console.log('🔐 Adding passwords to demo accounts...\n');

    // Connect to database
    await connectDB();

    // Demo account passwords
    const demoAccounts = [
      {
        email: 'admin@demo.com',
        password: 'admin123',
        name: 'Admin User'
      },
      {
        email: 'john.doe@demo.com',
        password: 'john123',
        name: 'John Doe'
      },
      {
        email: 'jane.smith@demo.com',
        password: 'jane123',
        name: 'Jane Smith'
      }
    ];

    console.log('📋 Updating demo accounts with passwords:');
    console.log('═'.repeat(60));

    for (const account of demoAccounts) {
      try {
        const employee = await Employee.findOne({ email: account.email });
        
        if (employee) {
          // Update the password (it will be hashed by the pre-save middleware)
          employee.password = account.password;
          await employee.save();
          
          console.log(`✅ Updated: ${account.name} (${account.email})`);
          console.log(`   Password: ${account.password}`);
          console.log(`   Role: ${employee.role}`);
        } else {
          console.log(`❌ Not found: ${account.email}`);
        }
      } catch (error) {
        console.log(`❌ Error updating ${account.email}: ${error}`);
      }
      console.log('');
    }

    console.log('🔍 Verifying password updates:');
    console.log('═'.repeat(60));

    for (const account of demoAccounts) {
      try {
        const employee = await Employee.findOne({ email: account.email });
        
        if (employee) {
          const isPasswordValid = await employee.comparePassword(account.password);
          console.log(`${isPasswordValid ? '✅' : '❌'} ${account.name}: Password ${isPasswordValid ? 'valid' : 'invalid'}`);
        }
      } catch (error) {
        console.log(`❌ Error verifying ${account.email}: ${error}`);
      }
    }

  } catch (error) {
    console.error('❌ Error adding passwords to demo accounts:', error);
    throw error;
  }
}

// Run the script
addPasswordsToDemoAccounts()
  .then(() => {
    console.log('\n✨ Password update completed successfully!');
    console.log('\n📝 Demo Account Credentials:');
    console.log('═'.repeat(60));
    console.log('Admin Account:');
    console.log('  Email: admin@demo.com');
    console.log('  Password: admin123');
    console.log('\nEmployee Accounts:');
    console.log('  Email: john.doe@demo.com');
    console.log('  Password: john123');
    console.log('  Email: jane.smith@demo.com');
    console.log('  Password: jane123');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Password update failed:', error);
    process.exit(1);
  });
