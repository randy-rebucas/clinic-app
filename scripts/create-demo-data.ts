/**
 * Create Demo Data Script
 * This script creates demo employees and time entries for testing the admin dashboard
 * 
 * Run with: npx tsx scripts/create-demo-data.ts
 */

import { createEmployee, createTimeEntry } from '../lib/database';
import { Types } from 'mongoose';

const demoEmployees = [
  {
    name: 'John Doe',
    email: 'john.doe@localpro.asia',
    password: 'password123',
    role: 'employee' as const,
    department: 'Engineering',
    position: 'Software Developer'
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@localpro.asia',
    password: 'password123',
    role: 'employee' as const,
    department: 'Marketing',
    position: 'Marketing Manager'
  },
  {
    name: 'Mike Johnson',
    email: 'mike.johnson@localpro.asia',
    password: 'password123',
    role: 'employee' as const,
    department: 'Sales',
    position: 'Sales Representative'
  },
  {
    name: 'Sarah Wilson',
    email: 'sarah.wilson@localpro.asia',
    password: 'password123',
    role: 'employee' as const,
    department: 'HR',
    position: 'HR Specialist'
  },
  {
    name: 'David Brown',
    email: 'david.brown@localpro.asia',
    password: 'password123',
    role: 'employee' as const,
    department: 'Engineering',
    position: 'Senior Developer'
  }
];

async function createDemoData(): Promise<void> {
  try {
    console.log('🚀 Creating demo data...\n');

    const employeeIds: string[] = [];

    // Create demo employees
    for (const employeeData of demoEmployees) {
      try {
        const employeeId = await createEmployee(employeeData);
        employeeIds.push(employeeId);
        console.log(`✅ Created employee: ${employeeData.name} (${employeeId})`);
      } catch (error: any) {
        if (error.code === 11000) {
          console.log(`⚠️  Employee ${employeeData.name} already exists, skipping...`);
          // Try to get existing employee ID (this would need a getEmployeeByEmail function)
          // For now, we'll skip creating time entries for existing employees
          continue;
        } else {
          throw error;
        }
      }
    }

    if (employeeIds.length === 0) {
      console.log('⚠️  No new employees created, skipping time entry creation...');
      return;
    }

    // Create time entries for today
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0, 0);
    
    for (let i = 0; i < employeeIds.length; i++) {
      const employeeId = employeeIds[i];
      const clockInTime = new Date(startOfDay.getTime() + (i * 30 * 60 * 1000)); // Stagger clock-in times
      
      // Clock in
      await createTimeEntry({
        employeeId: new Types.ObjectId(employeeId),
        type: 'clock_in',
        timestamp: clockInTime,
        notes: 'Morning clock in'
      });

      // Break start (2 hours after clock in)
      const breakStartTime = new Date(clockInTime.getTime() + (2 * 60 * 60 * 1000));
      await createTimeEntry({
        employeeId: new Types.ObjectId(employeeId),
        type: 'break_start',
        timestamp: breakStartTime,
        notes: 'Lunch break'
      });

      // Break end (1 hour later)
      const breakEndTime = new Date(breakStartTime.getTime() + (60 * 60 * 1000));
      await createTimeEntry({
        employeeId: new Types.ObjectId(employeeId),
        type: 'break_end',
        timestamp: breakEndTime,
        notes: 'Back from lunch'
      });

      // Clock out (6 hours after clock in)
      const clockOutTime = new Date(clockInTime.getTime() + (6 * 60 * 60 * 1000));
      await createTimeEntry({
        employeeId: new Types.ObjectId(employeeId),
        type: 'clock_out',
        timestamp: clockOutTime,
        notes: 'End of work day'
      });

      console.log(`✅ Created time entries for employee ${i + 1}`);
    }

    console.log('\n🎉 Demo data creation completed successfully!');
    console.log('\n📋 Summary:');
    console.log('═'.repeat(60));
    console.log(`✅ Created ${employeeIds.length} demo employees`);
    console.log(`✅ Created time entries for today`);
    console.log('\n🔑 Demo Employee Credentials:');
    console.log('   Email: [employee-email]@localpro.asia');
    console.log('   Password: password123');
    console.log('\n⚠️  Next Steps:');
    console.log('   1. Login to admin dashboard');
    console.log('   2. Verify real data is displayed');
    console.log('   3. Test the recent activity feed');

  } catch (error) {
    console.error('❌ Error creating demo data:', error);
    throw error;
  }
}

// Run the script
createDemoData()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
