const { getOrdersCollection, getRestaurantsCollection, getUsersCollection, createObjectId } = require('../../lib/db');
const { requireAuth, sendError, sendSuccess, setCORS } = require('../../lib/auth');

module.exports = async (req, res) => {
    setCORS(res);
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        return handleGetOrders(req, res);
    } else if (req.method === 'POST') {
        return handleCreateOrder(req, res);
    } else {
        return sendError(res, 405, 'Method not allowed');
    }
};

async function handleGetOrders(req, res) {
    try {
        requireAuth(req, res, async () => {
            const { page = 1, limit = 20, status = '', my = false } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            const orders = await getOrdersCollection();
            
            // Build query
            const query = {};
            if (status) {
                query.status = status;
            }
            if (my === 'true') {
                query.createdBy = createObjectId(req.user.id);
            }

            const [orderList, total] = await Promise.all([
                orders.find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(parseInt(limit))
                    .toArray(),
                orders.countDocuments(query)
            ]);

            // Populate restaurant and user data
            const restaurants = await getRestaurantsCollection();
            const users = await getUsersCollection();

            const populatedOrders = await Promise.all(orderList.map(async (order) => {
                const [restaurant, creator] = await Promise.all([
                    restaurants.findOne({ _id: order.restaurant }),
                    users.findOne({ _id: order.createdBy }, { projection: { name: 1, roomNumber: 1 } })
                ]);

                return {
                    ...order,
                    restaurant,
                    createdBy: creator
                };
            }));

            return sendSuccess(res, {
                orders: populatedOrders,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            });
        });
    } catch (err) {
        console.error('Get orders error:', err);
        return sendError(res, 500, 'Unable to fetch orders');
    }
}

async function handleCreateOrder(req, res) {
    try {
        requireAuth(req, res, async () => {
            const { restaurantId, deliveryTime, message, deliveryFee = 5.00 } = req.body;

            if (!restaurantId || !deliveryTime) {
                return sendError(res, 400, 'Restaurant ID and delivery time are required');
            }

            const restaurants = await getRestaurantsCollection();
            const restaurant = await restaurants.findOne({ _id: createObjectId(restaurantId) });

            if (!restaurant) {
                return sendError(res, 404, 'Restaurant not found');
            }

            const orders = await getOrdersCollection();
            const newOrder = {
                restaurant: createObjectId(restaurantId),
                createdBy: createObjectId(req.user.id),
                creatorRoom: req.user.roomNumber,
                deliveryTime: new Date(deliveryTime),
                deliveryFee: parseFloat(deliveryFee),
                message: message || '',
                status: 'open',
                individualOrders: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await orders.insertOne(newOrder);

            return sendSuccess(res, {
                orderId: result.insertedId.toString(),
                order: newOrder
            }, 'Order created successfully');
        });
    } catch (err) {
        console.error('Create order error:', err);
        return sendError(res, 500, 'Unable to create order');
    }
}
