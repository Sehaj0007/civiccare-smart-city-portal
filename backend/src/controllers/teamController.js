import Team from '../models/Team.js';
import Department from '../models/Department.js';
import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import { catchAsyncErrors } from '../utils/errorUtils.js';

// @desc    Create a new team
// @route   POST /api/teams
export const createTeam = catchAsyncErrors(async (req, res, next) => {
  const { name, departmentId, description, maxCapacity, members } = req.body;

  const department = await Department.findById(departmentId);
  if (!department) {
    return next(new ErrorHandler('Department not found', 404));
  }

  const team = await Team.create({
    name,
    department: departmentId,
    description,
    maxCapacity: maxCapacity || 5,
    members: members || [],
    currentLoad: 0,
    availabilityStatus: 'AVAILABLE',
  });

  // Add team to department
  department.teams.push(team._id);
  await department.save();

  await team.populate('members', 'name email role');
  await team.populate('department', 'name displayName');

  res.status(201).json({
    success: true,
    team,
  });
});

// @desc    Get all teams
// @route   GET /api/teams
export const getAllTeams = catchAsyncErrors(async (req, res, next) => {
  const { departmentId, availabilityStatus, page = 1, limit = 10 } = req.query;

  let query = {};
  if (departmentId) query.department = departmentId;
  if (availabilityStatus) query.availabilityStatus = availabilityStatus;
  if (req.user.role === 'ADMIN') {
    query.department = req.user.department;
  }

  const skip = (page - 1) * limit;

  const teams = await Team.find(query)
    .populate('members', 'name email phone')
    .populate('department', 'name displayName')
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Team.countDocuments(query);

  res.status(200).json({
    success: true,
    count: teams.length,
    total,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
    teams,
  });
});

// @desc    Get team by ID
// @route   GET /api/teams/:id
export const getTeamById = catchAsyncErrors(async (req, res, next) => {
  const team = await Team.findById(req.params.id)
    .populate('members', 'name email phone role')
    .populate('assignedComplaints');

  if (!team) {
    return next(new ErrorHandler('Team not found', 404));
  }

  const complaints = await Complaint.find({ assignedTeamId: team._id });

  const stats = {
    totalAssigned: complaints.length,
    resolved: complaints.filter(c => c.status === 'RESOLVED').length,
    pending: complaints.filter(c => c.status === 'PENDING' || c.status === 'ASSIGNED').length,
    inProgress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
    overdue: complaints.filter(c => c.sla?.isOverdue).length,
  };

  res.status(200).json({
    success: true,
    team,
    stats,
  });
});

// @desc    Update team
// @route   PATCH /api/teams/:id
export const updateTeam = catchAsyncErrors(async (req, res, next) => {
  const { name, description, maxCapacity, availabilityStatus } = req.body;

  let team = await Team.findById(req.params.id);
  if (!team) {
    return next(new ErrorHandler('Team not found', 404));
  }

  if (name) team.name = name;
  if (description) team.description = description;
  if (maxCapacity) team.maxCapacity = maxCapacity;
  if (availabilityStatus) team.availabilityStatus = availabilityStatus;

  await team.save();

  res.status(200).json({
    success: true,
    team,
  });
});

// @desc    Add member to team
// @route   POST /api/teams/:id/members
export const addTeamMember = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.body;

  const team = await Team.findById(req.params.id);
  if (!team) {
    return next(new ErrorHandler('Team not found', 404));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  if (team.members.includes(userId)) {
    return next(new ErrorHandler('User is already a member of this team', 400));
  }

  team.members.push(userId);
  await team.save();

  // Create notification
  await Notification.create({
    recipient: userId,
    type: 'TEAM_NOTIFICATION',
    title: 'Added to Team',
    message: `You have been added to team ${team.name}.`,
    relatedTeam: team._id,
    priority: 'MEDIUM',
  });

  await team.populate('members', 'name email role');

  res.status(200).json({
    success: true,
    team,
    message: `${user.name} added to team successfully`,
  });
});

