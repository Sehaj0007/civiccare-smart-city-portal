import express from 'express';
import {
  register,
  login,
  adminLogin,
  getMe,
  logout,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  registerValidation,
  loginValidation,
  validate,
} from '../middleware/validation.js';

const router = express.Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/admin-login', loginValidation, validate, adminLogin);
router.get('/me', protect, getMe);
router.get('/logout', logout);

export default router;
