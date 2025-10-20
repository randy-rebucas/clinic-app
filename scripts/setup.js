#!/usr/bin/env node

/**
 * CLI Setup Script for MediNext
 * 
 * Usage:
 *   node scripts/setup.js
 *   node scripts/setup.js --reset
 *   node scripts/setup.js --check
 *   node scripts/setup.js --admin-email admin@clinic.com --admin-password Admin123!@#
 */

const readline = require('readline');
const { setupApplication, resetApplication, isApplicationSetup, getSetupStatus } = require('../lib/setup');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  switch (arg) {
    case '--reset':
      options.reset = true;
      break;
    case '--check':
      options.check = true;
      break;
    case '--admin-email':
      options.adminEmail = args[++i];
      break;
    case '--admin-password':
      options.adminPassword = args[++i];
      break;
    case '--admin-name':
      options.adminName = args[++i];
      break;
    case '--no-seed':
      options.includeSeedData = false;
      break;
    case '--help':
      showHelp();
      process.exit(0);
      break;
  }
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function showHelp() {
  console.log(`
MediNext Setup Script

Usage:
  node scripts/setup.js [options]

Options:
  --reset                 Reset the application (delete all data)
  --check                 Check if application is already set up
  --admin-email EMAIL     Set admin email (default: admin@clinic.com)
  --admin-password PASS   Set admin password (default: Admin123!@#)
  --admin-name NAME       Set admin name (default: System Administrator)
  --no-seed               Skip creating sample data
  --help                  Show this help message

Examples:
  node scripts/setup.js
  node scripts/setup.js --reset
  node scripts/setup.js --check
  node scripts/setup.js --admin-email admin@myclinic.com --admin-password MySecurePass123!
`);
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function getSetupOptions() {
  const adminEmail = options.adminEmail || await askQuestion('Admin email (default: admin@clinic.com): ') || 'admin@clinic.com';
  const adminPassword = options.adminPassword || await askQuestion('Admin password (default: Admin123!@#): ') || 'Admin123!@#';
  const adminName = options.adminName || await askQuestion('Admin name (default: System Administrator): ') || 'System Administrator';
  
  const includeSeedData = options.includeSeedData !== false;
  if (options.includeSeedData === undefined) {
    const seedAnswer = await askQuestion('Include sample data? (y/N): ');
    options.includeSeedData = seedAnswer.toLowerCase() === 'y' || seedAnswer.toLowerCase() === 'yes';
  }

  return {
    adminEmail,
    adminPassword,
    adminName,
    includeSeedData: options.includeSeedData,
    resetExisting: false
  };
}

async function main() {
  try {
    console.log('🏥 MediNext Setup\n');

    if (options.check) {
      console.log('Checking setup status...');
      const status = await getSetupStatus();
      console.log('\nSetup Status:');
      console.log(`- Is Setup: ${status.isSetup ? '✅ Yes' : '❌ No'}`);
      console.log(`- Has Admin: ${status.hasAdmin ? '✅ Yes' : '❌ No'}`);
      console.log(`- Has Settings: ${status.hasSettings ? '✅ Yes' : '❌ No'}`);
      console.log(`- User Count: ${status.userCount}`);
      return;
    }

    if (options.reset) {
      console.log('⚠️  WARNING: This will delete all data!');
      const confirmReset = await askQuestion('Are you sure you want to reset? (yes/no): ');
      
      if (confirmReset.toLowerCase() !== 'yes') {
        console.log('Reset cancelled.');
        return;
      }

      console.log('Resetting application...');
      const result = await resetApplication();
      
      if (result.success) {
        console.log('✅ Application reset successfully!');
        console.log(`Message: ${result.message}`);
      } else {
        console.log('❌ Reset failed!');
        console.log(`Error: ${result.message}`);
        if (result.errors) {
          result.errors.forEach(error => console.log(`  - ${error}`));
        }
      }
      return;
    }

    // Check if already set up
    const isSetup = await isApplicationSetup();
    if (isSetup && !options.resetExisting) {
      console.log('⚠️  Application is already set up!');
      const overwrite = await askQuestion('Do you want to reset and setup again? (yes/no): ');
      
      if (overwrite.toLowerCase() !== 'yes') {
        console.log('Setup cancelled.');
        return;
      }
      
      options.resetExisting = true;
    }

    // Get setup options
    const setupOptions = await getSetupOptions();
    setupOptions.resetExisting = options.resetExisting;

    console.log('\n🚀 Starting setup...');
    console.log(`Admin Email: ${setupOptions.adminEmail}`);
    console.log(`Admin Name: ${setupOptions.adminName}`);
    console.log(`Include Seed Data: ${setupOptions.includeSeedData ? 'Yes' : 'No'}`);
    console.log(`Reset Existing: ${setupOptions.resetExisting ? 'Yes' : 'No'}`);

    const result = await setupApplication(setupOptions);

    if (result.success) {
      console.log('\n✅ Setup completed successfully!');
      console.log(`Message: ${result.message}`);
      
      if (result.data) {
        console.log('\nCreated:');
        if (result.data.adminUserId) console.log(`- Admin User ID: ${result.data.adminUserId}`);
        if (result.data.settingsId) console.log(`- Settings ID: ${result.data.settingsId}`);
        if (result.data.createdUsers) console.log(`- Users: ${result.data.createdUsers}`);
        if (result.data.createdPatients) console.log(`- Patients: ${result.data.createdPatients}`);
        if (result.data.createdAppointments) console.log(`- Appointments: ${result.data.createdAppointments}`);
        if (result.data.createdPrescriptions) console.log(`- Prescriptions: ${result.data.createdPrescriptions}`);
        if (result.data.createdLabOrders) console.log(`- Lab Orders: ${result.data.createdLabOrders}`);
        if (result.data.createdInvoices) console.log(`- Invoices: ${result.data.createdInvoices}`);
        if (result.data.createdPayments) console.log(`- Payments: ${result.data.createdPayments}`);
        if (result.data.createdQueueEntries) console.log(`- Queue Entries: ${result.data.createdQueueEntries}`);
      }

      console.log('\n🎉 You can now access the application!');
      console.log('Login with the admin credentials you provided.');
      
    } else {
      console.log('\n❌ Setup failed!');
      console.log(`Error: ${result.message}`);
      if (result.errors) {
        console.log('\nErrors:');
        result.errors.forEach(error => console.log(`  - ${error}`));
      }
    }

  } catch (error) {
    console.error('\n💥 Setup failed with error:', error.message);
    console.error(error.stack);
  } finally {
    rl.close();
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\nSetup cancelled by user.');
  rl.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\nSetup terminated.');
  rl.close();
  process.exit(0);
});

// Run the setup
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
