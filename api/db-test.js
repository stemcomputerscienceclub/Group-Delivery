const { connectToDatabase } = require('../lib/db');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        console.log('Testing database connection...');
        const { db } = await connectToDatabase();
        
        // Simple ping test
        await db.admin().ping();
        console.log('Database ping successful');
        
        // Count users collection
        const usersCount = await db.collection('users').countDocuments();
        console.log('Users count:', usersCount);

        res.status(200).json({
            success: true,
            message: 'Database connection successful',
            version: '2.0-pure-serverless',
            database: {
                connected: true,
                usersCount: usersCount
            },
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        console.error('Database test error:', error);
        res.status(500).json({
            success: false,
            error: 'Database connection failed',
            message: error.message,
            version: '2.0-pure-serverless',
            timestamp: new Date().toISOString()
        });
    }
};
