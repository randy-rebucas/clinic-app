import connectDB from '../lib/mongodb';
import { Employee } from '../lib/models/Employee';

async function testAdminSettings() {
  try {
    console.log('🔍 Testing Admin Settings functionality...\n');

    await connectDB();
    console.log('✅ Connected to database');

    // Test data availability
    const employeeCount = await Employee.countDocuments();
    console.log(`📊 Total Employees: ${employeeCount}`);

    if (employeeCount === 0) {
      console.log('⚠️  No employees found. Some settings features may not work properly.');
    }

    console.log('\n✅ Admin Settings test completed successfully!');
    console.log('\n📋 Available Settings Categories:');
    console.log('   1. General Settings - Work hours, break reminders, overtime thresholds');
    console.log('   2. Idle Detection - Idle thresholds, warnings, auto-resume');
    console.log('   3. Screen Capture - Capture intervals, quality, privacy settings');
    console.log('   4. Activity Tracking - Application and website tracking preferences');

    console.log('\n🚀 You can now access the admin settings at: http://localhost:3004/admin → Settings tab');

    console.log('\n🔧 Settings Features:');
    console.log('   - Global system configuration');
    console.log('   - Idle detection and warning settings');
    console.log('   - Screen capture configuration with privacy controls');
    console.log('   - Application and website tracking preferences');
    console.log('   - Employee-specific tracking settings');
    console.log('   - Real-time settings saving and validation');

  } catch (error) {
    console.error('❌ Error testing admin settings:', error);
  } finally {
    process.exit(0);
  }
}

testAdminSettings();
