const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Password hashing
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function verifyPassword(password, hashedPassword) {
    return hashPassword(password) === hashedPassword;
}

// JWT token handling
function generateToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
        expiresIn: '24h'
    });
}

function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    } catch (err) {
        return null;
    }
}

// Extract token from request
function getTokenFromRequest(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    
    // Also check cookies for browser requests
    return req.cookies?.token || null;
}

// Middleware for API authentication
function requireAuth(req, res, next) {
    const token = getTokenFromRequest(req);
    
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
}

// Middleware for admin authentication
function requireAdmin(req, res, next) {
    const token = getTokenFromRequest(req);
    
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    if (!decoded.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = decoded;
    next();
}

// Response helpers
function sendError(res, status = 500, message = 'Internal server error', details = null) {
    const response = { error: message };
    if (details && process.env.NODE_ENV === 'development') {
        response.details = details;
    }
    return res.status(status).json(response);
}

function sendSuccess(res, data = null, message = null) {
    const response = { success: true };
    if (message) response.message = message;
    if (data) response.data = data;
    return res.json(response);
}

// Validation helpers
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^\+?[\d\s\-\(\)]{10,}$/;
    return re.test(phone);
}

function sanitizeInput(input) {
    if (typeof input === 'string') {
        return input.trim();
    }
    return input;
}

// CORS handler for serverless functions
function setCORS(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
}

module.exports = {
    hashPassword,
    verifyPassword,
    generateToken,
    verifyToken,
    getTokenFromRequest,
    requireAuth,
    requireAdmin,
    sendError,
    sendSuccess,
    validateEmail,
    validatePhone,
    sanitizeInput,
    setCORS
};
