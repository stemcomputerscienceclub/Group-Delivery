require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to prompt user for input
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
};

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate phone number format
const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

const createNewAdmin = async () => {
  try {
    console.log('🔧 Creating New Admin User');
    console.log('========================\n');

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/group-order-system');
    console.log('✅ Connected to MongoDB successfully\n');

    // Get admin details from user
    const username = await askQuestion('Enter username for the new admin: ');
    
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log(`❌ User with username "${username}" already exists!`);
      console.log('Please choose a different username.\n');
      rl.close();
      await mongoose.connection.close();
      return;
    }

    const password = await askQuestion('Enter password for the new admin: ');
    
    // Validate password length
    if (password.length < 6) {
      console.log('❌ Password must be at least 6 characters long!\n');
      rl.close();
      await mongoose.connection.close();
      return;
    }

    const name = await askQuestion('Enter full name for the new admin: ');
    const roomNumber = await askQuestion('Enter room number (or "ADMIN" for system admin): ');
    
    let phoneNumber = await askQuestion('Enter phone number: ');
    
    // Validate phone number
    if (!isValidPhone(phoneNumber)) {
      console.log('⚠️  Warning: Phone number format may be invalid. Continuing anyway...\n');
    }

    // Confirm admin creation
    console.log('\n📋 Admin User Details:');
    console.log('======================');
    console.log(`Username: ${username}`);
    console.log(`Name: ${name}`);
    console.log(`Room: ${roomNumber}`);
    console.log(`Phone: ${phoneNumber}`);
    console.log(`Is Admin: Yes`);
    console.log('');

    const confirm = await askQuestion('Do you want to create this admin user? (yes/no): ');
    
    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      console.log('❌ Admin creation cancelled.\n');
      rl.close();
      await mongoose.connection.close();
      return;
    }

    // Create admin user
    const adminUser = new User({
      username,
      password,
      name,
      roomNumber,
      phoneNumber,
      isAdmin: true
    });

    await adminUser.save();
    
    console.log('\n✅ Admin user created successfully!');
    console.log('===============================');
    console.log(`Username: ${adminUser.username}`);
    console.log(`Name: ${adminUser.name}`);
    console.log(`Room: ${adminUser.roomNumber}`);
    console.log(`Phone: ${adminUser.phoneNumber}`);
    console.log(`Is Admin: ${adminUser.isAdmin}`);
    console.log(`Created At: ${adminUser.createdAt}`);
    console.log('');
    console.log('🔑 Login Credentials:');
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log('');
    console.log('⚠️  Please save these credentials securely!');

  } catch (err) {
    console.error('❌ Error creating admin user:', err.message);
    if (err.code === 11000) {
      console.log('This username already exists. Please choose a different username.');
    }
  } finally {
    rl.close();
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Handle command line arguments for non-interactive mode
const args = process.argv.slice(2);
if (args.length >= 4) {
  // Non-interactive mode: node createNewAdmin.js username password name room phone
  const [username, password, name, roomNumber, phoneNumber] = args;
  
  const createAdminNonInteractive = async () => {
    try {
      console.log('🔧 Creating New Admin User (Non-interactive mode)');
      console.log('===============================================\n');

      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/group-order-system');
      console.log('✅ Connected to MongoDB successfully\n');

      // Check if username already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        console.log(`❌ User with username "${username}" already exists!`);
        await mongoose.connection.close();
        return;
      }

      // Validate password length
      if (password.length < 6) {
        console.log('❌ Password must be at least 6 characters long!');
        await mongoose.connection.close();
        return;
      }

      // Create admin user
      const adminUser = new User({
        username,
        password,
        name,
        roomNumber,
        phoneNumber: phoneNumber || '+1 555-0000',
        isAdmin: true
      });

      await adminUser.save();
      
      console.log('✅ Admin user created successfully!');
      console.log('===============================');
      console.log(`Username: ${adminUser.username}`);
      console.log(`Name: ${adminUser.name}`);
      console.log(`Room: ${adminUser.roomNumber}`);
      console.log(`Phone: ${adminUser.phoneNumber}`);
      console.log(`Is Admin: ${adminUser.isAdmin}`);
      console.log(`Created At: ${adminUser.createdAt}`);
      console.log('');
      console.log('🔑 Login Credentials:');
      console.log(`Username: ${username}`);
      console.log(`Password: ${password}`);

    } catch (err) {
      console.error('❌ Error creating admin user:', err.message);
    } finally {
      await mongoose.connection.close();
      console.log('\n🔌 Database connection closed');
    }
  };

  createAdminNonInteractive();
} else {
  // Interactive mode
  createNewAdmin();
}

