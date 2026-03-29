import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getStaffDashboard, updateStaffComplaintStatus } from '../controllers/staffController.js';

const router = express.Router();

router.get('/dashboard', protect, authorize('TEAM_MEMBER'), getStaffDashboard);
router.patch('/complaints/:id/status', protect, authorize('TEAM_MEMBER'), updateStaffComplaintStatus);

export default router;
