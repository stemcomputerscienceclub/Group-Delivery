const { getRestaurantsCollection } = require('../../lib/db');
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
            const restaurants = await getRestaurantsCollection();
            
            const { page = 1, limit = 20, search = '', cuisine = '' } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Build query
            const query = {};
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { cuisine: { $regex: search, $options: 'i' } }
                ];
            }
            if (cuisine) {
                query.cuisine = { $regex: cuisine, $options: 'i' };
            }

            const [restaurantList, total] = await Promise.all([
                restaurants.find(query)
                    .sort({ name: 1 })
                    .skip(skip)
                    .limit(parseInt(limit))
                    .toArray(),
                restaurants.countDocuments(query)
            ]);

            return sendSuccess(res, {
                restaurants: restaurantList,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            });
        });
    } catch (err) {
        console.error('Restaurants list error:', err);
        return sendError(res, 500, 'Unable to fetch restaurants');
    }
};
