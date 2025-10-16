const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://admin_db_user:yVpOf6aRwMFMkwsI@master.e2kwbyc.mongodb.net/localpro-time-tracker?retryWrites=true&w=majority&appName=Master';

// Simple Employee schema for testing
const EmployeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['employee', 'admin'],
    default: 'employee',
  },
  department: {
    type: String,
    trim: true,
  },
  position: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

const Employee = mongoose.model('Employee', EmployeeSchema);

async function testModels() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Test creating an employee
    const testEmployee = new Employee({
      name: 'Test Employee',
      email: 'test@example.com',
      role: 'employee',
      department: 'Engineering',
      position: 'Developer'
    });
    
    const savedEmployee = await testEmployee.save();
    console.log('✅ Successfully created employee:', savedEmployee._id);
    
    // Test finding the employee
    const foundEmployee = await Employee.findById(savedEmployee._id);
    console.log('✅ Successfully found employee:', foundEmployee.name);
    
    // Test updating the employee
    foundEmployee.department = 'Product';
    await foundEmployee.save();
    console.log('✅ Successfully updated employee department');
    
    // Test deleting the employee
    await Employee.findByIdAndDelete(savedEmployee._id);
    console.log('✅ Successfully deleted employee');
    
    console.log('🎉 All model tests passed!');
    
  } catch (error) {
    console.error('❌ Model test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testModels();
