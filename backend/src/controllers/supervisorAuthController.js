import Supervisor from '../models/Supervisor.js';
import User from '../models/User.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import { catchAsyncErrors } from '../utils/errorUtils.js';

// @desc    Create new supervisor
// @route   POST /api/supervisors
// @access  Private (ADMIN only)
export const createSupervisor = catchAsyncErrors(async (req, res, next) => {
  const { userId, designation, department, assignedZones, supervisoryLevel } = req.body;

  // Validate user exists
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  // Check if supervisor already exists for this user
  const existingSupervisor = await Supervisor.findOne({ userId });
  if (existingSupervisor) {
    return next(new ErrorHandler('Supervisor already exists for this user', 400));
  }

  const supervisor = await Supervisor.create({
    userId,
    name: user.name,
    email: user.email,
    phone: user.phone,
    designation: designation || 'Supervisor',
    department,
    assignedZones: assignedZones || [],
    supervisoryLevel: supervisoryLevel || 'SENIOR',
  });

  res.status(201).json({
    success: true,
    message: 'Supervisor created successfully',
    supervisor,
  });
});

// @desc    Get all supervisors
// @route   GET /api/supervisors
// @access  Private (ADMIN only)
export const getAllSupervisors = catchAsyncErrors(async (req, res, next) => {
  const { department, isActive, page = 1, limit = 10 } = req.query;

  let filters = {};
  if (department) filters.department = department;
  if (isActive !== undefined) filters.isActive = isActive === 'true';

  const skip = (page - 1) * limit;

  const supervisors = await Supervisor.find(filters)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('userId', 'name email phone')
    .populate('department')
    .sort({ createdAt: -1 });

  const total = await Supervisor.countDocuments(filters);

  res.status(200).json({
    success: true,
    supervisors,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limit: parseInt(limit),
    },
  });
});

// @desc    Get supervisor by ID
// @route   GET /api/supervisors/:id
// @access  Private
export const getSupervisorById = catchAsyncErrors(async (req, res, next) => {
  const supervisor = await Supervisor.findById(req.params.id)
    .populate('userId', 'name email phone')
    .populate('department');

  if (!supervisor) {
    return next(new ErrorHandler('Supervisor not found', 404));
  }

  res.status(200).json({
    success: true,
    supervisor,
  });
});

// @desc    Get supervisor by user ID
// @route   GET /api/supervisors/user/:userId
// @access  Private
export const getSupervisorByUserId = catchAsyncErrors(async (req, res, next) => {
  const supervisor = await Supervisor.findOne({ userId: req.params.userId })
    .populate('userId', 'name email phone')
    .populate('department');

  if (!supervisor) {
    return next(new ErrorHandler('Supervisor not found for this user', 404));
  }

  res.status(200).json({
    success: true,
    supervisor,
  });
});

// @desc    Update supervisor
// @route   PUT /api/supervisors/:id
// @access  Private (ADMIN or SUPERVISOR)
export const updateSupervisor = catchAsyncErrors(async (req, res, next) => {
  const { designation, department, assignedZones, supervisoryLevel, isActive } = req.body;

  let supervisor = await Supervisor.findById(req.params.id);

  if (!supervisor) {
    return next(new ErrorHandler('Supervisor not found', 404));
  }

  if (designation) supervisor.designation = designation;
  if (department) supervisor.department = department;
  if (assignedZones) supervisor.assignedZones = assignedZones;
  if (supervisoryLevel) supervisor.supervisoryLevel = supervisoryLevel;
  if (isActive !== undefined) supervisor.isActive = isActive;

  supervisor = await supervisor.save();

  res.status(200).json({
    success: true,
    message: 'Supervisor updated successfully',
    supervisor,
  });
});

