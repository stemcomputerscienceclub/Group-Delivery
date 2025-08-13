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
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    bufferMaxEntries: 0, // Disable mongoose buffering
    bufferCommands: false, // Disable mongoose buffering
    maxPoolSize: 10, // Maintain up to 10 socket connections
    minPoolSize: 5, // Maintain a minimum of 5 socket connections
    maxIdleTimeMS: 30000, // Close connections after 30s of inactivity
    family: 4 // Use IPv4, skip trying IPv6
};

// Connection retry logic
async function connectToMongoDB() {
    const maxRetries = 3;
    let retries = 0;
    
    while (retries < maxRetries) {
        try {
            console.log(`Connecting to MongoDB... (attempt ${retries + 1}/${maxRetries})`);
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/group-order-system', mongoConfig);
            console.log('Connected to MongoDB successfully');
            console.log('Legacy server listening...');
            return;
        } catch (err) {
            retries++;
            console.error(`MongoDB connection attempt ${retries} failed:`, err.message);
            
            if (retries < maxRetries) {
                console.log(`Retrying in 2 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
                console.error('All MongoDB connection attempts failed. Exiting...');
                process.exit(1);
            }
        }
    }
}

// Start MongoDB connection
connectToMongoDB();

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

// Add default layout variables
app.use((req, res, next) => {
    // Set default layout variables
    res.locals.title = 'OCT Delivery System';
    res.locals.body = ''; // Initialize body variable
    next();
});

// Routes
app.use('/', require('./routes/auth'));
app.use('/items', require('./routes/items'));
app.use('/restaurants', require('./routes/restaurants'));
app.use('/admin', require('./routes/admin'));

// Root redirect
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/items');
    } else {
        res.redirect('/login');
    }
});

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
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
    console.error('Error:', err);
    res.status(err.status || 500).render('error', {
        message: err.message || 'Something went wrong',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Start server
const port = process.env.PORT || 3001;
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Health check available at http://localhost:${port}/health`);
});