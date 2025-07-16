const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');
const seedSpecialties = require('./utils/seedSpecialties');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and seed data
const initializeApp = async () => {
    await connectDB();
    await seedSpecialties();
};

initializeApp();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/shops', require('./routes/shops'));
app.use('/api/specialties', require('./routes/specialties'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Barber Salon API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Barber Salon API',
    version: '1.0.0'
  });
});

// Handle 404 routes (this should be after all other routes but before error handler)
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`
  🚀 Barber Salon Server is running!
  
  📍 Port: ${PORT}
  🌍 Environment: ${process.env.NODE_ENV || 'development'}
  🔗 API Base: http://localhost:${PORT}/api
  🏥 Health Check: http://localhost:${PORT}/api/health
  
  📚 Available Routes:
  - POST /api/auth/register
  - POST /api/auth/login
  - POST /api/auth/forgot-password
  - POST /api/auth/reset-password/:token
  - GET  /api/auth/verify-email/:token
  - GET  /api/shops
  - POST /api/shops
  - GET  /api/specialties
  - POST /api/specialties (admin only)
  `);
});

module.exports = app;
