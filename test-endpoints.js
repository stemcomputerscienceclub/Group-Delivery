// Test script to verify all serverless endpoints are working
const https = require('https');

const baseURL = 'https://oct-delivery-pure-serverless.vercel.app';
const endpoints = [
    '/api/test',
    '/api/db-test',
    '/api/auth/profile',
    '/api/restaurants',
    '/api/orders'
];

async function testEndpoint(url) {
    return new Promise((resolve) => {
        const req = https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log(`${url}: Status ${res.statusCode}`);
                if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        console.log(`  Response: ${JSON.stringify(json).substring(0, 100)}...`);
                    } catch (e) {
                        console.log(`  Response: ${data.substring(0, 100)}...`);
                    }
                } else {
                    console.log(`  Error: ${data.substring(0, 100)}...`);
                }
                resolve(res.statusCode);
            });
        });
        
        req.on('error', (err) => {
            console.log(`${url}: ERROR - ${err.message}`);
            resolve(0);
        });
        
        req.setTimeout(10000, () => {
            console.log(`${url}: TIMEOUT`);
            req.destroy();
            resolve(0);
        });
    });
}

async function testAllEndpoints() {
    console.log('Testing serverless endpoints...\n');
    
    for (const endpoint of endpoints) {
        const url = baseURL + endpoint;
        await testEndpoint(url);
        console.log('');
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('Testing complete!');
}

testAllEndpoints().catch(console.error);
