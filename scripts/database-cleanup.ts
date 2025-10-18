/**
 * Database Cleanup Script
 * This script will clean up the database by removing all existing data
 * and preparing it for a fresh start with initial settings and admin user.
 * 
 * Run with: npx tsx scripts/database-cleanup.ts
 */

import connectDB from '../lib/mongodb';
import { 
  Employee,
  TimeEntry,
  WorkSession,
  BreakSession,
  DailySummary,
  WeeklySummary,
  AttendanceSettings,
  IdleSettings,
  IdleSession,
  ApplicationActivity,
  ApplicationTrackingSettings,
  WebsiteActivity,
  WebsiteTrackingSettings,
  ScreenCapture,
  ScreenCaptureSettings,
  NotificationSettings
} from '../lib/models';

async function cleanupDatabase(): Promise<void> {
  try {
    console.log('🧹 Starting database cleanup...\n');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Get collection counts before cleanup
    const collections = [
      { name: 'employees', model: Employee },
      { name: 'timeentries', model: TimeEntry },
      { name: 'worksessions', model: WorkSession },
      { name: 'breaksessions', model: BreakSession },
      { name: 'dailysummaries', model: DailySummary },
      { name: 'weeklysummaries', model: WeeklySummary },
      { name: 'attendancesettings', model: AttendanceSettings },
      { name: 'idlesettings', model: IdleSettings },
      { name: 'idlesessions', model: IdleSession },
      { name: 'applicationactivities', model: ApplicationActivity },
      { name: 'applicationtrackingsettings', model: ApplicationTrackingSettings },
      { name: 'websiteactivities', model: WebsiteActivity },
      { name: 'websitetrackingsettings', model: WebsiteTrackingSettings },
      { name: 'screencaptures', model: ScreenCapture },
      { name: 'screencapturesettings', model: ScreenCaptureSettings },
      { name: 'notificationsettings', model: NotificationSettings }
    ];

    console.log('\n📊 Current database state:');
    console.log('═'.repeat(50));
    
    let totalRecords = 0;
    for (const collection of collections) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const count = await (collection.model as any).countDocuments();
        console.log(`${collection.name.padEnd(25)}: ${count.toString().padStart(6)} records`);
        totalRecords += count;
      } catch (error) {
        console.log(`${collection.name.padEnd(25)}: Error reading collection`);
      }
    }
    
    console.log('═'.repeat(50));
    console.log(`Total records: ${totalRecords}`);
    
    if (totalRecords === 0) {
      console.log('\n✨ Database is already clean! No cleanup needed.');
      return;
    }

    console.log('\n🗑️  Starting cleanup process...\n');

    // Delete all records from each collection
    for (const collection of collections) {
      try {
        console.log(`Cleaning ${collection.name}...`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (collection.model as any).deleteMany({});
        console.log(`   ✅ Deleted ${result.deletedCount} records from ${collection.name}`);
      } catch (error) {
        console.log(`   ❌ Error cleaning ${collection.name}:`, error);
      }
    }

    console.log('\n🔍 Verifying cleanup...');
    console.log('═'.repeat(50));
    
    let remainingRecords = 0;
    for (const collection of collections) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const count = await (collection.model as any).countDocuments();
        console.log(`${collection.name.padEnd(25)}: ${count.toString().padStart(6)} records`);
        remainingRecords += count;
      } catch (error) {
        console.log(`${collection.name.padEnd(25)}: Error reading collection`);
      }
    }
    
    console.log('═'.repeat(50));
    console.log(`Remaining records: ${remainingRecords}`);

    if (remainingRecords === 0) {
      console.log('\n🎉 Database cleanup completed successfully!');
      console.log('✨ Database is now clean and ready for fresh setup.');
    } else {
      console.log('\n⚠️  Some records may still remain. Please check manually.');
    }

  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
    throw error;
  }
}

// Run the cleanup script
cleanupDatabase()
  .then(() => {
    console.log('\n✨ Cleanup script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Cleanup script failed:', error);
    process.exit(1);
  });
