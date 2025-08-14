module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    res.status(200).json({
        success: true,
        message: 'Pure serverless functions working!',
        timestamp: new Date().toISOString(),
        version: '2.0-serverless-only',
        method: req.method,
        url: req.url,
        environment: process.env.NODE_ENV || 'development'
    });
};
