/**
 * Test script for database reset functionality
 * Run with: node scripts/test-reset.js
 * 
 * Note: This script tests the API endpoints rather than direct database functions
 * to avoid module system conflicts.
 */

async function testResetFunctionality() {
  console.log('🧪 Testing Database Reset Functionality\n');
  
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
  
  try {
    // Test 1: Get initial database stats
    console.log('1. Getting initial database statistics...');
    const statsResponse = await fetch(`${baseUrl}/api/admin/reset-database`);
    const statsData = await statsResponse.json();
    
    if (!statsData.success) {
      console.error('❌ Failed to get initial database stats:', statsData.message);
      return;
    }
    
    console.log('Initial stats:', statsData.data.stats);
    const totalInitial = Object.values(statsData.data.stats).reduce((sum, count) => sum + count, 0);
    console.log(`Total documents in database: ${totalInitial}\n`);
    
    // Test 2: Perform database reset (database only, not full application reset)
    console.log('2. Performing database reset...');
    const resetResponse = await fetch(`${baseUrl}/api/admin/reset-database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'database-only',
        confirmReset: true
      })
    });
    
    const resetResult = await resetResponse.json();
    console.log('Reset result:', resetResult);
    
    if (!resetResult.success) {
      console.error('❌ Database reset failed:', resetResult.message);
      return;
    }
    
    console.log('✅ Database reset completed successfully');
    console.log('Deleted counts:', resetResult.deletedCounts);
    
    // Test 3: Verify database is empty
    console.log('\n3. Verifying database is empty...');
    const finalStatsResponse = await fetch(`${baseUrl}/api/admin/reset-database`);
    const finalStatsData = await finalStatsResponse.json();
    
    if (!finalStatsData.success) {
      console.error('❌ Failed to get final database stats:', finalStatsData.message);
      return;
    }
    
    console.log('Final stats:', finalStatsData.data.stats);
    const totalFinal = Object.values(finalStatsData.data.stats).reduce((sum, count) => sum + count, 0);
    console.log(`Total documents after reset: ${totalFinal}`);
    
    if (totalFinal === 0) {
      console.log('✅ Database reset verification successful - all data deleted');
    } else {
      console.log('⚠️ Warning: Some data may still exist in the database');
    }
    
    console.log('\n🎉 Database reset functionality test completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    console.log('\n💡 Make sure the application is running on http://localhost:3000');
    console.log('💡 You can start it with: npm run dev');
  }
}

// Run the test
testResetFunctionality().catch(console.error);
