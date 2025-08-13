const { MongoClient, ObjectId } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/group-order-system';
    
    const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        maxPoolSize: 10,
        minPoolSize: 1,
        maxIdleTimeMS: 30000,
        retryWrites: true,
        retryReads: true,
        useUnifiedTopology: true
    });

    await client.connect();
    const db = client.db();

    cachedClient = client;
    cachedDb = db;

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
