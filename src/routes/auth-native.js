require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const crypto = require('crypto');

const router = express.Router();

// Direct MongoDB connection (no Mongoose)
let mongoClient = null;

async function getMongoConnection() {
    if (!mongoClient) {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/group-order-system';
        mongoClient = new MongoClient(uri, {
            serverSelectionTimeoutMS: 2000,
            socketTimeoutMS: 5000,
            connectTimeoutMS: 2000,
            maxPoolSize: 1,
            minPoolSize: 0,
            maxIdleTimeMS: 3000,
            retryWrites: false,
            retryReads: false,
            family: 4
        });
        await mongoClient.connect();
    }
    return mongoClient.db();
}

// Simple password hashing (matches User model)
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Login page
router.get('/login', (req, res) => {
    try {
        if (req.session && req.session.user) {
            return res.redirect('/items');
        }
        res.render('login', { error: null });
    } catch (err) {
        console.error('Login page error:', err);
        res.render('login', { error: null });
    }
});

// Login process using native MongoDB driver
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.render('login', { error: 'Username and password are required' });
        }

        // Get direct MongoDB connection
        const db = await getMongoConnection();
        const usersCollection = db.collection('users');

        // Find user directly
        const user = await usersCollection.findOne(
            { username }, 
            { 
                maxTimeMS: 3000,
                projection: { username: 1, password: 1, name: 1, phoneNumber: 1, roomNumber: 1, isAdmin: 1, preferences: 1 }
            }
        );
        
        if (!user) {
            return res.render('login', { error: 'Invalid credentials' });
        }

        // Verify password
        const hashedPassword = hashPassword(password);
        if (user.password !== hashedPassword) {
            return res.render('login', { error: 'Invalid credentials' });
        }

        // Set session data
        req.session.user = {
            id: user._id,
            username: user.username,
            name: user.name,
            phoneNumber: user.phoneNumber,
            roomNumber: user.roomNumber,
            isAdmin: user.isAdmin || false,
            preferences: user.preferences || { theme: 'system' }
        };

        // Save session and redirect
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.render('login', { error: 'Error during login' });
            }
            res.redirect('/items');
        });
        
    } catch (err) {
        console.error('❌ Login error:', err);
        
        // Handle different error types
        if (err.name === 'MongoTimeoutError' || err.message.includes('timeout')) {
            return res.render('login', { error: 'Connection timeout. Please try again.' });
        }
        
        if (err.name === 'MongoServerSelectionError') {
            return res.render('login', { error: 'Database unavailable. Please try again.' });
        }
        
        res.render('login', { error: 'Service temporarily unavailable. Please try again.' });
    }
});

// Get current theme
router.get('/preferences/theme', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    res.json({
        theme: req.session.user.preferences?.theme || 'system'
    });
});

// Update theme preference using native MongoDB driver
router.post('/preferences/theme', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const { theme } = req.body;
        if (!['light', 'dark', 'system'].includes(theme)) {
            return res.status(400).json({ error: 'Invalid theme' });
        }

        // Get direct MongoDB connection
        const db = await getMongoConnection();
        const usersCollection = db.collection('users');

        // Update user preferences directly
        const { ObjectId } = require('mongodb');
        const result = await usersCollection.updateOne(
            { _id: new ObjectId(req.session.user.id) },
            { 
                $set: { 
                    'preferences.theme': theme,
                    updatedAt: new Date()
                }
            },
            { maxTimeMS: 3000 }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update session
        req.session.user.preferences = req.session.user.preferences || {};
        req.session.user.preferences.theme = theme;
        
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ error: 'Error saving preferences' });
            }
            res.json({ success: true, theme });
        });
    } catch (err) {
        console.error('Theme update error:', err);
        res.status(500).json({ error: 'Service temporarily unavailable' });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/login');
    });
});

// Close connection on exit
process.on('SIGINT', async () => {
    if (mongoClient) {
        await mongoClient.close();
        console.log('MongoDB client closed');
    }
});

module.exports = router;
