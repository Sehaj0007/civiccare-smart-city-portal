import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  assignTeam,
  escalateComplaint,
  updateStatus,
  getDepartmentComplaints,
} from '../controllers/adminController.js';
import {
  assignTeamValidation,
  escalateComplaintValidation,
  updateStatusValidation,
  validate,
} from '../middleware/validation.js';

const router = express.Router();

// All routes require admin authorization
router.use(protect, authorize('ADMIN'));

router.post('/assign-team', assignTeamValidation, validate, assignTeam);
router.post('/escalate', escalateComplaintValidation, validate, escalateComplaint);
router.patch('/complaints/:id/status', updateStatusValidation, validate, updateStatus);
router.get('/complaints/department/:category', getDepartmentComplaints);

export default router;
