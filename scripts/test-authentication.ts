/**
 * Script to test authentication with demo accounts
 * Run with: npx tsx scripts/test-authentication.ts
 */

import { getEmployeeByEmail } from '../lib/database';
import { comparePassword } from '../lib/auth';

interface TestAccount {
  email: string;
  password: string;
  name: string;
}

const testAccounts: TestAccount[] = [
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

async function testAuthentication(): Promise<void> {
  try {
    console.log('🔐 Testing authentication with demo accounts...\n');

    for (const account of testAccounts) {
      console.log(`Testing ${account.name} (${account.email})...`);

      try {
        // Get employee from database
        const employee = await getEmployeeByEmail(account.email);
        
        if (!employee) {
          console.log(`❌ Employee not found: ${account.email}`);
          continue;
        }

        // Test password verification
        const isPasswordValid = await comparePassword(account.password, employee.password);
        
        if (isPasswordValid) {
          console.log(`✅ Authentication successful for ${account.name}`);
          console.log(`   Role: ${employee.role}`);
          console.log(`   Department: ${employee.department || 'N/A'}`);
          console.log(`   Position: ${employee.position || 'N/A'}`);
        } else {
          console.log(`❌ Authentication failed for ${account.name} - Invalid password`);
        }
      } catch (error) {
        console.log(`❌ Error testing ${account.name}:`, error);
      }
      
      console.log('');
    }

    console.log('🎉 Authentication testing completed!');
    console.log('\n📋 Demo Account Credentials:');
    console.log('═'.repeat(60));
    
    testAccounts.forEach((account, index) => {
      console.log(`\n${index + 1}. ${account.name}`);
      console.log(`   📧 Email: ${account.email}`);
      console.log(`   🔑 Password: ${account.password}`);
    });

    console.log('\n═'.repeat(60));
    console.log('🔐 Ready for testing!');
    console.log('   • Use these credentials to log in to the application');
    console.log('   • Passwords are securely hashed with bcrypt');
    console.log('   • Admin account has elevated privileges');

  } catch (error) {
    console.error('❌ Error testing authentication:', error);
    throw error;
  }
}

// Run the script
testAuthentication()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
