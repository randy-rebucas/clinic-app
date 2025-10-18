/**
 * Master Database Setup Script
 * This script performs a complete fresh setup of the database:
 * 1. Cleans up all existing data
 * 2. Sets up initial configuration
 * 3. Creates admin user with all settings
 * 
 * Run with: npx tsx scripts/setup-fresh-database.ts
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runScript(scriptPath: string, description: string): Promise<void> {
  try {
    console.log(`\n🔄 ${description}...`);
    console.log('═'.repeat(60));
    
    const { stdout, stderr } = await execAsync(`npx tsx ${scriptPath}`);
    
    if (stdout) {
      console.log(stdout);
    }
    
    if (stderr) {
      console.error(stderr);
    }
    
    console.log(`✅ ${description} completed successfully!`);
  } catch (error) {
    console.error(`❌ Error during ${description}:`, error);
    throw error;
  }
}

async function setupFreshDatabase(): Promise<void> {
  try {
    console.log('🚀 Starting fresh database setup...');
    console.log('This will clean up all existing data and create a fresh setup.');
    console.log('═'.repeat(80));

    // Step 1: Clean up database
    await runScript('scripts/database-cleanup.ts', 'Database cleanup');

    // Step 2: Setup initial configuration
    await runScript('scripts/setup-initial-config.ts', 'Initial configuration setup');

    console.log('\n🎉 Fresh database setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log('═'.repeat(60));
    console.log('✅ Database cleaned up');
    console.log('✅ Admin user created');
    console.log('✅ All settings configured');
    console.log('✅ Application ready for use');
    
    console.log('\n🔑 Admin Login Credentials:');
    console.log('   Email: admin@localpro.asia');
    console.log('   Password: P@$$w0rd2025!');
    
    console.log('\n⚠️  Next Steps:');
    console.log('   1. Start your application');
    console.log('   2. Login with admin credentials');
    console.log('   3. Change the default password');
    console.log('   4. Configure additional settings as needed');
    console.log('   5. Create additional employee accounts');

  } catch (error) {
    console.error('💥 Fresh database setup failed:', error);
    throw error;
  }
}

// Run the master setup script
setupFreshDatabase()
  .then(() => {
    console.log('\n✨ Master setup script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Master setup script failed:', error);
    process.exit(1);
  });
