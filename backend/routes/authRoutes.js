// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  protect
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
