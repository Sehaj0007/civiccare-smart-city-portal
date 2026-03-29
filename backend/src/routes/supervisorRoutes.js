import express from 'express';
import {
  createSupervisor,
  getAllSupervisors,
  getSupervisorById,
  getSupervisorByUserId,
  updateSupervisor,
  deleteSupervisor,
  updateSupervisorPermissions,
  updateSupervisorMetrics,
  addActivityLog,
  updateLastLogin,
  getSupervisorDashboard,
} from '../controllers/supervisorAuthController.js';
import {
  getSupervisorDashboard as getSupervisorAnalyticsOverview,
  getAreaHeatmap,
  getOverdueAlerts,
} from '../controllers/supervisorController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protected routes - Require authentication
router.use(protect);

// Supervisor analytics routes (shared with admin metrics source)
router.get('/analytics/overview', authorize('SUPERVISOR', 'ADMIN'), getSupervisorAnalyticsOverview);
router.get('/analytics/heatmap', authorize('SUPERVISOR', 'ADMIN'), getAreaHeatmap);
router.get('/analytics/overdue-alerts', authorize('SUPERVISOR', 'ADMIN'), getOverdueAlerts);

// Get supervisor dashboard
router.get('/:id/dashboard', getSupervisorDashboard);

// Get supervisor by user ID
router.get('/user/:userId', getSupervisorByUserId);

// Get supervisor by ID
router.get('/:id', getSupervisorById);

// Update last login
router.put('/:id/last-login', updateLastLogin);

// Add activity log
router.post('/:id/activity', addActivityLog);

// Admin only routes
router.use(authorize('ADMIN'));

// Create supervisor
router.post('/', createSupervisor);

// Get all supervisors
router.get('/', getAllSupervisors);

// Update supervisor
router.put('/:id', updateSupervisor);

// Update supervisor permissions
router.put('/:id/permissions', updateSupervisorPermissions);

// Update supervisor metrics
router.put('/:id/metrics', updateSupervisorMetrics);

// Delete supervisor
router.delete('/:id', deleteSupervisor);

export default router;
