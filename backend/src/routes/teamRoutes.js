import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  addTeamMember,
  removeTeamMember,
  getTeamPerformance,
  bulkAssignComplaints,
} from '../controllers/teamController.js';

const router = express.Router();

// Team management routes (Admin only)
router.post('/', protect, authorize('ADMIN'), createTeam);
router.get('/', protect, authorize('ADMIN', 'SUPERVISOR'), getAllTeams);
router.get('/:id', protect, authorize('ADMIN', 'SUPERVISOR'), getTeamById);
router.patch('/:id', protect, authorize('ADMIN'), updateTeam);

// Team member routes
router.post('/:id/members', protect, authorize('ADMIN'), addTeamMember);
router.delete('/:id/members/:userId', protect, authorize('ADMIN'), removeTeamMember);

// Performance routes
router.get('/:id/performance', protect, authorize('ADMIN', 'SUPERVISOR'), getTeamPerformance);

// Bulk operations
router.post('/:id/bulk-assign', protect, authorize('ADMIN'), bulkAssignComplaints);

export default router;
