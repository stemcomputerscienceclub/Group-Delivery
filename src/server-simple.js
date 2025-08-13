require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const { addUserToLocals } = require('./middleware/auth');

const app = express();

// Disable Mongoose buffering globally - CRITICAL for serverless
mongoose.set('bufferCommands', false);
mongoose.set('bufferMaxEntries', 0);

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
    secret: process.env.SESSION_SECRET || 'your-secret-key-here',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
};

// Initialize session middleware
app.use(session(sessionConfig));

// Add user to res.locals for all views
app.use(addUserToLocals);

// Add default layout variables
app.use((req, res, next) => {
    res.locals.title = 'OCT Delivery System';
    res.locals.body = '';
    next();
});

// Routes
app.use('/', require('./routes/auth'));
app.use('/items', require('./routes/items'));
app.use('/restaurants', require('./routes/restaurants'));
app.use('/admin', require('./routes/admin'));

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
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        mongoState: mongoose.connection.readyState
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Page not found',
        status: 404
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('=== ERROR HANDLER ===');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Request URL:', req.url);
    console.error('MongoDB state:', mongoose.connection.readyState);
    console.error('===================');
    
    res.status(err.status || 500).json({
        error: 'Internal server error',
        status: err.status || 500
    });
});

// For local development
if (require.main === module) {
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

// Export app for serverless environments (Vercel)
module.exports = app;
