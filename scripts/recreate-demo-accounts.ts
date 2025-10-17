/**
 * Script to recreate demo accounts with proper password fields
 * Run with: npx tsx scripts/recreate-demo-accounts.ts
 */

import connectDB from '../lib/mongodb';
import { Employee } from '../lib/models/Employee';

async function recreateDemoAccounts(): Promise<void> {
  try {
    console.log('🔄 Recreating demo accounts with passwords...\n');

    // Connect to database
    await connectDB();

    // Demo account data
    const demoAccounts = [
      {
        email: 'admin@demo.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
        department: 'Administration',
        position: 'System Administrator'
      },
      {
        email: 'john.doe@demo.com',
        password: 'john123',
        name: 'John Doe',
        role: 'employee',
        department: 'Engineering',
        position: 'Software Developer'
      },
      {
        email: 'jane.smith@demo.com',
        password: 'jane123',
        name: 'Jane Smith',
        role: 'employee',
        department: 'Marketing',
        position: 'Marketing Manager'
      }
    ];

    console.log('🗑️  Removing existing demo accounts...');
    for (const account of demoAccounts) {
      await Employee.deleteOne({ email: account.email });
      console.log(`   Deleted: ${account.email}`);
    }

    console.log('\n➕ Creating new demo accounts with passwords...');
    for (const account of demoAccounts) {
      const employee = new Employee(account);
      await employee.save();
      console.log(`   Created: ${account.name} (${account.email})`);
      console.log(`   Password: ${account.password}`);
      console.log(`   Role: ${account.role}`);
    }

    console.log('\n🔍 Verifying new accounts...');
    for (const account of demoAccounts) {
      const employee = await Employee.findOne({ email: account.email });
      if (employee) {
        const isValid = await employee.comparePassword(account.password);
        console.log(`   ${account.name}: ${isValid ? '✅' : '❌'} Password verified`);
      }
    }

  } catch (error) {
    console.error('❌ Error recreating demo accounts:', error);
    throw error;
  }
}

// Run the script
recreateDemoAccounts()
  .then(() => {
    console.log('\n✨ Demo accounts recreated successfully!');
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
    console.error('💥 Recreation failed:', error);
    process.exit(1);
  });
