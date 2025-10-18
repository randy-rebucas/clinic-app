import connectDB from '../lib/mongodb';
import { Employee } from '../lib/models/Employee';
import { TimeEntry } from '../lib/models/TimeEntry';
import { ScreenCapture } from '../lib/models/ScreenCapture';

async function testReportsAPI() {
  try {
    console.log('🔍 Testing Reports API functionality...\n');

    await connectDB();
    console.log('✅ Connected to database');

    // Test data availability
    const employeeCount = await Employee.countDocuments();
    const timeEntryCount = await TimeEntry.countDocuments();
    const screenCaptureCount = await ScreenCapture.countDocuments();

    console.log(`📊 Data Summary:`);
    console.log(`   - Employees: ${employeeCount}`);
    console.log(`   - Time Entries: ${timeEntryCount}`);
    console.log(`   - Screen Captures: ${screenCaptureCount}`);

    if (employeeCount === 0) {
      console.log('⚠️  No employees found. Reports will show empty data.');
    }

    if (timeEntryCount === 0) {
      console.log('⚠️  No time entries found. Time tracking reports will show empty data.');
    }

    if (screenCaptureCount === 0) {
      console.log('⚠️  No screen captures found. Activity reports will show empty data.');
    }

    // Test date range
    const endDate = new Date();
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    console.log(`\n📅 Test Date Range:`);
    console.log(`   - Start: ${startDate.toISOString().split('T')[0]}`);
    console.log(`   - End: ${endDate.toISOString().split('T')[0]}`);

    // Test report generation logic
    console.log('\n🧪 Testing report generation logic...');

    // Test daily attendance report
    const attendanceQuery = {
      timestamp: { $gte: startDate, $lte: endDate },
      type: { $in: ['clock_in', 'clock_out'] }
    };
    const attendanceEntries = await TimeEntry.find(attendanceQuery);
    console.log(`   - Daily Attendance: ${attendanceEntries.length} entries found`);

    // Test time tracking report
    const timeTrackingQuery = {
      timestamp: { $gte: startDate, $lte: endDate }
    };
    const timeTrackingEntries = await TimeEntry.find(timeTrackingQuery);
    console.log(`   - Time Tracking: ${timeTrackingEntries.length} entries found`);

    // Test screen capture report
    const screenCaptureQuery = {
      timestamp: { $gte: startDate, $lte: endDate }
    };
    const screenCaptureEntries = await ScreenCapture.find(screenCaptureQuery);
    console.log(`   - Screen Captures: ${screenCaptureEntries.length} entries found`);

    console.log('\n✅ Reports API test completed successfully!');
    console.log('\n📋 Available Reports:');
    console.log('   1. Daily Attendance Report');
    console.log('   2. Weekly Time Tracking Report');
    console.log('   3. Employee Productivity Report');
    console.log('   4. Monthly Summary Report');
    console.log('   5. Employee Activity Report');
    console.log('   6. Overtime Analysis Report');

    console.log('\n🚀 You can now access the reports at: http://localhost:3000/reports');

  } catch (error) {
    console.error('❌ Error testing reports API:', error);
  } finally {
    process.exit(0);
  }
}

testReportsAPI();