// @desc    Remove member from team
// @route   DELETE /api/teams/:id/members/:userId
export const removeTeamMember = catchAsyncErrors(async (req, res, next) => {
  const { id, userId } = req.params;

  let team = await Team.findById(id);
  if (!team) {
    return next(new ErrorHandler('Team not found', 404));
  }

  team.members = team.members.filter(memberId => memberId.toString() !== userId);
  await team.save();

  const user = await User.findById(userId);

  // Create notification
  await Notification.create({
    recipient: userId,
    type: 'TEAM_NOTIFICATION',
    title: 'Removed from Team',
    message: `You have been removed from team ${team.name}.`,
    relatedTeam: team._id,
    priority: 'MEDIUM',
  });

  await team.populate('members', 'name email role');

  res.status(200).json({
    success: true,
    team,
    message: `${user.name} removed from team successfully`,
  });
});

// @desc    Get team performance metrics
// @route   GET /api/teams/:id/performance
export const getTeamPerformance = catchAsyncErrors(async (req, res, next) => {
  const team = await Team.findById(req.params.id).populate('assignedComplaints');

  if (!team) {
    return next(new ErrorHandler('Team not found', 404));
  }

  const complaints = await Complaint.find({ assignedTeamId: team._id });

  let totalResolutionTime = 0;
  let resolvedCount = 0;
  let slaCompliant = 0;

  complaints.forEach(complaint => {
    if (complaint.resolvedAt) {
      totalResolutionTime += complaint.resolutionTime || 0;
      resolvedCount += 1;

      if (!complaint.sla?.isOverdue) {
        slaCompliant += 1;
      }
    }
  });

  const performance = {
    totalAssigned: complaints.length,
    resolved: complaints.filter(c => c.status === 'RESOLVED').length,
    pending: complaints.filter(c => c.status === 'PENDING' || c.status === 'ASSIGNED').length,
    inProgress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
    overdue: complaints.filter(c => c.sla?.isOverdue).length,
    averageResolutionTime: resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0,
    slaComplianceRate: complaints.length > 0 ? (slaCompliant / complaints.length) * 100 : 0,
    resolutionRate:
      complaints.length > 0
        ? ((complaints.filter(c => c.status === 'RESOLVED').length / complaints.length) * 100).toFixed(2)
        : 0,
    capacityUtilization: ((team.currentLoad / team.maxCapacity) * 100).toFixed(2),
  };

  res.status(200).json({
    success: true,
    performance,
    teamStats: {
      name: team.name,
      currentLoad: team.currentLoad,
      maxCapacity: team.maxCapacity,
      memberCount: team.members.length,
      availabilityStatus: team.availabilityStatus,
    },
  });
});

// @desc    Bulk assign complaints to team
// @route   POST /api/teams/:id/bulk-assign
export const bulkAssignComplaints = catchAsyncErrors(async (req, res, next) => {
  const { complaintIds, remarks } = req.body;

  const team = await Team.findById(req.params.id);
  if (!team) {
    return next(new ErrorHandler('Team not found', 404));
  }

  const assignedComplaints = [];
  const failedComplaints = [];

  for (const complaintId of complaintIds) {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      failedComplaints.push({ id: complaintId, reason: 'Not found' });
      continue;
    }

    if (team.currentLoad >= team.maxCapacity) {
      failedComplaints.push({ id: complaintId, reason: 'Team at capacity' });
      continue;
    }

    complaint.assignedTeamId = team._id;
    complaint.assignedByAdminId = req.user._id;
    complaint.status = 'ASSIGNED';
    complaint.timeline.push({
      status: 'ASSIGNED',
      timestamp: new Date(),
      ChangedBy: req.user._id,
    });

    if (remarks) {
      complaint.remarks.push({
        addedBy: req.user._id,
        text: remarks,
        timestamp: new Date(),
      });
    }

    await complaint.save();
    team.assignedComplaints.push(complaint._id);
    team.currentLoad += 1;
    assignedComplaints.push(complaint);
  }

  await team.updateAvailabilityStatus();

  res.status(200).json({
    success: true,
    assigned: assignedComplaints.length,
    failed: failedComplaints.length,
    assignedComplaints,
    failedComplaints,
  });
});
