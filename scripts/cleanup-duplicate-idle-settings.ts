#!/usr/bin/env tsx

/**
 * Script to clean up duplicate idle settings in the database
 * This script removes duplicate entries and keeps only the most recent one
 */

import connectDB from '../lib/mongodb';
import { IdleSettings } from '../lib/models/IdleSettings';
import mongoose from 'mongoose';

async function cleanupDuplicateIdleSettings() {
  try {
    console.log('🔍 Connecting to database...');
    await connectDB();
    
    console.log('🔍 Finding duplicate idle settings...');
    
    // Find all idle settings grouped by employeeId
    const duplicates = await IdleSettings.aggregate([
      {
        $group: {
          _id: '$employeeId',
          count: { $sum: 1 },
          docs: { $push: '$$ROOT' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicate idle settings found!');
      return;
    }
    
    console.log(`🔍 Found ${duplicates.length} employees with duplicate idle settings`);
    
    let totalRemoved = 0;
    
    for (const duplicate of duplicates) {
      const { _id: employeeId, docs } = duplicate;
      console.log(`\n📋 Processing employee: ${employeeId}`);
      console.log(`   Found ${docs.length} duplicate settings`);
      
      // Sort by creation date (keep the most recent)
      const sortedDocs = docs.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Keep the first (most recent) and remove the rest
      const toKeep = sortedDocs[0];
      const toRemove = sortedDocs.slice(1);
      
      console.log(`   Keeping settings created at: ${toKeep.createdAt}`);
      
      for (const doc of toRemove) {
        console.log(`   Removing settings created at: ${doc.createdAt}`);
        await IdleSettings.findByIdAndDelete(doc._id);
        totalRemoved++;
      }
    }
    
    console.log(`\n✅ Cleanup completed!`);
    console.log(`   Removed ${totalRemoved} duplicate idle settings`);
    console.log(`   Kept the most recent settings for each employee`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Only run in development
if (process.env.NODE_ENV === 'production') {
  console.error('❌ This script can only be run in development mode');
  process.exit(1);
}

cleanupDuplicateIdleSettings();
