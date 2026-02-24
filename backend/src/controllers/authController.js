import User from '../models/User.js';
import { generateToken } from '../utils/tokenUtils.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import { catchAsyncErrors } from '../utils/errorUtils.js';

// @desc    Register user
// @route   POST /api/auth/register
export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

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
    user,
  });
});

// @desc    Login user
// @route   POST /api/auth/login
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorHandler('Invalid email or password', 401));
  }

  // Check password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return next(new ErrorHandler('Invalid email or password', 401));
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    token,
    user,
  });
});

// @desc    Admin login
// @route   POST /api/auth/admin-login
export const adminLogin = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorHandler('Invalid email or password', 401));
  }

  if (user.role !== 'ADMIN') {
    return next(new ErrorHandler('Only admins can login here', 401));
  }

  // Check password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return next(new ErrorHandler('Invalid email or password', 401));
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    token,
    user,
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

// @desc    Logout user
// @route   GET /api/auth/logout
export const logout = catchAsyncErrors(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});
