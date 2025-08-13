const { requireAuth, sendSuccess, sendError, setCORS } = require('../../lib/auth');

module.exports = async (req, res) => {
    setCORS(res);
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return sendError(res, 405, 'Method not allowed');
    }

    try {
        // Use the auth middleware
        requireAuth(req, res, () => {
            return sendSuccess(res, {
                user: req.user,
                authenticated: true
            }, 'User authenticated');
        });
    } catch (err) {
        console.error('Profile error:', err);
        return sendError(res, 500, 'Profile service unavailable');
    }
};
