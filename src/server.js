require('dotenv').config();
const express = require('express');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const { addUserToLocals } = require('./middleware/auth');

const app = express();

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

// Temporary maintenance mode for other routes until database connection is stable
app.use('/items', (req, res) => {
    res.status(503).render('error', {
        message: 'Service Temporarily Unavailable',
        error: {
            status: 503,
            stack: 'Database connectivity issues. Please try logging in again shortly.'
        }
    });
});

app.use('/restaurants', (req, res) => {
    res.status(503).render('error', {
        message: 'Service Temporarily Unavailable', 
        error: {
            status: 503,
            stack: 'Database connectivity issues. Please try logging in again shortly.'
        }
    });
});

app.use('/admin', (req, res) => {
    res.status(503).render('error', {
        message: 'Service Temporarily Unavailable',
        error: {
            status: 503, 
            stack: 'Database connectivity issues. Please try logging in again shortly.'
        }
    });
});

// Simple test endpoint (no database required)
app.get('/test', (req, res) => {
    res.json({ 
        status: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        auth: 'native-driver'
    });
});

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

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        auth: 'native-driver'
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