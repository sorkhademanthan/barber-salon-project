const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shops');
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/users');
const { errorHandler } = require('./middleware/errorHandler');

// Initialize Express app
const app = express();
const server = createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Connect to Database
connectDB();

// Security Middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SmartQueue API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to SmartQueue API',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join room for real-time updates
  socket.on('join-shop', (shopId) => {
    socket.join(`shop-${shopId}`);
    console.log(`Client ${socket.id} joined shop ${shopId}`);
  });

  // Handle queue updates
  socket.on('queue-update', (data) => {
    socket.to(`shop-${data.shopId}`).emit('queue-updated', data);
  });

  // Handle booking updates
  socket.on('booking-update', (data) => {
    socket.to(`shop-${data.shopId}`).emit('booking-updated', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Error handling middleware (should be last)
app.use(errorHandler);

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
  🚀 SmartQueue Server is running!
  
  📍 Port: ${PORT}
  🌍 Environment: ${process.env.NODE_ENV || 'development'}
  🔗 API Base: http://localhost:${PORT}/api
  🏥 Health Check: http://localhost:${PORT}/api/health
  
  📚 Available Routes:
  - POST /api/auth/register
  - POST /api/auth/login
  - GET  /api/shops
  - POST /api/bookings
  
  ⚡ Socket.io enabled for real-time features
  `);
});

module.exports = app;
