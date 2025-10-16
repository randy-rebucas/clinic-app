# MongoDB Quick Reference Guide

## Connection
```typescript
import connectDB from './lib/mongodb';
await connectDB(); // Establishes connection with caching
```

## Common Operations

### Employee Management
```typescript
import { createEmployee, getEmployee, updateEmployee } from './lib/database';

// Create employee
const employeeId = await createEmployee({
  name: 'John Doe',
  email: 'john@example.com',
  role: 'employee',
  department: 'Engineering'
});

// Get employee
const employee = await getEmployee(employeeId);

// Update employee
await updateEmployee(employeeId, { department: 'Product' });
```

### Time Tracking
```typescript
import { 
  createTimeEntry, 
  createWorkSession, 
  getActiveWorkSession 
} from './lib/database';

// Clock in
const timeEntryId = await createTimeEntry({
  employeeId: 'employee_id',
  type: 'clock_in',
  timestamp: new Date(),
  notes: 'Starting work day'
});

// Create work session
const sessionId = await createWorkSession({
  employeeId: 'employee_id',
  clockInTime: new Date(),
  totalBreakTime: 0,
  totalWorkTime: 0,
  status: 'active'
});

// Get active session
const activeSession = await getActiveWorkSession('employee_id');
```

### Break Management
```typescript
import { 
  createBreakSession, 
  updateBreakSession, 
  getActiveBreakSession 
} from './lib/database';

// Start break
const breakId = await createBreakSession({
  workSessionId: 'session_id',
  startTime: new Date(),
  status: 'active',
  notes: 'Lunch break'
});

// End break
await updateBreakSession(breakId, {
  endTime: new Date(),
  duration: 30,
  status: 'completed'
});
```

### Activity Tracking
```typescript
import { 
  createApplicationActivity,
  createWebsiteActivity,
  getApplicationActivities 
} from './lib/database';

// Track application usage
await createApplicationActivity({
  employeeId: 'employee_id',
  workSessionId: 'session_id',
  applicationName: 'VS Code',
  windowTitle: 'project.js',
  processName: 'code',
  startTime: new Date(),
  isActive: true,
  category: 'development'
});

// Track website usage
await createWebsiteActivity({
  employeeId: 'employee_id',
  workSessionId: 'session_id',
  domain: 'github.com',
  url: 'https://github.com/user/repo',
  pageTitle: 'Repository',
  startTime: new Date(),
  isActive: true,
  category: 'work',
  productivity: 'productive'
});
```

### Screen Capture
```typescript
import { 
  createScreenCapture,
  getScreenCaptureSettings 
} from './lib/database';

// Save screen capture
await createScreenCapture({
  employeeId: 'employee_id',
  workSessionId: 'session_id',
  timestamp: new Date(),
  imageData: 'base64_image_data',
  thumbnail: 'base64_thumbnail',
  fileSize: 1024000,
  isActive: true
});
```

### Attendance Management
```typescript
import { 
  createAttendanceRecord,
  createPunchRecord,
  getAttendanceRecord 
} from './lib/database';

// Create attendance record
const attendanceId = await createAttendanceRecord({
  employeeId: 'employee_id',
  date: new Date(),
  totalWorkingHours: 8,
  totalBreakTime: 1,
  status: 'present'
});

// Create punch record
await createPunchRecord({
  employeeId: 'employee_id',
  attendanceRecordId: attendanceId,
  punchType: 'in',
  punchTime: new Date(),
  isManual: false
});
```

## Query Examples

### Find Active Work Sessions
```typescript
const activeSessions = await WorkSession.find({ 
  status: 'active' 
}).populate('employeeId', 'name email');
```

### Get Time Entries for Date Range
```typescript
const timeEntries = await TimeEntry.find({
  employeeId: 'employee_id',
  timestamp: {
    $gte: new Date('2024-01-01'),
    $lte: new Date('2024-01-31')
  }
}).sort({ timestamp: -1 });
```

### Aggregate Daily Work Time
```typescript
const dailyWorkTime = await WorkSession.aggregate([
  {
    $match: {
      employeeId: new ObjectId('employee_id'),
      clockInTime: {
        $gte: new Date('2024-01-01'),
        $lte: new Date('2024-01-31')
      }
    }
  },
  {
    $group: {
      _id: null,
      totalWorkTime: { $sum: '$totalWorkTime' },
      totalBreakTime: { $sum: '$totalBreakTime' }
    }
  }
]);
```

### Find Most Used Applications
```typescript
const topApps = await ApplicationActivity.aggregate([
  {
    $match: {
      employeeId: new ObjectId('employee_id'),
      startTime: { $gte: new Date('2024-01-01') }
    }
  },
  {
    $group: {
      _id: '$applicationName',
      totalDuration: { $sum: '$duration' },
      usageCount: { $sum: 1 }
    }
  },
  {
    $sort: { totalDuration: -1 }
  },
  {
    $limit: 10
  }
]);
```

## Error Handling
```typescript
try {
  const result = await createEmployee(employeeData);
  console.log('Employee created:', result);
} catch (error) {
  if (error.code === 11000) {
    console.error('Email already exists');
  } else {
    console.error('Error creating employee:', error.message);
  }
}
```

## Best Practices

1. **Always use ObjectId for references**
2. **Use populate() for related data**
3. **Add proper indexes for queries**
4. **Handle connection errors gracefully**
5. **Use transactions for complex operations**
6. **Validate data before saving**
7. **Use aggregation for complex queries**
8. **Implement proper error handling**
