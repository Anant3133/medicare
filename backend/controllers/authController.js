// backend/controllers/authController.js
// Authentication controller with JWT
// Demonstrates: User authentication, password hashing, JWT tokens

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { AppError, asyncHandler } = require('../utils/errorHandler');

/**
 * Generate JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Register a new user
 * POST /api/auth/register
 */
exports.register = asyncHandler(async (req, res) => {
  const { username, password, role, email, full_name } = req.body;
  
  // Validation
  if (!username || !password || !role) {
    throw new AppError('Please provide username, password, and role', 400);
  }
  
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);
  
  // Insert user - demonstrates parameterized query
  const result = await query(
    `INSERT INTO users (username, password_hash, role, email, full_name)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING user_id, username, role, email, full_name, created_at`,
    [username, password_hash, role, email, full_name]
  );
  
  const user = result.rows[0];
  const token = generateToken(user.user_id, user.role);
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      token
    }
  });
});

/**
 * Login user
 * POST /api/auth/login
 */
exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    throw new AppError('Please provide username and password', 400);
  }
  
  // Get user by username - demonstrates parameterized query
  const result = await query(
    `SELECT user_id, username, password_hash, role, email, full_name, is_active
     FROM users
     WHERE username = $1`,
    [username]
  );
  
  if (result.rows.length === 0) {
    throw new AppError('Invalid credentials', 401);
  }
  
  const user = result.rows[0];
  
  // Check if user is active
  if (!user.is_active) {
    throw new AppError('Account is deactivated', 401);
  }
  
  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }
  
  // Update last login
  await query(
    `UPDATE users SET last_login = now() WHERE user_id = $1`,
    [user.user_id]
  );
  
  // Generate token
  const token = generateToken(user.user_id, user.role);
  
  // Remove password hash from response
  delete user.password_hash;
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user,
      token
    }
  });
});

/**
 * Get current user
 * GET /api/auth/me
 */
exports.getMe = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT user_id, username, role, email, full_name, is_active, created_at, last_login
     FROM users
     WHERE user_id = $1`,
    [req.user.userId]
  );
  
  if (result.rows.length === 0) {
    throw new AppError('User not found', 404);
  }
  
  res.json({
    success: true,
    data: result.rows[0]
  });
});

/**
 * Middleware to protect routes (JWT verification)
 */
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  
  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    throw new AppError('Not authorized to access this route', 401);
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const result = await query(
      `SELECT user_id, role, is_active FROM users WHERE user_id = $1`,
      [decoded.userId]
    );
    
    if (result.rows.length === 0) {
      throw new AppError('User no longer exists', 401);
    }
    
    if (!result.rows[0].is_active) {
      throw new AppError('Account is deactivated', 401);
    }
    
    // Attach user to request
    req.user = decoded;
    next();
  } catch (error) {
    throw new AppError('Not authorized to access this route', 401);
  }
});

/**
 * Middleware to restrict access by role
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError(`Role ${req.user.role} is not authorized to access this route`, 403);
    }
    next();
  };
};
