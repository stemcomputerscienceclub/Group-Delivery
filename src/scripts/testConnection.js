require('dotenv').config();
const mongoose = require('mongoose');

const mongoConfig = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferMaxEntries: 0,
    bufferCommands: false,
    maxPoolSize: 10,
    minPoolSize: 5,
    maxIdleTimeMS: 30000,
    family: 4
};

async function testConnection() {
    try {
        console.log('Testing MongoDB connection...');
        console.log('URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/group-order-system');
        
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/group-order-system', mongoConfig);
        console.log('✅ Successfully connected to MongoDB');
        
        // Test basic operations
        const db = mongoose.connection.db;
        
        // Test ping
        await db.admin().ping();
        console.log('✅ Database ping successful');
        
        // Test collections
        const collections = await db.listCollections().toArray();
        console.log('✅ Available collections:', collections.map(c => c.name));
        
        // Test user query (similar to login)
        const User = require('../models/User');
        const userCount = await User.countDocuments();
        console.log('✅ User collection accessible, total users:', userCount);
        
        console.log('✅ All database tests passed!');
        
    } catch (error) {
        console.error('❌ Database connection test failed:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        
        if (error.name === 'MongoServerSelectionError') {
            console.error('This usually means:');
            console.error('- MongoDB server is not running');
            console.error('- Connection string is incorrect');
            console.error('- Network connectivity issues');
            console.error('- Firewall blocking the connection');
        }
        
        if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
            console.error('This usually means:');
            console.error('- MongoDB connection is unstable');
            console.error('- Network latency is too high');
            console.error('- MongoDB server is overloaded');
        }
    } finally {
        await mongoose.connection.close();
        console.log('Connection closed');
        process.exit(0);
    }
}

testConnection();
