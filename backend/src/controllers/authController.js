import User from '../models/User.js';
import Supervisor from '../models/Supervisor.js';
import { generateToken } from '../utils/tokenUtils.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import { catchAsyncErrors } from '../utils/errorUtils.js';
import { generateCSRFToken } from '../middleware/csrf.js';

// Track login attempts (in production, use Redis)
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes
const SHOULD_ENFORCE_LOCKOUT = false;

const serializeUser = (user) => ({
  _id: user._id,
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  department: user.department,
  assignedTeamId: user.assignedTeamId || null,
});

// @desc    Register user
// @route   POST /api/auth/register
export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  // Validate input
  if (!name || !email || !password || !phone) {
    return next(new ErrorHandler('Please provide all required fields', 400));
  }

  // Validate password strength
  if (password.length < 8) {
    return next(new ErrorHandler('Password must be at least 8 characters long', 400));
  }

  // Check if user already exists
  let user = await User.findOne({ email });
  if (user) {
    return next(new ErrorHandler('User already exists', 400));
  }

  // Create user
  user = await User.create({
    name,
    email,
    password,
    phone,
    role: 'USER',
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user: serializeUser(user),
  });
});

// @desc    Login user
// @route   POST /api/auth/login
export const login = catchAsyncErrors(async (req, res, next) => {
  const email = req.body?.email?.trim()?.toLowerCase();
  const password = req.body?.password;
  const clientIP = req.ip || req.connection.remoteAddress;

  // Check rate limiting (production only)
  const attempts = loginAttempts.get(clientIP) || { count: 0, lockoutUntil: 0 };
  const now = Date.now();

  if (SHOULD_ENFORCE_LOCKOUT && attempts.lockoutUntil > now) {
    const remainingTime = Math.ceil((attempts.lockoutUntil - now) / 1000 / 60);
    return next(new ErrorHandler(`Too many failed attempts. Try again in ${remainingTime} minutes.`, 429));
  }

  if (!email || !password) {
    return next(new ErrorHandler('Please provide email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    if (SHOULD_ENFORCE_LOCKOUT) {
      // Increment failed attempts
      attempts.count++;
      if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
        attempts.lockoutUntil = now + LOCKOUT_TIME;
      }
      loginAttempts.set(clientIP, attempts);
    }
    return next(new ErrorHandler('Invalid email or password', 401));
  }

  // Check password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    if (SHOULD_ENFORCE_LOCKOUT) {
      // Increment failed attempts
      attempts.count++;
      if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
        attempts.lockoutUntil = now + LOCKOUT_TIME;
      }
      loginAttempts.set(clientIP, attempts);
    }
    return next(new ErrorHandler('Invalid email or password', 401));
  }

  // Reset attempts on successful login
  loginAttempts.delete(clientIP);

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    token,
    user: serializeUser(user),
  });
});

// @desc    Admin login
// @route   POST /api/auth/admin-login
export const adminLogin = catchAsyncErrors(async (req, res, next) => {
  const email = req.body?.email?.trim()?.toLowerCase();
  const password = req.body?.password;
  const clientIP = req.ip || req.connection.remoteAddress;

  // Check rate limiting (production only)
  const attempts = loginAttempts.get(clientIP) || { count: 0, lockoutUntil: 0 };
  const now = Date.now();

  if (SHOULD_ENFORCE_LOCKOUT && attempts.lockoutUntil > now) {
    const remainingTime = Math.ceil((attempts.lockoutUntil - now) / 1000 / 60);
    return next(new ErrorHandler(`Too many failed attempts. Try again in ${remainingTime} minutes.`, 429));
  }

  if (!email || !password) {
    return next(new ErrorHandler('Please provide email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    if (SHOULD_ENFORCE_LOCKOUT) {
      // Increment failed attempts
      attempts.count++;
      if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
        attempts.lockoutUntil = now + LOCKOUT_TIME;
      }
      loginAttempts.set(clientIP, attempts);
    }
    return next(new ErrorHandler('Invalid email or password', 401));
  }

  if (user.role !== 'ADMIN') {
    if (SHOULD_ENFORCE_LOCKOUT) {
      // Increment failed attempts
      attempts.count++;
      if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
        attempts.lockoutUntil = now + LOCKOUT_TIME;
      }
      loginAttempts.set(clientIP, attempts);
    }
    return next(new ErrorHandler('Access denied. Admin privileges required.', 403));
  }

  // Check password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    if (SHOULD_ENFORCE_LOCKOUT) {
      // Increment failed attempts
      attempts.count++;
      if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
        attempts.lockoutUntil = now + LOCKOUT_TIME;
      }
      loginAttempts.set(clientIP, attempts);
    }
    return next(new ErrorHandler('Invalid email or password', 401));
  }

  // Reset attempts on successful login
  loginAttempts.delete(clientIP);

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    token,
    user: serializeUser(user),
  });
});

// @desc    Login supervisor
// @route   POST /api/auth/supervisor-login
export const supervisorLogin = catchAsyncErrors(async (req, res, next) => {
  const email = req.body?.email?.trim()?.toLowerCase();
  const password = req.body?.password;

  // Validate input
  if (!email || !password) {
    return next(new ErrorHandler('Please provide email and password', 400));
  }

  // Find user and get password field
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorHandler('Invalid email or password', 401));
  }

  // Check if user has a supervisor profile
  const supervisor = await Supervisor.findOne({ userId: user._id }).populate('userId');

  if (!supervisor) {
    return next(new ErrorHandler('You are not registered as a supervisor', 403));
  }

  // Verify password
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    return next(new ErrorHandler('Invalid email or password', 401));
  }

  // Update last login
  supervisor.lastLogin = new Date();
  await supervisor.save();

  // Generate token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    token,
    user: {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: 'SUPERVISOR',
    },
    supervisor: {
      _id: supervisor._id,
      designation: supervisor.designation,
      department: supervisor.department,
      supervisoryLevel: supervisor.supervisoryLevel,
      assignedZones: supervisor.assignedZones,
      permissions: supervisor.permissions,
      performanceMetrics: supervisor.performanceMetrics,
      lastLogin: supervisor.lastLogin,
    },
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
export const getMe = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

// @desc    Get CSRF token
// @route   GET /api/auth/csrf-token
export const getCSRFToken = catchAsyncErrors(async (req, res, next) => {
  const csrfToken = generateCSRFToken();

  res.status(200).json({
    success: true,
    csrfToken,
  });
});

// @desc    Logout user
// @route   GET /api/auth/logout
export const logout = catchAsyncErrors(async (req, res, next) => {
  // In a stateless JWT system, logout is handled on the client side
  // by removing the token. We can optionally blacklist the token here.
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});
