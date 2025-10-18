/**
 * Check Database Data Script
 * This script checks what data exists in the database
 * 
 * Run with: npx tsx scripts/check-database-data.ts
 */

import { getAllEmployees, getTimeEntries } from '../lib/database';

async function checkDatabaseData(): Promise<void> {
  try {
    console.log('🔍 Checking database data...\n');

    // Check employees
    const { employees, total: totalEmployees } = await getAllEmployees(0, 100);
    console.log(`📊 Total Employees: ${totalEmployees}`);
    
    if (employees.length > 0) {
      console.log('\n👥 Employees:');
      employees.forEach((employee, index) => {
        console.log(`  ${index + 1}. ${employee.name} (${employee.email}) - ${employee.role}`);
      });

      // Check time entries for each employee
      console.log('\n⏰ Time Entries:');
      for (const employee of employees.slice(0, 5)) { // Check first 5 employees
        const { timeEntries, total } = await getTimeEntries(employee._id.toString(), undefined, undefined, 0, 10);
        console.log(`  ${employee.name}: ${total} entries`);
        
        if (timeEntries.length > 0) {
          console.log(`    Recent entries:`);
          timeEntries.slice(0, 3).forEach(entry => {
            console.log(`      - ${entry.type} at ${new Date(entry.timestamp).toLocaleString()}`);
          });
        }
      }
    } else {
      console.log('⚠️  No employees found in database');
    }

    console.log('\n✅ Database check completed');

  } catch (error) {
    console.error('❌ Error checking database data:', error);
    throw error;
  }
}

// Run the script
checkDatabaseData()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
