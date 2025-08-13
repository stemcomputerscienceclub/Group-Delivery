require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const MongoStore = require('connect-mongo');
const { addUserToLocals } = require('./middleware/auth');

const app = express();

// Configure MongoDB connection with better error handling and timeouts
const mongoConfig = {
    serverSelectionTimeoutMS: 3000, // Reduced for serverless
    socketTimeoutMS: 20000, // Reduced for serverless
    connectTimeoutMS: 3000, // Added connect timeout
    bufferMaxEntries: 0, // Disable mongoose buffering
    bufferCommands: false, // Disable mongoose buffering
    maxPoolSize: 5, // Reduced pool size for serverless
    minPoolSize: 1, // Minimal connections
    maxIdleTimeMS: 10000, // Shorter idle time for serverless
    family: 4, // Use IPv4, skip trying IPv6
    retryWrites: true, // Enable retry writes
    retryReads: true // Enable retry reads
};

// Connection retry logic for serverless environments
let isConnecting = false;
let connectionPromise = null;

async function connectToMongoDB() {
    if (mongoose.connection.readyState === 1) {
        return Promise.resolve();
    }
    
    if (isConnecting && connectionPromise) {
        return connectionPromise;
    }
    
    isConnecting = true;
    connectionPromise = new Promise(async (resolve, reject) => {
        const maxRetries = 2; // Reduced for serverless
        let retries = 0;
        
        while (retries < maxRetries) {
            try {
                console.log(`Connecting to MongoDB... (attempt ${retries + 1}/${maxRetries})`);
                await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/group-order-system', mongoConfig);
                console.log('Connected to MongoDB successfully');
                console.log('Legacy server listening...');
                isConnecting = false;
                resolve();
                return;
            } catch (err) {
                retries++;
                console.error(`MongoDB connection attempt ${retries} failed:`, err.message);
                
                if (retries < maxRetries) {
                    console.log(`Retrying in 1 second...`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                    console.error('All MongoDB connection attempts failed.');
                    isConnecting = false;
                    reject(err);
                    return;
                }
            }
        }
    });
    
    return connectionPromise;
}

// Initialize MongoDB connection (non-blocking)
connectToMongoDB().catch(err => {
    console.error('Initial MongoDB connection failed:', err.message);
    // Don't exit in serverless environments - let requests handle reconnection
});

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
});

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Express layouts setup
app.use(expressLayouts);
app.set('layout', 'layout');

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration - minimal setup
const sessionConfig = {
    secret: 'your-secret-key-here',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: false
    }
};





// Initialize session middleware
app.use(session(sessionConfig));

// Add user to res.locals for all views
app.use(addUserToLocals);

// Database connection middleware (only for routes that need it)
const ensureDbConnection = async (req, res, next) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            console.log('Database not connected, attempting to connect...');
            await connectToMongoDB();
        }
        next();
    } catch (err) {
        console.error('Database connection middleware error:', err);
        res.status(503).render('error', {
            message: 'Database connection error. Please try again.',
            error: process.env.NODE_ENV === 'development' ? err : {}
        });
    }
};

// Add default layout variables
app.use((req, res, next) => {
    // Set default layout variables
    res.locals.title = 'OCT Delivery System';
    res.locals.body = ''; // Initialize body variable
    next();
});

// Routes - auth routes handle their own database connection as needed
const authRouter = require('./routes/auth');
app.use('/', authRouter);
app.use('/items', ensureDbConnection, require('./routes/items'));
app.use('/restaurants', ensureDbConnection, require('./routes/restaurants'));
app.use('/admin', ensureDbConnection, require('./routes/admin'));

// Simple test endpoint (no database required)
app.get('/test', (req, res) => {
    res.json({ 
        status: 'Server is running',
        timestamp: new Date().toISOString(),
        mongoState: mongoose.connection.readyState,
        environment: process.env.NODE_ENV || 'development'
    });
});

// Root redirect
app.get('/', (req, res) => {
    try {
        if (req.session && req.session.user) {
            res.redirect('/items');
        } else {
            res.redirect('/login');
        }
    } catch (err) {
        console.error('Root route error:', err);
        res.redirect('/login');
    }
});

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        // Ensure connection is established
        if (mongoose.connection.readyState !== 1) {
            await connectToMongoDB();
        }
        
        // Check database connectivity
        const dbState = mongoose.connection.readyState;
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };
        
        if (dbState === 1) {
            // Try a simple database operation
            await mongoose.connection.db.admin().ping();
            res.json({ 
                status: 'ok', 
                database: 'connected',
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(503).json({ 
                status: 'error', 
                database: states[dbState] || 'unknown',
                timestamp: new Date().toISOString()
            });
        }
    } catch (err) {
        console.error('Health check failed:', err);
        res.status(503).json({ 
            status: 'error', 
            database: 'error',
            error: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', {
        message: 'Page not found',
        error: { status: 404 }
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('=== ERROR HANDLER ===');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('Request URL:', req.url);
    console.error('Request method:', req.method);
    console.error('MongoDB connection state:', mongoose.connection.readyState);
    console.error('===================');
    
    // Don't expose detailed errors in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(err.status || 500).render('error', {
        message: err.message || 'Something went wrong',
        error: isDevelopment ? err : { status: err.status || 500 }
    });
});

// Start server
const port = process.env.PORT || 3001;
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Health check available at http://localhost:${port}/health`);
});

// Export app for serverless environments (Vercel)
module.exports = app;