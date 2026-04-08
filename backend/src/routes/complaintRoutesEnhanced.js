import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createComplaintEnhanced,
  getAllComplaintsEnhanced,
  updateStatusWithSLA,
  assignToTeam,
  getComplaintAnalytics,
  exportComplaintsReport,
} from '../controllers/complaintControllerEnhanced.js';

const router = express.Router();

// User routes
router.post('/create', protect, authorize('USER'), createComplaintEnhanced);

// Admin and Supervisor routes
router.get('/', protect, authorize('ADMIN', 'SUPERVISOR'), getAllComplaintsEnhanced);
router.patch('/:id/status', protect, authorize('ADMIN', 'SUPERVISOR'), updateStatusWithSLA);
router.patch('/:id/assign-team', protect, authorize('ADMIN', 'SUPERVISOR'), assignToTeam);

// Analytics routes
router.get('/analytics/summary', protect, authorize('ADMIN', 'SUPERVISOR'), getComplaintAnalytics);
router.get('/export/pdf', protect, authorize('ADMIN', 'SUPERVISOR'), exportComplaintsReport);

export default router;
