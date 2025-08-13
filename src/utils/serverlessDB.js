const mongoose = require('mongoose');

// Serverless-first MongoDB connection utility
class ServerlessMongoDB {
    constructor() {
        this.isConnected = false;
        this.connection = null;
    }

    async connect() {
        if (this.isConnected && mongoose.connection.readyState === 1) {
            return this.connection;
        }

        try {
            const mongoConfig = {
                serverSelectionTimeoutMS: 2000,
                socketTimeoutMS: 8000,
                connectTimeoutMS: 2000,
                bufferMaxEntries: 0,
                bufferCommands: false,
                maxPoolSize: 1, // Single connection for serverless
                minPoolSize: 0,
                maxIdleTimeMS: 3000,
                family: 4,
                retryWrites: false,
                retryReads: false
            };

            // Disconnect first if partially connected
            if (mongoose.connection.readyState !== 0) {
                await mongoose.disconnect();
            }

            this.connection = await mongoose.connect(
                process.env.MONGODB_URI || 'mongodb://localhost:27017/group-order-system', 
                mongoConfig
            );
            
            this.isConnected = true;
            console.log('✅ MongoDB connected');
            return this.connection;
        } catch (error) {
            this.isConnected = false;
            console.error('❌ MongoDB connection failed:', error.message);
            throw error;
        }
    }

    async disconnect() {
        if (this.isConnected) {
            await mongoose.disconnect();
            this.isConnected = false;
            console.log('MongoDB disconnected');
        }
    }

    getReadyState() {
        return mongoose.connection.readyState;
    }
}

const serverlessDB = new ServerlessMongoDB();

module.exports = { serverlessDB };
