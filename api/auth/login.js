const { getUsersCollection } = require('../../lib/db');
const { hashPassword, verifyPassword, generateToken, sendError, sendSuccess, sanitizeInput, setCORS } = require('../../lib/auth');

module.exports = async (req, res) => {
    setCORS(res);
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return sendError(res, 405, 'Method not allowed');
    }

    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return sendError(res, 400, 'Username and password are required');
        }

        const users = await getUsersCollection();
        
        const user = await users.findOne(
            { username: sanitizeInput(username) },
            { 
                projection: { 
                    username: 1, 
                    password: 1, 
                    name: 1, 
                    phoneNumber: 1, 
                    roomNumber: 1, 
                    isAdmin: 1, 
                    preferences: 1 
                }
            }
        );

        if (!user) {
            return sendError(res, 401, 'Invalid credentials');
        }

        if (!verifyPassword(password, user.password)) {
            return sendError(res, 401, 'Invalid credentials');
        }

        // Generate JWT token
        const token = generateToken({
            id: user._id.toString(),
            username: user.username,
            name: user.name,
            phoneNumber: user.phoneNumber,
            roomNumber: user.roomNumber,
            isAdmin: user.isAdmin || false,
            preferences: user.preferences || { theme: 'system' }
        });

        // Update last login
        await users.updateOne(
            { _id: user._id },
            { $set: { lastLogin: new Date() } }
        );

        return sendSuccess(res, {
            token,
            user: {
                id: user._id.toString(),
                username: user.username,
                name: user.name,
                phoneNumber: user.phoneNumber,
                roomNumber: user.roomNumber,
                isAdmin: user.isAdmin || false,
                preferences: user.preferences || { theme: 'system' }
            }
        }, 'Login successful');

    } catch (err) {
        console.error('Login error:', err);
        return sendError(res, 500, 'Authentication service unavailable');
    }
};
