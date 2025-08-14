const { MongoClient, ObjectId } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
    // Always create fresh connections in serverless to avoid stale connections
    if (cachedClient && cachedDb) {
        try {
            // Test if connection is still alive
            await cachedClient.db().admin().ping();
            return { client: cachedClient, db: cachedDb };
        } catch (err) {
            console.log('Cached connection failed, creating new one');
            cachedClient = null;
            cachedDb = null;
        }
    }

    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/group-order-system';
    
    console.log('Creating new MongoDB connection...');
    const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 3000,
        socketTimeoutMS: 3000,
        connectTimeoutMS: 3000,
        maxPoolSize: 5,
        minPoolSize: 0,
        maxIdleTimeMS: 10000,
        retryWrites: true,
        retryReads: false,
        maxConnecting: 2
    });

    await client.connect();
    const db = client.db();

    cachedClient = client;
    cachedDb = db;

    console.log('MongoDB connection established');
    return { client, db };
}

async function closeConnection() {
    if (cachedClient) {
        await cachedClient.close();
        cachedClient = null;
        cachedDb = null;
    }
}

// Collection getters
async function getUsersCollection() {
    const { db } = await connectToDatabase();
    return db.collection('users');
}

async function getRestaurantsCollection() {
    const { db } = await connectToDatabase();
    return db.collection('restaurants');
}

async function getOrdersCollection() {
    const { db } = await connectToDatabase();
    return db.collection('items'); // keeping same name as original
}

// Utility functions
function createObjectId(id) {
    return new ObjectId(id);
}

function isValidObjectId(id) {
    return ObjectId.isValid(id);
}

module.exports = {
    connectToDatabase,
    closeConnection,
    getUsersCollection,
    getRestaurantsCollection,
    getOrdersCollection,
    createObjectId,
    isValidObjectId,
    ObjectId
};
