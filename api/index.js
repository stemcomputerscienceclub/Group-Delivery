module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    res.status(200).json({
        success: true,
        message: 'OCT Delivery System API - Pure Serverless',
        version: '2.0-serverless',
        endpoints: {
            auth: {
                login: 'POST /api/auth/login',
                register: 'POST /api/auth/register',
                profile: 'GET /api/auth/profile'
            },
            restaurants: {
                list: 'GET /api/restaurants',
                details: 'GET /api/restaurants/[id]'
            },
            orders: {
                list: 'GET /api/orders',
                create: 'POST /api/orders',
                join: 'POST /api/orders/[id]/join'
            },
            admin: {
                dashboard: 'GET /api/admin/dashboard'
            }
        },
        timestamp: new Date().toISOString()
    });
};
