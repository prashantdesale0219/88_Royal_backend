require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

// Import routes
const chatRoutes = require('./routes/chatRoutes');
const leadRoutes = require('./routes/leadRoutes');
const propertyRoutes = require('./routes/propertyRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:3000',
  'https://88royals.netlify.app'
];
// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error(`CORS error: Not allowed by CORS for origin ${origin}`), false);
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Serve static files from assets directory
app.use('/assets', express.static('assets'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/properties', propertyRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});