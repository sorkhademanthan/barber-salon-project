const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth');
const shopOwnerAuthRoutes = require('./routes/shopOwnerAuth');
const bookingRoutes = require('./routes/bookings');
const shopRoutes = require('./routes/shops');
const serviceRoutes = require('./routes/services');
const userRoutes = require('./routes/users');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', shopOwnerAuthRoutes); // Shop owner auth routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/users', userRoutes);

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Barber Salon API is running!' });
});

// API routes (you can add more routes here)
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is healthy' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
