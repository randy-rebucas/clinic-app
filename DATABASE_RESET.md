# Database Reset Functionality

This document describes the comprehensive database reset functionality implemented in the MediNext clinic application.

## Overview

The database reset functionality allows administrators to completely or selectively reset the application database. This is useful for:
- Development and testing environments
- Clearing corrupted data
- Starting fresh with a clean database
- Selective cleanup of specific data types

## Features

### 1. Complete Database Reset
- Deletes ALL data from ALL collections
- Recreates the application with fresh seed data
- Includes safety confirmations to prevent accidental data loss

### 2. Selective Collection Reset
- Reset specific collections only
- Useful for clearing specific data types (e.g., only appointments, only patients)
- Maintains data integrity by respecting foreign key relationships

### 3. Database Statistics
- View current database statistics
- Monitor data counts across all collections
- Track reset operations

## API Endpoints

### 1. Setup API (`/api/setup`)

#### GET - Check Setup Status
```bash
curl -X GET http://localhost:3000/api/setup
```

#### POST - Reset Application
```bash
curl -X POST http://localhost:3000/api/setup \
  -H "Content-Type: application/json" \
  -d '{"action": "reset"}'
```

### 2. Admin Reset API (`/api/admin/reset-database`)

#### GET - Database Statistics
```bash
curl -X GET http://localhost:3000/api/admin/reset-database
```

#### POST - Reset Database
```bash
# Full reset (database + recreate application)
curl -X POST http://localhost:3000/api/admin/reset-database \
  -H "Content-Type: application/json" \
  -d '{"action": "full-reset", "confirmReset": true}'

# Database only reset
curl -X POST http://localhost:3000/api/admin/reset-database \
  -H "Content-Type: application/json" \
  -d '{"action": "database-only", "confirmReset": true}'

# Reset specific collections
curl -X POST http://localhost:3000/api/admin/reset-database \
  -H "Content-Type: application/json" \
  -d '{"action": "specific-collections", "collections": ["appointments", "patients"], "confirmReset": true}'

# Reset single collection
curl -X POST http://localhost:3000/api/admin/reset-database \
  -H "Content-Type: application/json" \
  -d '{"action": "single-collection", "collections": ["users"], "confirmReset": true}'
```

#### DELETE - Force Reset
```bash
curl -X DELETE http://localhost:3000/api/admin/reset-database \
  -H "Content-Type: application/json" \
  -d '{"force": true}'
```

## Available Collections

The following collections can be reset:

- `users` - All user accounts (admin, doctors, patients, etc.)
- `patients` - Patient records
- `appointments` - Appointment data
- `prescriptions` - Prescription records
- `queues` - Queue entries
- `invoices` - Billing invoices
- `payments` - Payment records
- `laborders` - Lab test orders
- `deliveries` - Delivery records
- `applicationsettings` - Application configuration
- `auditlogs` - Audit trail logs

## Safety Features

### 1. Multiple Confirmations
- Browser confirmation dialog with detailed warning
- Typing confirmation requirement ("DELETE ALL DATA")
- API-level confirmation parameters

### 2. Data Integrity
- Collections are deleted in the correct order to respect foreign key relationships
- Index cleanup to ensure clean database state
- Comprehensive error handling and rollback capabilities

### 3. Logging and Monitoring
- Detailed logging of all reset operations
- Statistics tracking before and after reset
- Error reporting and recovery

## Usage Examples

### 1. Development Environment Reset
```javascript
// Reset everything and recreate with seed data
const response = await fetch('/api/setup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'reset' })
});
```

### 2. Clear Only Patient Data
```javascript
// Reset only patient-related collections
const response = await fetch('/api/admin/reset-database', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'specific-collections',
    collections: ['patients', 'appointments', 'prescriptions'],
    confirmReset: true
  })
});
```

### 3. Check Database Status
```javascript
// Get current database statistics
const response = await fetch('/api/admin/reset-database');
const stats = await response.json();
console.log('Database stats:', stats.data.stats);
```

## Web Interface

The setup page (`/setup`) provides a user-friendly interface for database reset:

1. **Check Status** - View current database statistics
2. **Reset Database** - Complete database reset with confirmations
3. **Setup Application** - Initial application setup

### Reset Button Features
- Prominent red styling to indicate danger
- Multiple confirmation dialogs
- Loading states during reset operations
- Detailed result reporting

## Testing

Test scripts are available to verify reset functionality:

### Option 1: Using npm scripts (recommended)
```bash
# Test using CommonJS version
npm run test:reset

# Test using ES modules version
npm run test:reset:esm
```

### Option 2: Direct execution
```bash
# CommonJS version
node scripts/test-reset.js

# ES modules version (requires node-fetch)
node scripts/test-reset-simple.mjs
```

### Prerequisites for testing:
1. **Start the application**: `npm run dev`
2. **Install node-fetch** (for ES modules version): `npm install node-fetch`
3. **Ensure database connection**: Make sure MongoDB is running and accessible

### What the test script does:
1. Gets initial database statistics
2. Performs a database-only reset (doesn't recreate application)
3. Verifies the database is empty
4. Reports success/failure with detailed information

### Manual Testing via Web Interface:
1. Navigate to `http://localhost:3000/setup`
2. Click "Check Status" to see current database statistics
3. Click "⚠️ Reset Database" to perform a complete reset
4. Follow the confirmation dialogs
5. Verify the reset was successful

## Production Considerations

⚠️ **WARNING**: Database reset functionality should be used with extreme caution in production environments:

1. **Backup First**: Always create a backup before performing any reset operation
2. **Access Control**: Restrict reset functionality to authorized administrators only
3. **Audit Logging**: All reset operations are logged for security and compliance
4. **Data Recovery**: Consider implementing data recovery procedures
5. **Staging Environment**: Test reset operations in staging before production

## Error Handling

The reset functionality includes comprehensive error handling:

- Database connection errors
- Collection deletion failures
- Foreign key constraint violations
- Network timeouts
- Permission errors

All errors are logged and reported back to the user with detailed error messages.

## Monitoring and Alerts

Consider implementing monitoring for:
- Reset operation frequency
- Large data deletions
- Failed reset attempts
- Database performance impact

## Security Considerations

1. **Authentication**: Ensure only authorized users can perform resets
2. **Authorization**: Implement role-based access control
3. **Audit Trail**: Log all reset operations with user identification
4. **Rate Limiting**: Prevent rapid successive reset operations
5. **IP Restrictions**: Limit reset operations to specific IP addresses if needed

## Troubleshooting

### Common Issues

1. **Reset Fails**: Check database connection and permissions
2. **Partial Reset**: Some collections may fail to delete due to constraints
3. **Performance**: Large databases may take time to reset
4. **Memory Issues**: Monitor memory usage during reset operations

### Recovery Procedures

1. **Backup Restoration**: Restore from the most recent backup
2. **Selective Recovery**: Restore specific collections if needed
3. **Data Validation**: Verify data integrity after recovery
4. **Application Restart**: Restart the application after recovery

## Support

For issues with database reset functionality:
1. Check the application logs for detailed error messages
2. Verify database connectivity and permissions
3. Review the audit logs for operation history
4. Contact the development team with specific error details
