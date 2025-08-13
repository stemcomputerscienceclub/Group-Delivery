const { getRestaurantsCollection, isValidObjectId, createObjectId } = require('../../lib/db');
const { requireAuth, sendError, sendSuccess, setCORS } = require('../../lib/auth');

module.exports = async (req, res) => {
    setCORS(res);
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return sendError(res, 405, 'Method not allowed');
    }

    try {
        requireAuth(req, res, async () => {
            const { id } = req.query;

            if (!id || !isValidObjectId(id)) {
                return sendError(res, 400, 'Valid restaurant ID is required');
            }

            const restaurants = await getRestaurantsCollection();
            const restaurant = await restaurants.findOne({ _id: createObjectId(id) });

            if (!restaurant) {
                return sendError(res, 404, 'Restaurant not found');
            }

            return sendSuccess(res, { restaurant });
        });
    } catch (err) {
        console.error('Restaurant details error:', err);
        return sendError(res, 500, 'Unable to fetch restaurant details');
    }
};
