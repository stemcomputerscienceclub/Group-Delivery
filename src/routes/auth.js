const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Login page
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/items');
    }
    res.render('login', { error: null });
});

// Login process
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.render('login', { error: 'Username and password are required' });
        }

        // Find user with timeout handling
        const user = await User.findOne({ username }).timeout(10000); // 10 second timeout
        
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
            preferences: user.preferences
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
        
        // Handle specific MongoDB timeout errors
        if (err.name === 'MongooseError' && err.message.includes('buffering timed out')) {
            return res.render('login', { error: 'Database connection timeout. Please try again.' });
        }
        
        if (err.name === 'MongoTimeoutError' || err.message.includes('timeout')) {
            return res.render('login', { error: 'Database timeout. Please try again.' });
        }
        
        res.render('login', { error: 'An error occurred during login. Please try again.' });
    }
});



// Update theme preference
router.post('/preferences/theme', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const { theme } = req.body;
        if (!['light', 'dark', 'system'].includes(theme)) {
            return res.status(400).json({ error: 'Invalid theme' });
        }

        // Update user preferences with timeout
        const user = await User.findById(req.session.user.id).timeout(10000);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.preferences.theme = theme;
        await user.save();

        // Update session
        req.session.user.preferences = user.preferences;
        
        // Save session before sending response
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ error: 'Error saving preferences' });
            }
            res.json({ success: true, theme });
        });
    } catch (err) {
        console.error('Theme update error:', err);
        
        // Handle specific MongoDB timeout errors
        if (err.name === 'MongooseError' && err.message.includes('buffering timed out')) {
            return res.status(500).json({ error: 'Database connection timeout. Please try again.' });
        }
        
        if (err.name === 'MongoTimeoutError' || err.message.includes('timeout')) {
            return res.status(500).json({ error: 'Database timeout. Please try again.' });
        }
        
        res.status(500).json({ error: 'An error occurred while updating theme' });
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