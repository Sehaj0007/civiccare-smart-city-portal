import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  adminLogin,
  supervisorLogin,
  getMe,
  logout,
  getCSRFToken,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  registerValidation,
  loginValidation,
  validate,
} from '../middleware/validation.js';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many authentication attempts. Please wait a few minutes and try again.',
  skip: () => true,
});

router.get('/csrf-token', getCSRFToken);
router.post('/register', registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/admin-login', authLimiter, loginValidation, validate, adminLogin);
router.post('/supervisor-login', authLimiter, loginValidation, validate, supervisorLogin);
router.get('/me', protect, getMe);
router.get('/logout', logout);

export default router;
