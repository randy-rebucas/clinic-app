const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://admin_db_user:yVpOf6aRwMFMkwsI@master.e2kwbyc.mongodb.net/localpro-time-tracker?retryWrites=true&w=majority&appName=Master';

async function testConnection() {
  let client;
  
  try {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test basic operations
    const db = client.db('localpro-time-tracker');
    const collections = await db.listCollections().toArray();
    console.log('📋 Available collections:', collections.map(c => c.name));
    
    // Test creating a simple document
    const testCollection = db.collection('test_connection');
    const testDoc = {
      name: 'MongoDB Test',
      createdAt: new Date(),
      message: 'Connection test successful!'
    };
    
    const result = await testCollection.insertOne(testDoc);
    console.log('✅ Successfully created test document:', result.insertedId);
    
    // Test reading the document
    const foundDoc = await testCollection.findOne({ _id: result.insertedId });
    console.log('✅ Successfully read test document:', foundDoc.name);
    
    // Clean up test document
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('✅ Test document cleaned up');
    
    console.log('🎉 MongoDB connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('Disconnected from MongoDB');
    }
  }
}

testConnection();
