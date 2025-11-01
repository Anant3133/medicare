// backend/server.js
// Main Express server
// Demonstrates: REST API setup, middleware configuration, route mounting

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const { pool } = require('./config/db');
const { errorHandler, notFound } = require('./utils/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const admissionRoutes = require('./routes/admissionRoutes');
const bedRoutes = require('./routes/bedRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const billingRoutes = require('./routes/billingRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Initialize Express app
const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet());

// Compression
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      success: true,
      message: 'Server is running',
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server is running but database connection failed',
      error: error.message
    });
  }
});

// API information endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Medicare API v1.0',
    description: 'Smart Hospital Bed & Patient Allocation System',
    endpoints: {
      auth: '/api/auth',
      patients: '/api/patients',
      admissions: '/api/admissions',
      beds: '/api/beds',
      doctors: '/api/doctors',
      billing: '/api/billing',
      reports: '/api/reports'
    },
    documentation: 'See README.md and Postman collection for detailed API documentation',
    dbms_concepts: [
      'Transactions (ACID properties)',
      'Stored Procedures & Functions',
      'Triggers (Audit logging)',
      'Views & Materialized Views',
      'Indexes (B-tree, GIN for JSONB)',
      'Row-level Locking (SELECT FOR UPDATE)',
      'Constraints (CHECK, FOREIGN KEY, UNIQUE)',
      'Parameterized Queries (SQL injection prevention)'
    ]
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/reports', reportRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 5000;

// Test database connection before starting server
pool.query('SELECT NOW()')
  .then(() => {
    console.log('✓ Database connection established');
    
    // Start server
    app.listen(PORT, () => {
      console.log('');
      console.log('================================================');
      console.log(`🏥 Medicare Backend Server`);
      console.log(`📍 Running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`📊 Health Check: http://localhost:${PORT}/health`);
      console.log('================================================');
      console.log('');
      console.log('DBMS Concepts Demonstrated:');
      console.log('  ✓ Transactions & ACID properties');
      console.log('  ✓ Stored Procedures & Functions');
      console.log('  ✓ Triggers for audit logging');
      console.log('  ✓ Views & Materialized Views');
      console.log('  ✓ Indexes (B-tree, GIN)');
      console.log('  ✓ Row-level locking (concurrency control)');
      console.log('  ✓ Constraints & data integrity');
      console.log('  ✓ Parameterized queries');
      console.log('');
      console.log('Press Ctrl+C to stop the server');
      console.log('================================================');
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    console.error('Please check your database configuration in .env file');
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

module.exports = app;
