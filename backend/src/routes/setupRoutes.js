import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createTeam,
  getAllTeams,
  getTeamsByCategory,
  updateTeam,
  deleteTeam,
  createWardOffice,
  getAllWardOffices,
  getWardOfficeByLocality,
  updateWardOffice,
  deleteWardOffice,
} from '../controllers/setupController.js';
import {
  createTeamValidation,
  updateTeamValidation,
  createWardOfficeValidation,
  updateWardOfficeValidation,
  validate,
} from '../middleware/validation.js';

const router = express.Router();

// Labour Team Routes
router.post('/teams', protect, authorize('ADMIN'), createTeamValidation, validate, createTeam);
router.get('/teams', protect, authorize('ADMIN'), getAllTeams);
router.get('/teams/by-category/:category', protect, authorize('ADMIN'), getTeamsByCategory);
router.patch('/teams/:id', protect, authorize('ADMIN'), updateTeamValidation, validate, updateTeam);
router.delete('/teams/:id', protect, authorize('ADMIN'), deleteTeam);

// Ward Office Routes
router.post('/ward-offices', protect, authorize('ADMIN'), createWardOfficeValidation, validate, createWardOffice);
router.get('/ward-offices', protect, authorize('ADMIN'), getAllWardOffices);
router.get('/ward-offices/locality/:locality', protect, authorize('ADMIN'), getWardOfficeByLocality);
router.patch('/ward-offices/:id', protect, authorize('ADMIN'), updateWardOfficeValidation, validate, updateWardOffice);
router.delete('/ward-offices/:id', protect, authorize('ADMIN'), deleteWardOffice);

export default router;
