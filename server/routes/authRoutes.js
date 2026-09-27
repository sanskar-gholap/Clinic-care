const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const LoginAttempt = require('../models/LoginAttempt');
const { authenticate, JWT_SECRET } = require('../middleware/auth');
const { sendRegistrationEmail, sendLoginEmail, sendFailedLoginEmail } = require('../services/emailService');

// @route   POST /api/auth/register
// @desc    Register a new user & create initial patient profile
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please login.'
      });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'patient',
      phone: phone || '',
      lastLogin: null,
      status: 'Active'
    });

    // Create matching patient profile
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    await PatientProfile.create({
      user: user._id,
      firstName,
      lastName,
      email: user.email,
      phone: user.phone,
      bloodGroup: 'O+'
    });

    // Dispatch Administrator Email Notification asynchronously (does not block registration)
    sendRegistrationEmail(user).catch(err => {
      console.error('[AUTH REGISTER EMAIL ERROR]:', err.message || err);
    });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error: err.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get JWT token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user) {
      // Record failed attempt
      await LoginAttempt.create({
        email: cleanEmail,
        ipAddress,
        success: false,
        reason: 'Email not registered'
      });

      // Check recent failed attempts for security alert
      const windowStart = new Date(Date.now() - 15 * 60 * 1000);
      const recentFailedCount = await LoginAttempt.countDocuments({
        email: cleanEmail,
        success: false,
        attemptedAt: { $gte: windowStart }
      });

      if (recentFailedCount >= 3) {
        sendFailedLoginEmail(cleanEmail, recentFailedCount).catch(err => {
          console.error('[AUTH FAILED LOGIN EMAIL ERROR]:', err.message || err);
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Email not registered.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Record failed attempt
      await LoginAttempt.create({
        email: cleanEmail,
        ipAddress,
        success: false,
        reason: 'Incorrect password'
      });

      const windowStart = new Date(Date.now() - 15 * 60 * 1000);
      const recentFailedCount = await LoginAttempt.countDocuments({
        email: cleanEmail,
        success: false,
        attemptedAt: { $gte: windowStart }
      });

      if (recentFailedCount >= 3) {
        sendFailedLoginEmail(cleanEmail, recentFailedCount).catch(err => {
          console.error('[AUTH FAILED LOGIN EMAIL ERROR]:', err.message || err);
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Incorrect password.'
      });
    }

    // Record successful login
    await LoginAttempt.create({
      email: cleanEmail,
      ipAddress,
      success: true,
      reason: 'Authenticated'
    });

    // Update lastLogin timestamp
    user.lastLogin = new Date();
    await user.save();

    // Dispatch Administrator Login Notification asynchronously
    sendLoginEmail(user).catch(err => {
      console.error('[AUTH LOGIN EMAIL ERROR]:', err.message || err);
    });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.',
      error: err.message
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get currently logged in user info
router.get('/me', authenticate, async (req, res) => {
  try {
    const profile = await PatientProfile.findOne({ user: req.user._id });
    return res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone
      },
      profile
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user data.',
      error: err.message
    });
  }
});

module.exports = router;
