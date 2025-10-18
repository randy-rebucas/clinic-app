/**
 * Complete Database Setup Script
 * This script performs a complete fresh setup of the database:
 * 1. Cleans up all existing data
 * 2. Creates admin user with basic settings
 * 
 * Run with: npx tsx scripts/setup-complete.ts
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

async function setupCompleteDatabase(): Promise<void> {
  try {
    console.log('🚀 Starting complete database setup...');
    console.log('This will clean up all existing data and create a fresh setup.');
    console.log('═'.repeat(80));

    // Step 1: Clean up database
    await runScript('scripts/database-cleanup.ts', 'Database cleanup');

    // Step 2: Setup simple admin
    await runScript('scripts/setup-simple-admin.ts', 'Simple admin setup');

    console.log('\n🎉 Complete database setup finished successfully!');
    console.log('\n📋 Summary:');
    console.log('═'.repeat(60));
    console.log('✅ Database cleaned up');
    console.log('✅ Admin user created');
    console.log('✅ Basic settings configured');
    console.log('✅ Application ready for use');
    
    console.log('\n🔑 Admin Login Credentials:');
    console.log('   Email: admin@localpro.asia');
    console.log('   Password: P@$$w0rd2025!');
    
    console.log('\n⚠️  Next Steps:');
    console.log('   1. Start your application');
    console.log('   2. Login with admin credentials');
    console.log('   3. Change the default password');
    console.log('   4. Configure additional tracking settings as needed');
    console.log('   5. Create additional employee accounts');
    
    console.log('\n📝 Available Scripts:');
    console.log('   • npx tsx scripts/database-cleanup.ts - Clean database');
    console.log('   • npx tsx scripts/setup-simple-admin.ts - Create admin user');
    console.log('   • npx tsx scripts/setup-complete.ts - Full setup (this script)');

  } catch (error) {
    console.error('💥 Complete database setup failed:', error);
    throw error;
  }
}

// Run the complete setup script
setupCompleteDatabase()
  .then(() => {
    console.log('\n✨ Complete setup script finished successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Complete setup script failed:', error);
    process.exit(1);
  });