// @desc    Delete supervisor
// @route   DELETE /api/supervisors/:id
// @access  Private (ADMIN only)
export const deleteSupervisor = catchAsyncErrors(async (req, res, next) => {
  const supervisor = await Supervisor.findByIdAndDelete(req.params.id);

  if (!supervisor) {
    return next(new ErrorHandler('Supervisor not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Supervisor deleted successfully',
  });
});

// @desc    Update supervisor permissions
// @route   PUT /api/supervisors/:id/permissions
// @access  Private (ADMIN only)
export const updateSupervisorPermissions = catchAsyncErrors(async (req, res, next) => {
  const { permissions } = req.body;

  if (!Array.isArray(permissions)) {
    return next(new ErrorHandler('Permissions must be an array', 400));
  }

  let supervisor = await Supervisor.findById(req.params.id);

  if (!supervisor) {
    return next(new ErrorHandler('Supervisor not found', 404));
  }

  supervisor.permissions = permissions;
  supervisor = await supervisor.save();

  res.status(200).json({
    success: true,
    message: 'Permissions updated successfully',
    supervisor,
  });
});

// @desc    Update supervisor performance metrics
// @route   PUT /api/supervisors/:id/metrics
// @access  Private (SYSTEM only)
export const updateSupervisorMetrics = catchAsyncErrors(async (req, res, next) => {
  const { totalComplaints, resolvedComplaints, slaComplianceRate, averageResolutionTime, teamRating } =
    req.body;

  let supervisor = await Supervisor.findById(req.params.id);

  if (!supervisor) {
    return next(new ErrorHandler('Supervisor not found', 404));
  }

  supervisor.performanceMetrics = {
    totalComplaints: totalComplaints || supervisor.performanceMetrics.totalComplaints,
    resolvedComplaints: resolvedComplaints || supervisor.performanceMetrics.resolvedComplaints,
    slaComplianceRate: slaComplianceRate || supervisor.performanceMetrics.slaComplianceRate,
    averageResolutionTime: averageResolutionTime || supervisor.performanceMetrics.averageResolutionTime,
    teamRating: teamRating || supervisor.performanceMetrics.teamRating,
    lastUpdated: new Date(),
  };

  supervisor = await supervisor.save();

  res.status(200).json({
    success: true,
    message: 'Metrics updated successfully',
    supervisor,
  });
});

// @desc    Add activity log entry
// @route   POST /api/supervisors/:id/activity
// @access  Private
export const addActivityLog = catchAsyncErrors(async (req, res, next) => {
  const { action, details } = req.body;

  let supervisor = await Supervisor.findById(req.params.id);

  if (!supervisor) {
    return next(new ErrorHandler('Supervisor not found', 404));
  }

  supervisor.activityLog.push({
    action,
    details,
    timestamp: new Date(),
  });

  supervisor = await supervisor.save();

  res.status(201).json({
    success: true,
    message: 'Activity logged successfully',
    activity: supervisor.activityLog[supervisor.activityLog.length - 1],
  });
});

// @desc    Update last login
// @route   PUT /api/supervisors/:id/last-login
// @access  Private
export const updateLastLogin = catchAsyncErrors(async (req, res, next) => {
  let supervisor = await Supervisor.findOne({ userId: req.params.id });

  if (!supervisor) {
    return next(new ErrorHandler('Supervisor not found', 404));
  }

  supervisor.lastLogin = new Date();
  supervisor = await supervisor.save();

  res.status(200).json({
    success: true,
    message: 'Last login updated',
  });
});

// @desc    Get supervisor dashboard data
// @route   GET /api/supervisors/:id/dashboard
// @access  Private
export const getSupervisorDashboard = catchAsyncErrors(async (req, res, next) => {
  const supervisor = await Supervisor.findById(req.params.id)
    .populate('userId', 'name email phone')
    .populate('department');

  if (!supervisor) {
    return next(new ErrorHandler('Supervisor not found', 404));
  }

  res.status(200).json({
    success: true,
    dashboard: {
      supervisor: {
        _id: supervisor._id,
        name: supervisor.name,
        email: supervisor.email,
        designation: supervisor.designation,
        level: supervisor.supervisoryLevel,
      },
      metrics: supervisor.performanceMetrics,
      assignedZones: supervisor.assignedZones,
      permissions: supervisor.permissions,
      lastLogin: supervisor.lastLogin,
    },
  });
});
