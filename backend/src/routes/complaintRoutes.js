import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createComplaint,
  getUserComplaints,
  getComplaintById,
  getAllComplaints,
  updateComplaint,
  addFeedback,
  getComplaintStats,
} from '../controllers/complaintController.js';
import {
  complaintValidation,
  feedbackValidation,
  validate,
} from '../middleware/validation.js';

const router = express.Router();

// User routes
router.post('/', protect, complaintValidation, validate, createComplaint);
router.get('/user/:userId', protect, getUserComplaints);
router.get('/detail/:id', protect, getComplaintById);
router.patch('/:id/feedback', protect, feedbackValidation, validate, addFeedback);

// Admin routes
router.get('/', protect, authorize('ADMIN', 'SUPERVISOR'), getAllComplaints);
router.patch('/:id', protect, authorize('ADMIN'), updateComplaint);
router.get('/stats/overview', protect, authorize('ADMIN', 'SUPERVISOR'), getComplaintStats);

export default router;
