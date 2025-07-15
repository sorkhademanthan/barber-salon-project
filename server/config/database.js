const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartqueue-barber');
    
    console.log(`
    📦 MongoDB Connected Successfully!
    🏠 Host: ${conn.connection.host}
    📁 Database: ${conn.connection.name}
    🔌 Port: ${conn.connection.port}
    `);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
