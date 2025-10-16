/**
 * Data Migration Script
 * Migrates data from Firestore to MongoDB
 * 
 * Note: This is a template script. You'll need to adapt it based on your
 * existing Firestore data structure and implement the actual Firestore
 * data retrieval logic.
 */

const mongoose = require('mongoose');
const { MONGODB_URI } = require('../lib/config');

// Import your models
const { Employee, TimeEntry, WorkSession, BreakSession } = require('../lib/models');

async function migrateData() {
  try {
    console.log('Starting data migration...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Example migration functions
    await migrateEmployees();
    await migrateTimeEntries();
    await migrateWorkSessions();
    await migrateBreakSessions();
    
    console.log('🎉 Data migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

async function migrateEmployees() {
  console.log('Migrating employees...');
  
  // TODO: Replace with actual Firestore data retrieval
  const firestoreEmployees = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'employee',
      department: 'Engineering',
      position: 'Developer'
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'admin',
      department: 'Management',
      position: 'Manager'
    }
  ];
  
  for (const empData of firestoreEmployees) {
    try {
      const employee = new Employee(empData);
      await employee.save();
      console.log(`✅ Migrated employee: ${empData.name}`);
    } catch (error) {
      if (error.code === 11000) {
        console.log(`⚠️  Employee already exists: ${empData.email}`);
      } else {
        console.error(`❌ Failed to migrate employee ${empData.name}:`, error.message);
      }
    }
  }
}

async function migrateTimeEntries() {
  console.log('Migrating time entries...');
  
  // TODO: Replace with actual Firestore data retrieval
  const firestoreTimeEntries = [
    {
      employeeId: 'employee_id_here', // Replace with actual ObjectId
      type: 'clock_in',
      timestamp: new Date(),
      notes: 'Starting work day',
      location: 'Office'
    }
  ];
  
  for (const entryData of firestoreTimeEntries) {
    try {
      const timeEntry = new TimeEntry(entryData);
      await timeEntry.save();
      console.log(`✅ Migrated time entry: ${entryData.type}`);
    } catch (error) {
      console.error(`❌ Failed to migrate time entry:`, error.message);
    }
  }
}

async function migrateWorkSessions() {
  console.log('Migrating work sessions...');
  
  // TODO: Replace with actual Firestore data retrieval
  const firestoreWorkSessions = [
    {
      employeeId: 'employee_id_here', // Replace with actual ObjectId
      clockInTime: new Date(),
      totalBreakTime: 30,
      totalWorkTime: 480,
      status: 'completed'
    }
  ];
  
  for (const sessionData of firestoreWorkSessions) {
    try {
      const workSession = new WorkSession(sessionData);
      await workSession.save();
      console.log(`✅ Migrated work session: ${sessionData.status}`);
    } catch (error) {
      console.error(`❌ Failed to migrate work session:`, error.message);
    }
  }
}

async function migrateBreakSessions() {
  console.log('Migrating break sessions...');
  
  // TODO: Replace with actual Firestore data retrieval
  const firestoreBreakSessions = [
    {
      workSessionId: 'work_session_id_here', // Replace with actual ObjectId
      startTime: new Date(),
      endTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes later
      duration: 30,
      status: 'completed',
      notes: 'Lunch break'
    }
  ];
  
  for (const breakData of firestoreBreakSessions) {
    try {
      const breakSession = new BreakSession(breakData);
      await breakSession.save();
      console.log(`✅ Migrated break session: ${breakData.duration} minutes`);
    } catch (error) {
      console.error(`❌ Failed to migrate break session:`, error.message);
    }
  }
}

// Utility function to convert Firestore timestamps to Date objects
function convertFirestoreTimestamp(timestamp) {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
}

// Utility function to convert Firestore document to plain object
function firestoreDocToObject(doc) {
  return {
    id: doc.id,
    ...doc.data()
  };
}

// Run migration if called directly
if (require.main === module) {
  migrateData();
}

module.exports = { migrateData };
