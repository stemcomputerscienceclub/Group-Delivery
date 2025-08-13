const { getUsersCollection } = require('../../lib/db');
const { hashPassword, sendError, sendSuccess, sanitizeInput, validatePhone, setCORS } = require('../../lib/auth');

module.exports = async (req, res) => {
    setCORS(res);
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return sendError(res, 405, 'Method not allowed');
    }

    try {
        const { username, password, name, phoneNumber, roomNumber } = req.body;

        // Validation
        if (!username || !password || !name || !phoneNumber || !roomNumber) {
            return sendError(res, 400, 'All fields are required');
        }

        if (password.length < 6) {
            return sendError(res, 400, 'Password must be at least 6 characters long');
        }

        if (!validatePhone(phoneNumber)) {
            return sendError(res, 400, 'Invalid phone number format');
        }

        const users = await getUsersCollection();

        // Check if username already exists
        const existingUser = await users.findOne({ username: sanitizeInput(username) });
        if (existingUser) {
            return sendError(res, 409, 'Username already exists');
        }

        // Create new user
        const newUser = {
            username: sanitizeInput(username),
            password: hashPassword(password),
            name: sanitizeInput(name),
            phoneNumber: sanitizeInput(phoneNumber),
            roomNumber: sanitizeInput(roomNumber),
            isAdmin: false,
            preferences: {
                theme: 'system'
            },
            paymentHistory: [],
            previousOrders: [],
            statistics: {
                totalOrders: 0,
                totalSpent: 0,
                favoriteRestaurants: [],
                mostOrderedItems: []
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await users.insertOne(newUser);

        return sendSuccess(res, {
            id: result.insertedId.toString(),
            username: newUser.username,
            name: newUser.name,
            phoneNumber: newUser.phoneNumber,
            roomNumber: newUser.roomNumber
        }, 'User registered successfully');

    } catch (err) {
        console.error('Registration error:', err);
        return sendError(res, 500, 'Registration service unavailable');
    }
};
