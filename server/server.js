const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// CORS Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Server is working!',
    timestamp: new Date().toISOString()
  });
});

// Dynamic Routes
try {
  const authRoutes = require('./routes/auth');
  const shopRoutes = require('./routes/shops');
  const bookingRoutes = require('./routes/bookings');
  const servicesRoutes = require('./routes/services');

  app.use('/api/auth', authRoutes);
  app.use('/api/shops', shopRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/services', servicesRoutes);

  console.log('✅ Routes loaded successfully');
} catch (err) {
  console.error('❌ Error loading routes:', err.message);
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Internal Server Error:', err.message);
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message,
    error: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });
});

// MongoDB Connection and Server Initialization
const initializeApp = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/barber-salon', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`
🚀 Barber Salon Server is running!

📍 Port: ${PORT}
🔗 Base URL: http://localhost:${PORT}/api
💡 Try visiting:
   - POST /api/auth/register
   - POST /api/auth/login
   - GET  /api/auth/me
   - POST /api/auth/shop-register
   - GET  /api/health
   - GET  /api/test
    `);
  });
};

initializeApp();

module.exports = app;
