require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');

const router = express.Router();

// Direct MongoDB connection (no Mongoose) - serverless optimized
let mongoClient = null;

async function getMongoConnection() {
    try {
        if (!mongoClient || mongoClient.topology?.isDestroyed()) {
            console.log('Creating new MongoDB connection...');
            const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/group-order-system';
            mongoClient = new MongoClient(uri, {
                serverSelectionTimeoutMS: 3000,
                socketTimeoutMS: 3000,
                connectTimeoutMS: 3000,
                maxPoolSize: 2,
                minPoolSize: 0,
                maxIdleTimeMS: 10000,
                retryWrites: false,
                retryReads: false
            });
            await mongoClient.connect();
        }
        return mongoClient.db();
    } catch (err) {
        console.error('MongoDB connection error:', err);
        if (mongoClient) {
            try {
                await mongoClient.close();
            } catch (closeErr) {
                console.error('Error closing client:', closeErr);
            }
            mongoClient = null;
        }
        throw err;
    }
}

// Simple password hashing (matches User model)
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Login page
router.get('/login', (req, res) => {
    try {
        if (req.session && req.session.user) {
            return res.redirect('/login-success');
        }
        return renderLoginError(res, null);
    } catch (err) {
        console.error('Login page error:', err);
        return renderLoginError(res, null);
    }
});

// Helper function to render login with error
function renderLoginError(res, errorMessage) {
    return res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Login - OCT Delivery System</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
            <div class="container mt-5">
                <div class="row justify-content-center">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="mb-0">Login</h3>
                            </div>
                            <div class="card-body">
                                ${errorMessage ? `<div class="alert alert-danger">${errorMessage}</div>` : ''}
                                <form method="POST" action="/login">
                                    <div class="mb-3">
                                        <label for="username" class="form-label">Username</label>
                                        <input type="text" class="form-control" id="username" name="username" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="password" class="form-label">Password</label>
                                        <input type="password" class="form-control" id="password" name="password" required>
                                    </div>
                                    <button type="submit" class="btn btn-primary w-100">Login</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
}

// Login process using native MongoDB driver
router.post('/login', async (req, res) => {
    console.log('🚀 Using NATIVE MongoDB driver for login - v3.0 serverless-safe');
    
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return renderLoginError(res, 'Username and password are required');
        }

        // Get direct MongoDB connection
        const database = await getMongoConnection();
        const usersCollection = database.collection('users');

        // Find user directly
        const user = await usersCollection.findOne(
            { username }, 
            { 
                maxTimeMS: 3000,
                projection: { username: 1, password: 1, name: 1, phoneNumber: 1, roomNumber: 1, isAdmin: 1, preferences: 1 }
            }
        );
        
        if (!user) {
            return renderLoginError(res, 'Invalid credentials');
        }

        // Verify password
        const hashedPassword = hashPassword(password);
        if (user.password !== hashedPassword) {
            return renderLoginError(res, 'Invalid credentials');
        }

        // Set session data
        req.session.user = {
            id: user._id.toString(),
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
                return renderLoginError(res, 'Error during login');
            }
            // Redirect to a success page
            res.redirect('/login-success');
        });
        
    } catch (err) {
        console.error('❌ Login error:', err);
        console.error('Stack:', err.stack);
        
        // Handle different error types with safe rendering
        if (err.name === 'MongoTimeoutError' || err.message.includes('timeout')) {
            return renderLoginError(res, 'Connection timeout. Please try again.');
        }
        
        if (err.name === 'MongoServerSelectionError') {
            return renderLoginError(res, 'Database unavailable. Please try again.');
        }
        
        return renderLoginError(res, 'Service temporarily unavailable. Please try again.');
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
        const database = await getMongoConnection();
        const usersCollection = database.collection('users');

        // Update user preferences directly
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

// Login success page
router.get('/login-success', (req, res) => {
    if (!req.session || !req.session.user) {
        return res.redirect('/login');
    }
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Login Successful</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
            <div class="container mt-5">
                <div class="row justify-content-center">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-body text-center">
                                <h1 class="card-title text-success">✅ Login Successful!</h1>
                                <p class="card-text">Welcome back, <strong>${req.session.user.name}</strong>!</p>
                                <p class="text-muted">
                                    The application is currently undergoing database optimizations. 
                                    Full functionality will be restored shortly.
                                </p>
                                <div class="mt-4">
                                    <a href="/logout" class="btn btn-outline-secondary me-2">Logout</a>
                                    <a href="/test" class="btn btn-primary">Server Status</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
});

// Close connection on exit
process.on('SIGINT', async () => {
    if (mongoClient) {
        await mongoClient.close();
        console.log('MongoDB client closed');
    }
});

module.exports = router;