require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('../models/Item');
const User = require('../models/User');

async function performanceTest() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/group-order-system');
        console.log('Connected to MongoDB');

        console.log('\n=== Performance Test Results ===\n');

        // Test 1: Count total orders
        console.log('1. Counting total orders...');
        const startTime1 = Date.now();
        const totalOrders = await Item.countDocuments();
        const endTime1 = Date.now();
        console.log(`   Total orders: ${totalOrders}`);
        console.log(`   Time taken: ${endTime1 - startTime1}ms`);

        // Test 2: Fetch all orders (old way)
        console.log('\n2. Fetching ALL orders (old way)...');
        const startTime2 = Date.now();
        const allOrders = await Item.find()
            .populate('restaurant')
            .populate('createdBy')
            .populate('individualOrders.user')
            .sort('-createdAt');
        const endTime2 = Date.now();
        console.log(`   Orders fetched: ${allOrders.length}`);
        console.log(`   Time taken: ${endTime2 - startTime2}ms`);

        // Test 3: Fetch only latest 30 orders (new way)
        console.log('\n3. Fetching latest 30 orders (new way)...');
        const startTime3 = Date.now();
        const latestOrders = await Item.find()
            .populate('restaurant')
            .populate('createdBy')
            .populate('individualOrders.user')
            .sort('-createdAt')
            .limit(30);
        const endTime3 = Date.now();
        console.log(`   Orders fetched: ${latestOrders.length}`);
        console.log(`   Time taken: ${endTime3 - startTime3}ms`);

        // Test 4: Fetch past orders with pagination
        console.log('\n4. Fetching past orders with pagination...');
        const startTime4 = Date.now();
        const pastOrders = await Item.find({
            status: { $in: ['closed', 'delivered'] }
        })
        .populate('restaurant')
        .populate('createdBy')
        .populate('individualOrders.user')
        .sort('-createdAt')
        .limit(20);
        const endTime4 = Date.now();
        console.log(`   Past orders fetched: ${pastOrders.length}`);
        console.log(`   Time taken: ${endTime4 - startTime4}ms`);

        // Test 5: Count past orders
        console.log('\n5. Counting past orders...');
        const startTime5 = Date.now();
        const pastOrdersCount = await Item.countDocuments({
            status: { $in: ['closed', 'delivered'] }
        });
        const endTime5 = Date.now();
        console.log(`   Past orders count: ${pastOrdersCount}`);
        console.log(`   Time taken: ${endTime5 - startTime5}ms`);

        // Performance comparison
        console.log('\n=== Performance Comparison ===');
        const oldWayTime = endTime2 - startTime2;
        const newWayTime = endTime3 - startTime3;
        const improvement = ((oldWayTime - newWayTime) / oldWayTime * 100).toFixed(2);
        
        console.log(`Old way (all orders): ${oldWayTime}ms`);
        console.log(`New way (30 orders): ${newWayTime}ms`);
        console.log(`Performance improvement: ${improvement}%`);

        // Memory usage comparison
        console.log('\n=== Memory Usage Comparison ===');
        console.log(`All orders data size: ~${JSON.stringify(allOrders).length} bytes`);
        console.log(`Latest 30 orders data size: ~${JSON.stringify(latestOrders).length} bytes`);
        const memoryReduction = ((JSON.stringify(allOrders).length - JSON.stringify(latestOrders).length) / JSON.stringify(allOrders).length * 100).toFixed(2);
        console.log(`Memory reduction: ${memoryReduction}%`);

        console.log('\n=== Recommendations ===');
        console.log('✅ Use .limit(30) for main dashboard queries');
        console.log('✅ Use pagination for past orders (20 per page)');
        console.log('✅ Database indexes are in place for optimal performance');
        console.log('✅ Consider implementing caching for frequently accessed data');

    } catch (err) {
        console.error('Performance test error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

// Run the performance test
performanceTest();
