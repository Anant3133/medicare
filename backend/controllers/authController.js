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
  const { username, password, role, email, full_name, roleKey } = req.body;
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 [BACKEND REGISTER] Registration request received');
  console.log('📦 [BACKEND] Request body:', { username, email, full_name, role, hasPassword: !!password, hasRoleKey: !!roleKey, roleKeyLength: roleKey?.length });
  
  // Validation
  if (!username || !password || !role) {
    console.log('❌ [BACKEND] Missing required fields');
    throw new AppError('Please provide username, password, and role', 400);
  }

  if (!roleKey) {
    console.log('❌ [BACKEND] Missing role key');
    throw new AppError('Role key is required for registration', 400);
  }
  
  // Validate role key
  const validRoleKeys = {
    admin: process.env.ADMIN_KEY,
    doctor: process.env.DOCTOR_KEY,
    staff: process.env.STAFF_KEY,
    billing: process.env.BILLING_KEY
  };

  console.log('🔑 [BACKEND] Environment keys loaded:', {
    admin: process.env.ADMIN_KEY,
    doctor: process.env.DOCTOR_KEY,
    staff: process.env.STAFF_KEY,
    billing: process.env.BILLING_KEY
  });
  console.log('🔍 [BACKEND] Validating role key for role:', role);
  console.log('🔍 [BACKEND] Expected key:', validRoleKeys[role]);
  console.log('🔍 [BACKEND] Received key:', roleKey);
  console.log('🔍 [BACKEND] Keys match:', roleKey === validRoleKeys[role]);

  if (!validRoleKeys[role]) {
    console.log('❌ [BACKEND] Invalid role:', role);
    throw new AppError('Invalid role', 400);
  }

  if (roleKey !== validRoleKeys[role]) {
    console.log('❌ [BACKEND] Role key mismatch!');
    console.log('❌ [BACKEND] Expected:', `"${validRoleKeys[role]}"`, '(length:', validRoleKeys[role]?.length, ')');
    console.log('❌ [BACKEND] Received:', `"${roleKey}"`, '(length:', roleKey?.length, ')');
    throw new AppError('Invalid role key. Please contact administrator.', 401);
  }
  
  console.log('✅ [BACKEND] Role key validated successfully');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Check if username already exists
  console.log('🔍 [BACKEND] Checking if username exists:', username);
  const existingUser = await query(
    `SELECT user_id FROM users WHERE username = $1`,
    [username]
  );

  if (existingUser.rows.length > 0) {
    console.log('❌ [BACKEND] Username already exists');
    throw new AppError('Username already exists', 400);
  }
  
  console.log('✅ [BACKEND] Username is available');
  
  // Hash password
  console.log('🔐 [BACKEND] Hashing password...');
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);
  console.log('✅ [BACKEND] Password hashed successfully');
  
  // Insert user - demonstrates parameterized query
  console.log('💾 [BACKEND] Inserting user into database...');
  console.log('💾 [BACKEND] Insert params:', { username, role, email, full_name });
  const result = await query(
    `INSERT INTO users (username, password_hash, role, email, full_name)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING user_id, username, role, email, full_name, created_at`,
    [username, password_hash, role, email, full_name]
  );
  
  const user = result.rows[0];
  console.log('✅ [BACKEND] User inserted successfully!');
  console.log('👤 [BACKEND] New user:', user);
  
  const token = generateToken(user.user_id, user.role);
  console.log('🎟️ [BACKEND] JWT token generated');
  console.log('📤 [BACKEND] Sending success response');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
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
  
  console.log('🔐 Login attempt for username:', username);
  
  if (!username || !password) {
    console.log('❌ Missing username or password');
    throw new AppError('Please provide username and password', 400);
  }
  
  // Get user by username - demonstrates parameterized query
  console.log('🔍 Searching for user in database...');
  const result = await query(
    `SELECT user_id, username, password_hash, role, email, full_name, is_active
     FROM users
     WHERE username = $1`,
    [username]
  );
  
  console.log('📊 Query result:', result.rows.length, 'user(s) found');
  
  if (result.rows.length === 0) {
    console.log('❌ User not found:', username);
    throw new AppError('Invalid credentials', 401);
  }
  
  const user = result.rows[0];
  console.log('👤 User found:', user.username, '- Role:', user.role, '- Active:', user.is_active);
  
  // Check if user is active
  if (!user.is_active) {
    console.log('❌ User account is deactivated');
    throw new AppError('Account is deactivated', 401);
  }
  
  // Verify password
  console.log('🔑 Verifying password...');
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  console.log('🔑 Password valid:', isPasswordValid);
  
  if (!isPasswordValid) {
    console.log('❌ Invalid password for user:', username);
    throw new AppError('Invalid credentials', 401);
  }
  
  // Update last login
  console.log('⏰ Updating last login timestamp...');
  await query(
    `UPDATE users SET last_login = now() WHERE user_id = $1`,
    [user.user_id]
  );
  
  // Generate token
  console.log('🎟️ Generating JWT token...');
  const token = generateToken(user.user_id, user.role);
  
  // Remove password hash from response
  delete user.password_hash;
  
  console.log('✅ Login successful for user:', username);
  console.log('📦 Sending response with token and user data');
  
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
