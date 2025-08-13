require('dotenv').config();
const express = require('express');
const session = require('express-session');
const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');

const app = express();

console.log('🚀 Starting MINIMAL server - NO MONGOOSE - v4.0');

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration - minimal for serverless
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'temp-secret-key',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        maxAge: 30 * 60 * 1000, // 30 minutes
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    }
};

app.use(session(sessionConfig));

// MongoDB connection for auth only
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

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function renderLoginPage(res, errorMessage = null) {
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
            <div class="text-center mt-3">
                <small class="text-muted">v4.0-minimal-no-mongoose</small>
            </div>
        </body>
        </html>
    `);
}

// Root redirect
app.get('/', (req, res) => {
    try {
        if (req.session && req.session.user) {
            res.redirect('/login-success');
        } else {
            res.redirect('/login');
        }
    } catch (err) {
        console.error('Root route error:', err);
        res.redirect('/login');
    }
});

// Login page
app.get('/login', (req, res) => {
    console.log('📝 Login page request');
    try {
        if (req.session && req.session.user) {
            return res.redirect('/login-success');
        }
        return renderLoginPage(res);
    } catch (err) {
        console.error('Login page error:', err);
        return renderLoginPage(res);
    }
});

// Login process - NATIVE DRIVER ONLY
app.post('/login', async (req, res) => {
    console.log('🔐 Login POST - v4.0-minimal NATIVE driver ONLY');
    
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return renderLoginPage(res, 'Username and password are required');
        }

        console.log('Connecting to database...');
        const database = await getMongoConnection();
        const usersCollection = database.collection('users');

        console.log('Searching for user:', username);
        const user = await usersCollection.findOne(
            { username }, 
            { 
                maxTimeMS: 3000,
                projection: { username: 1, password: 1, name: 1, phoneNumber: 1, roomNumber: 1, isAdmin: 1, preferences: 1 }
            }
        );
        
        if (!user) {
            console.log('User not found');
            return renderLoginPage(res, 'Invalid credentials');
        }

        console.log('Verifying password...');
        const hashedPassword = hashPassword(password);
        if (user.password !== hashedPassword) {
            console.log('Password mismatch');
            return renderLoginPage(res, 'Invalid credentials');
        }

        console.log('Setting session data...');
        req.session.user = {
            id: user._id.toString(),
            username: user.username,
            name: user.name,
            phoneNumber: user.phoneNumber,
            roomNumber: user.roomNumber,
            isAdmin: user.isAdmin || false,
            preferences: user.preferences || { theme: 'system' }
        };

        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return renderLoginPage(res, 'Error during login');
            }
            console.log('✅ Login successful, redirecting...');
            res.redirect('/login-success');
        });
        
    } catch (err) {
        console.error('❌ Login error:', err);
        console.error('Stack:', err.stack);
        
        if (err.name === 'MongoTimeoutError' || err.message.includes('timeout')) {
            return renderLoginPage(res, 'Connection timeout. Please try again.');
        }
        
        if (err.name === 'MongoServerSelectionError') {
            return renderLoginPage(res, 'Database unavailable. Please try again.');
        }
        
        return renderLoginPage(res, 'Service temporarily unavailable. Please try again.');
    }
});

// Login success page
app.get('/login-success', (req, res) => {
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
                                    System is running in maintenance mode with native MongoDB driver.
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
            <div class="text-center mt-3">
                <small class="text-muted">v4.0-minimal-no-mongoose - User: ${req.session.user.username}</small>
            </div>
        </body>
        </html>
    `);
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/login');
    });
});

// Test endpoint
app.get('/test', (req, res) => {
    res.json({ 
        status: 'Server is running',
        version: 'v4.0-minimal-no-mongoose',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        auth: 'native-driver-only',
        sessionActive: !!(req.session && req.session.user)
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        version: 'v4.0-minimal',
        timestamp: new Date().toISOString()
    });
});

// Maintenance mode for all other routes
app.use('*', (req, res) => {
    res.status(503).json({
        error: 'Service in maintenance mode',
        message: 'Only authentication is currently available',
        status: 503
    });
});

// Global error handlers
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// For local development
if (require.main === module) {
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
        console.log(`Minimal server running on port ${port}`);
    });
}

module.exports = app;
