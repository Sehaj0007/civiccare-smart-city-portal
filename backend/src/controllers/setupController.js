import Complaint from '../models/Complaint.js';
import LabourTeam from '../models/LabourTeam.js';
import WardOffice from '../models/WardOffice.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import { catchAsyncErrors } from '../utils/errorUtils.js';

// @desc    Create labour team
// @route   POST /api/teams
export const createTeam = catchAsyncErrors(async (req, res, next) => {
  const { teamName, departmentCategory, contactNumber, email, availabilityStatus } = req.body;

  const team = await LabourTeam.create({
    teamName,
    departmentCategory,
    contactNumber,
    email: email || '',
    availabilityStatus: availabilityStatus || 'AVAILABLE',
  });

  res.status(201).json({
    success: true,
    team,
  });
});

// @desc    Get all teams
// @route   GET /api/teams
export const getAllTeams = catchAsyncErrors(async (req, res, next) => {
  const { departmentCategory } = req.query;

  let query = {};
  if (departmentCategory) {
    query.departmentCategory = departmentCategory;
  }

  const teams = await LabourTeam.find(query).populate('assignedComplaints');

  res.status(200).json({
    success: true,
    count: teams.length,
    teams,
  });
});

// @desc    Get team by category
// @route   GET /api/teams/by-category/:category
export const getTeamsByCategory = catchAsyncErrors(async (req, res, next) => {
  const { category } = req.params;

  // Map complaint categories to labour team categories
  const categoryMapping = {
    'POTHOLES': 'ROAD_MAINTENANCE',
  };

  const mappedCategory = categoryMapping[category] || category;

  const teams = await LabourTeam.find({ departmentCategory: mappedCategory });

  res.status(200).json({
    success: true,
    teams,
  });
});

// @desc    Update team
// @route   PATCH /api/teams/:id
export const updateTeam = catchAsyncErrors(async (req, res, next) => {
  const team = await LabourTeam.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!team) {
    return next(new ErrorHandler('Team not found', 404));
  }

  res.status(200).json({
    success: true,
    team,
  });
});

// @desc    Delete team
// @route   DELETE /api/teams/:id
export const deleteTeam = catchAsyncErrors(async (req, res, next) => {
  const team = await LabourTeam.findByIdAndDelete(req.params.id);

  if (!team) {
    return next(new ErrorHandler('Team not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Team deleted successfully',
  });
});

// @desc    Create ward office
// @route   POST /api/ward-offices
export const createWardOffice = catchAsyncErrors(async (req, res, next) => {
  const { wardNumber, officeName, locality, email, phone, address } = req.body;

  const wardOffice = await WardOffice.create({
    wardNumber,
    officeName,
    locality: locality || [],
    email,
    phone,
    address: address || '',
  });

  res.status(201).json({
    success: true,
    wardOffice,
  });
});

// @desc    Get all ward offices
// @route   GET /api/ward-offices
export const getAllWardOffices = catchAsyncErrors(async (req, res, next) => {
  const wardOffices = await WardOffice.find();

  res.status(200).json({
    success: true,
    count: wardOffices.length,
    wardOffices,
  });
});

// @desc    Get ward office by locality
// @route   GET /api/ward-offices/locality/:locality
export const getWardOfficeByLocality = catchAsyncErrors(async (req, res, next) => {
  const { locality } = req.params;

  const wardOffice = await WardOffice.findOne({ locality: { $in: [locality] } });

  if (!wardOffice) {
    return next(new ErrorHandler('Ward office not found for this locality', 404));
  }

  res.status(200).json({
    success: true,
    wardOffice,
  });
});

// @desc    Update ward office
// @route   PATCH /api/ward-offices/:id
export const updateWardOffice = catchAsyncErrors(async (req, res, next) => {
  const wardOffice = await WardOffice.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!wardOffice) {
    return next(new ErrorHandler('Ward office not found', 404));
  }

  res.status(200).json({
    success: true,
    wardOffice,
  });
});

// @desc    Delete ward office
// @route   DELETE /api/ward-offices/:id
export const deleteWardOffice = catchAsyncErrors(async (req, res, next) => {
  const wardOffice = await WardOffice.findByIdAndDelete(req.params.id);

  if (!wardOffice) {
    return next(new ErrorHandler('Ward office not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Ward office deleted successfully',
  });
});
