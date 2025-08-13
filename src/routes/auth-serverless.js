const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');

const router = express.Router();

// Simple MongoDB connection for serverless
async function connectMongoDB() {
    if (mongoose.connection.readyState === 1) {
        return;
    }

    const options = {
        serverSelectionTimeoutMS: 2000,
        socketTimeoutMS: 5000,
        bufferMaxEntries: 0,
        bufferCommands: false,
        maxPoolSize: 1,
        retryWrites: false
    };

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/group-order-system', options);
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

// Login process
router.post('/login', async (req, res) => {
    let connectionMade = false;
    
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.render('login', { error: 'Username and password are required' });
        }

        // Connect to MongoDB for this request
        await connectMongoDB();
        connectionMade = true;

        // Find user with short timeout
        const user = await User.findOne({ username }).maxTimeMS(3000);
        
        if (!user) {
            return res.render('login', { error: 'Invalid credentials' });
        }

        // Verify password
        const isValid = await user.comparePassword(password);
        
        if (!isValid) {
            return res.render('login', { error: 'Invalid credentials' });
        }

        // Set session data
        req.session.user = {
            id: user._id,
            username: user.username,
            name: user.name,
            phoneNumber: user.phoneNumber,
            roomNumber: user.roomNumber,
            isAdmin: user.isAdmin,
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
    } finally {
        // Close connection after request in serverless environment
        if (connectionMade && process.env.NODE_ENV === 'production') {
            setTimeout(() => {
                mongoose.connection.close().catch(console.error);
            }, 100);
        }
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

// Update theme preference
router.post('/preferences/theme', async (req, res) => {
    let connectionMade = false;
    
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const { theme } = req.body;
        if (!['light', 'dark', 'system'].includes(theme)) {
            return res.status(400).json({ error: 'Invalid theme' });
        }

        // Connect to MongoDB for this request
        await connectMongoDB();
        connectionMade = true;

        // Update user preferences
        const user = await User.findById(req.session.user.id).maxTimeMS(3000);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.preferences = user.preferences || {};
        user.preferences.theme = theme;
        await user.save();

        // Update session
        req.session.user.preferences = user.preferences;
        
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
    } finally {
        // Close connection after request in serverless environment
        if (connectionMade && process.env.NODE_ENV === 'production') {
            setTimeout(() => {
                mongoose.connection.close().catch(console.error);
            }, 100);
        }
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

module.exports = router;
