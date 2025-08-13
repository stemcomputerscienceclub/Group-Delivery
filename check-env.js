require('dotenv').config();

console.log('=== Environment Check ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('MONGODB_URI length:', process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0);

if (process.env.MONGODB_URI) {
    // Don't log the full URI for security, just parse it
    try {
        const url = new URL(process.env.MONGODB_URI);
        console.log('MongoDB Host:', url.hostname);
        console.log('MongoDB Database:', url.pathname.substring(1));
        console.log('MongoDB Protocol:', url.protocol);
        console.log('Has Auth:', url.username ? 'Yes' : 'No');
    } catch (e) {
        console.log('Could not parse MONGODB_URI:', e.message);
    }
}

console.log('========================');
