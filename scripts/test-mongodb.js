const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://admin_db_user:yVpOf6aRwMFMkwsI@master.e2kwbyc.mongodb.net/localpro-time-tracker?retryWrites=true&w=majority&appName=Master';

async function testConnection() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test basic operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📋 Available collections:', collections.map(c => c.name));
    
    // Test creating a simple document
    const testSchema = new mongoose.Schema({
      name: String,
      createdAt: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('TestConnection', testSchema);
    
    const testDoc = new TestModel({ name: 'MongoDB Test' });
    await testDoc.save();
    console.log('✅ Successfully created test document:', testDoc._id);
    
    // Clean up test document
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('✅ Test document cleaned up');
    
    console.log('🎉 MongoDB connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testConnection();
