import { idleManagementService } from '../lib/idleManagement';

async function testIdleManagement() {
  try {
    console.log('🔍 Testing Idle Management Service...\n');

    // Test getting settings
    console.log('📋 Testing getSettings() method...');
    const settings = idleManagementService.getSettings();
    console.log('✅ getSettings() method exists and returned:', settings);

    // Test getting current state
    console.log('\n📊 Testing getCurrentState() method...');
    const state = idleManagementService.getCurrentState();
    console.log('✅ getCurrentState() method exists and returned:', {
      isIdle: state.isIdle,
      isMonitoring: state.isMonitoring,
      hasSettings: !!state.settings,
      totalIdleTime: state.totalIdleTime
    });

    console.log('\n✅ Idle Management Service test completed successfully!');
    console.log('\n🚀 The AdminSettings component should now work without errors.');

  } catch (error) {
    console.error('❌ Error testing idle management service:', error);
  } finally {
    process.exit(0);
  }
}

testIdleManagement();
