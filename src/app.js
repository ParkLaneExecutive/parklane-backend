const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Import routes
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');

// CREATE APP INSTANCE
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'chauffeur-backend' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
