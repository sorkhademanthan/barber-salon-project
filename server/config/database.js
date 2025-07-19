const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log('📍 Connection URI:', process.env.MONGODB_URI?.replace(/\/\/.*:.*@/, '//***:***@'));

    // Remove deprecated options
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`
        📦 MongoDB Connected Successfully!
        🏠 Host: ${conn.connection.host}
        📁 Database: ${conn.connection.name}
        🔌 Port: ${conn.connection.port}
    `);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // More specific error messages
    if (error.message.includes('bad auth')) {
      console.error(`
      🔐 Authentication Error:
      - Check your MongoDB username and password
      - Verify the connection string format
      - Ensure user has proper database permissions
      
      📝 Expected format:
      mongodb+srv://username:password@cluster.mongodb.net/database-name
      `);
    }
    
    if (error.message.includes('ENOTFOUND')) {
      console.error(`
      🌐 Network Error:
      - Check your internet connection
      - Verify the cluster URL is correct
      - Ensure your IP is whitelisted in MongoDB Atlas
      `);
    }

    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
