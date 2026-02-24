import express from 'express';
import {
  getSupervisorDashboard,
  getOverdueAlerts,
  getSLAViolationTrends,
  getAreaHeatmap,
  getActivityTimeline,
  getDepartmentComparison,
  exportSupervisorReport,
} from '../controllers/supervisorController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('SUPERVISOR', 'ADMIN'));

router.get('/dashboard', getSupervisorDashboard);
router.get('/alerts/overdue', getOverdueAlerts);
router.get('/analytics/sla-violations', getSLAViolationTrends);
router.get('/analytics/heatmap', getAreaHeatmap);
router.get('/activity/timeline', getActivityTimeline);
router.get('/analytics/department-comparison', getDepartmentComparison);
router.get('/reports/export', exportSupervisorReport);

export default router;
