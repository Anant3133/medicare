// backend/utils/errorHandler.js
// Centralized error handling utility

/**
 * Custom error class for application errors
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log error for debugging
  console.error('Error:', err);
  
  // PostgreSQL specific errors
  if (err.code === '23505') {
    // Unique constraint violation
    error = new AppError('Duplicate value. Record already exists.', 400);
  }
  
  if (err.code === '23503') {
    // Foreign key constraint violation
    error = new AppError('Referenced record does not exist.', 400);
  }
  
  if (err.code === '23502') {
    // Not null constraint violation
    error = new AppError('Required field is missing.', 400);
  }
  
  if (err.code === '22P02') {
    // Invalid text representation
    error = new AppError('Invalid data format.', 400);
  }
  
  if (err.code === '42P01') {
    // Undefined table
    error = new AppError('Database table not found.', 500);
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again.', 401);
  }
  
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired. Please log in again.', 401);
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(e => e.message).join(', ');
    error = new AppError(message, 400);
  }
  
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Async error wrapper to avoid try-catch in every controller
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
  const error = new AppError(`Route not found: ${req.originalUrl}`, 404);
  next(error);
};

module.exports = {
  AppError,
  errorHandler,
  asyncHandler,
  notFound
};
