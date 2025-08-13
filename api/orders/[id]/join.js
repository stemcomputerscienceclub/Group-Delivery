const { getOrdersCollection, getUsersCollection, isValidObjectId, createObjectId } = require('../../../lib/db');
const { requireAuth, sendError, sendSuccess, setCORS } = require('../../../lib/auth');

module.exports = async (req, res) => {
    setCORS(res);
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return sendError(res, 405, 'Method not allowed');
    }

    try {
        requireAuth(req, res, async () => {
            const { id } = req.query;
            const { items, specialInstructions = '' } = req.body;

            if (!id || !isValidObjectId(id)) {
                return sendError(res, 400, 'Valid order ID is required');
            }

            if (!items || !Array.isArray(items) || items.length === 0) {
                return sendError(res, 400, 'Items array is required');
            }

            // Validate items structure
            for (const item of items) {
                if (!item.name || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
                    return sendError(res, 400, 'Each item must have name, price, and quantity');
                }
                if (item.quantity <= 0) {
                    return sendError(res, 400, 'Item quantity must be positive');
                }
            }

            const orders = await getOrdersCollection();
            const order = await orders.findOne({ _id: createObjectId(id) });

            if (!order) {
                return sendError(res, 404, 'Order not found');
            }

            if (order.status !== 'open') {
                return sendError(res, 400, 'Order is no longer accepting new items');
            }

            // Check if user already has an individual order in this group order
            const existingOrderIndex = order.individualOrders.findIndex(
                io => io.user.toString() === req.user.id
            );

            const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const userShare = subtotal > 0 ? order.deliveryFee / order.individualOrders.length || 1 : 0;
            const totalAmount = subtotal + userShare;

            const individualOrder = {
                user: createObjectId(req.user.id),
                items,
                subtotal,
                totalAmount,
                specialInstructions,
                paid: false,
                amountPaid: 0,
                change: 0
            };

            let updateOperation;
            if (existingOrderIndex >= 0) {
                // Update existing individual order
                updateOperation = {
                    $set: {
                        [`individualOrders.${existingOrderIndex}`]: individualOrder,
                        updatedAt: new Date()
                    }
                };
            } else {
                // Add new individual order
                updateOperation = {
                    $push: { individualOrders: individualOrder },
                    $set: { updatedAt: new Date() }
                };
            }

            const result = await orders.updateOne(
                { _id: createObjectId(id) },
                updateOperation
            );

            if (result.matchedCount === 0) {
                return sendError(res, 404, 'Order not found');
            }

            return sendSuccess(res, {
                individualOrder,
                subtotal,
                totalAmount
            }, 'Items added to order successfully');
        });
    } catch (err) {
        console.error('Add to order error:', err);
        return sendError(res, 500, 'Unable to add items to order');
    }
};
