import connectDB from '../lib/mongodb';
import { Employee } from '../lib/models/Employee';
import { generateEmployeeId, generateSimpleEmployeeId } from '../lib/employeeIdGenerator';

async function generateEmployeeIdsForExistingEmployees() {
  try {
    console.log('🔗 Connecting to database...');
    await connectDB();
    
    console.log('📋 Fetching employees without employee IDs...');
    const employeesWithoutIds = await (Employee as any).find({ 
      employeeId: { $exists: false } 
    });
    
    console.log(`Found ${employeesWithoutIds.length} employees without employee IDs`);
    
    if (employeesWithoutIds.length === 0) {
      console.log('✅ All employees already have employee IDs!');
      return;
    }
    
    console.log('🔄 Generating employee IDs...');
    
    for (const employee of employeesWithoutIds) {
      try {
        let newEmployeeId: string;
        
        // Generate ID based on department if available
        if (employee.department) {
          newEmployeeId = await generateEmployeeId(employee.department);
        } else {
          newEmployeeId = await generateSimpleEmployeeId();
        }
        
        // Update employee with new ID
        await (Employee as any).findByIdAndUpdate(employee._id, { 
          employeeId: newEmployeeId 
        });
        
        console.log(`✅ Generated ID for ${employee.name} (${employee.email}): ${newEmployeeId}`);
        
      } catch (error) {
        console.error(`❌ Failed to generate ID for ${employee.name} (${employee.email}):`, error);
      }
    }
    
    console.log('🎉 Employee ID generation completed!');
    
    // Show summary
    const totalEmployees = await Employee.countDocuments();
    const employeesWithIds = await Employee.countDocuments({ 
      employeeId: { $exists: true } 
    });
    
    console.log('\n📊 Summary:');
    console.log(`Total employees: ${totalEmployees}`);
    console.log(`Employees with IDs: ${employeesWithIds}`);
    console.log(`Employees without IDs: ${totalEmployees - employeesWithIds}`);
    
  } catch (error) {
    console.error('❌ Error generating employee IDs:', error);
  } finally {
    process.exit(0);
  }
}

// Run the migration
generateEmployeeIdsForExistingEmployees();
