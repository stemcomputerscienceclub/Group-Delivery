const { getUsersCollection, getOrdersCollection, getRestaurantsCollection } = require('../../lib/db');
const { requireAdmin, sendError, sendSuccess, setCORS } = require('../../lib/auth');

module.exports = async (req, res) => {
    setCORS(res);
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return sendError(res, 405, 'Method not allowed');
    }

    try {
        requireAdmin(req, res, async () => {
            const [users, orders, restaurants] = await Promise.all([
                getUsersCollection(),
                getOrdersCollection(),
                getRestaurantsCollection()
            ]);

            const [usersList, ordersList, restaurantsList] = await Promise.all([
                users.find({}).sort({ name: 1 }).toArray(),
                orders.find({}).sort({ createdAt: -1 }).limit(50).toArray(),
                restaurants.find({}).sort({ name: 1 }).toArray()
            ]);

            // Calculate statistics
            const stats = {
                // User statistics
                totalUsers: usersList.length,
                admins: usersList.filter(u => u.isAdmin).length,
                activeUsers: usersList.filter(u => {
                    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                    return u.lastLogin && u.lastLogin > thirtyDaysAgo;
                }).length,
                usersByRoom: usersList.reduce((acc, user) => {
                    acc[user.roomNumber] = (acc[user.roomNumber] || 0) + 1;
                    return acc;
                }, {}),

                // Order statistics
                totalOrders: ordersList.length,
                activeOrders: ordersList.filter(o => o.status === 'open').length,
                closedOrders: ordersList.filter(o => o.status === 'closed').length,
                deliveredOrders: ordersList.filter(o => o.status === 'delivered').length,

                // Restaurant statistics
                totalRestaurants: restaurantsList.length,
                cuisineTypes: [...new Set(restaurantsList.map(r => r.cuisine))],

                // Financial statistics
                totalDeliveryFees: ordersList.reduce((sum, order) => sum + (order.deliveryFee || 0), 0),
                
                // Top users by orders
                topUsers: usersList
                    .filter(u => u.statistics && u.statistics.totalOrders > 0)
                    .sort((a, b) => b.statistics.totalOrders - a.statistics.totalOrders)
                    .slice(0, 10)
                    .map(u => ({
                        name: u.name,
                        roomNumber: u.roomNumber,
                        totalOrders: u.statistics.totalOrders,
                        totalSpent: u.statistics.totalSpent || 0
                    })),

                // Recent activity
                recentOrders: ordersList.slice(0, 10).map(order => ({
                    id: order._id,
                    status: order.status,
                    createdAt: order.createdAt,
                    deliveryTime: order.deliveryTime,
                    participantCount: order.individualOrders ? order.individualOrders.length : 0
                }))
            };

            return sendSuccess(res, {
                stats,
                users: usersList.map(u => ({
                    id: u._id,
                    username: u.username,
                    name: u.name,
                    roomNumber: u.roomNumber,
                    phoneNumber: u.phoneNumber,
                    isAdmin: u.isAdmin,
                    createdAt: u.createdAt,
                    lastLogin: u.lastLogin,
                    totalOrders: u.statistics?.totalOrders || 0,
                    totalSpent: u.statistics?.totalSpent || 0
                })),
                recentOrders: ordersList.slice(0, 20),
                restaurants: restaurantsList
            });
        });
    } catch (err) {
        console.error('Admin dashboard error:', err);
        return sendError(res, 500, 'Unable to fetch dashboard data');
    }
};
