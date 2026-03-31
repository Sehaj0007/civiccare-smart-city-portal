import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getStaffDashboard,
  updateStaffComplaintStatus,
  sendStaffCompletionEmail,
} from '../controllers/staffController.js';

const router = express.Router();

router.get('/dashboard', protect, authorize('TEAM_MEMBER'), getStaffDashboard);
router.patch('/complaints/:id/status', protect, authorize('TEAM_MEMBER'), updateStaffComplaintStatus);
router.post('/complaints/:id/send-completion-email', protect, authorize('TEAM_MEMBER'), sendStaffCompletionEmail);

export default router;
