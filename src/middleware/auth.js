// Add user to res.locals for all views
const addUserToLocals = (req, res, next) => {
    // Initialize res.locals
    res.locals = {
        ...res.locals,
        user: null,
        error: null
    };

    // Add user to res.locals if session exists
    if (req.session && req.session.user) {
        res.locals.user = req.session.user;
    }

    next();
};

// Require login middleware
const requireLogin = (req, res, next) => {
    console.log('🔍 requireLogin middleware - Session ID:', req.sessionID);
    console.log('🔍 Session exists:', !!req.session);
    console.log('🔍 Session user:', req.session?.user ? 'exists' : 'missing');
    
    if (!req.session || !req.session.user) {
        console.log('❌ No session or user, redirecting to login');
        // Store the requested URL to redirect back after login
        if (req.session) {
            req.session.returnTo = req.originalUrl;
        }
        return res.redirect('/login');
    }
    console.log('✅ User authenticated:', req.session.user.username);
    next();
};

// Require admin middleware
const requireAdmin = (req, res, next) => {
    if (!req.session || !req.session.user || !req.session.user.isAdmin) {
        return res.status(403).render('error', {
            message: 'Access Denied',
            error: { 
                status: 403, 
                stack: 'You do not have permission to access this page.' 
            }
        });
    }
    next();
};

module.exports = {
    addUserToLocals,
    requireLogin,
    requireAdmin
};