require('dotenv').config();
const { MongoClient } = require('mongodb');

async function testNativeConnection() {
    try {
        console.log('Testing native MongoDB connection...');
        
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/group-order-system';
        console.log('Connecting to:', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
        
        const client = new MongoClient(uri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 10000,
            connectTimeoutMS: 5000,
            maxPoolSize: 1,
            retryWrites: false,
            family: 4
        });

        await client.connect();
        console.log('✅ Connected successfully');

        const db = client.db();
        
        // Test basic operations
        const collections = await db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));
        
        // Test users collection
        const usersCollection = db.collection('users');
        const userCount = await usersCollection.countDocuments();
        console.log('Users in database:', userCount);
        
        if (userCount > 0) {
            const sampleUser = await usersCollection.findOne({}, { projection: { username: 1, name: 1 } });
            console.log('Sample user:', sampleUser);
        }
        
        await client.close();
        console.log('✅ Connection test completed successfully');
        
    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        console.error('Error details:', error);
    }
}

testNativeConnection();
