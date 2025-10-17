/**
 * Script to update existing demo accounts with passwords
 * Run with: npx tsx scripts/update-demo-accounts-with-passwords.ts
 */

import { getEmployeeByEmail, updateEmployee } from '../lib/database';
import { hashPassword } from '../lib/auth';
import { Types } from 'mongoose';

interface DemoAccount {
  email: string;
  password: string;
  name: string;
}

const demoAccounts: DemoAccount[] = [
  {
    email: 'john.doe@demo.com',
    password: 'password123',
    name: 'John Doe'
  },
  {
    email: 'jane.smith@demo.com',
    password: 'password123',
    name: 'Jane Smith'
  },
  {
    email: 'admin@demo.com',
    password: 'admin123',
    name: 'Admin User'
  }
];

async function updateDemoAccountsWithPasswords(): Promise<void> {
  try {
    console.log('🔐 Updating demo accounts with passwords...\n');

    for (const account of demoAccounts) {
      console.log(`Updating ${account.name} (${account.email})...`);

      try {
        // Get existing employee
        const employee = await getEmployeeByEmail(account.email);
        
        if (!employee) {
          console.log(`❌ Employee not found: ${account.email}`);
          continue;
        }

        // Hash the password
        const hashedPassword = await hashPassword(account.password);

        // Update employee with hashed password
        await updateEmployee(employee._id.toString(), {
          password: hashedPassword
        });

        console.log(`✅ Updated ${account.name} with password`);
      } catch (error) {
        console.log(`❌ Error updating ${account.name}:`, error);
      }
    }

    console.log('\n🎉 Demo accounts updated with passwords!');
    console.log('\n📋 Demo Account Credentials:');
    console.log('═'.repeat(60));
    
    demoAccounts.forEach((account, index) => {
      console.log(`\n${index + 1}. ${account.name}`);
      console.log(`   📧 Email: ${account.email}`);
      console.log(`   🔑 Password: ${account.password}`);
    });

    console.log('\n═'.repeat(60));
    console.log('🔐 Security Notes:');
    console.log('   • Passwords are hashed using bcrypt');
    console.log('   • These are demo passwords for testing only');
    console.log('   • Use strong passwords in production');
    console.log('   • Consider implementing password policies');

  } catch (error) {
    console.error('❌ Error updating demo accounts:', error);
    throw error;
  }
}

// Run the script
updateDemoAccountsWithPasswords()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
