import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import Team from '../models/Team.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import { catchAsyncErrors } from '../utils/errorUtils.js';
import {
  detectCategoryFromDescription,
  detectPriorityFromDescription,
  detectDuplicateComplaints,
  generateTrackingId,
  calculateSLADeadline,
} from '../utils/aiDetection.js';

// @desc    Create a new complaint with AI detection
// @route   POST /api/complaints/create
export const createComplaintEnhanced = catchAsyncErrors(async (req, res, next) => {
  const { complaintType, description, locality, address, city, location, images } = req.body;
  
  // AI: Auto-detect category from description
  const detectedCategory = detectCategoryFromDescription(description);
  
  // AI: Auto-detect priority
  const detectedPriority = detectPriorityFromDescription(description, detectedCategory);
  
  // Generate tracking ID
  const trackingId = generateTrackingId();
  
  // Calculate SLA deadline
  const slaDeadline = calculateSLADeadline(detectedCategory);

  // Check for duplicates
  let isDuplicate = false;
  let duplicateOf = null;
  const duplicates = await detectDuplicateComplaints(Complaint, location, detectedCategory, req.user._id);
  
  if (duplicates.length > 0) {
    isDuplicate = true;
    duplicateOf = duplicates[0]._id;
  }

  // Create complaint
  const complaint = await Complaint.create({
    trackingId,
    category: detectedCategory,
    complaintType,
    title: complaintType,
    description,
    locality,
    address,
    city,
    location,
    images: images || [],
    priority: detectedPriority,
    status: 'PENDING',
    isDuplicate,
    duplicateOf,
    citizenId: req.user._id,
    sla: {
      deadline: slaDeadline,
      responseDeadline: new Date(new Date().getTime() + 6 * 60 * 60 * 1000), // 6 hours
      resolutionDeadline: slaDeadline,
    },
    timeline: [
      {
        status: 'PENDING',
        timestamp: new Date(),
        remarks: 'Complaint registered',
      },
    ],
  });

  await complaint.populate('citizenId', 'name email phone');

  // Create notification
  await Notification.create({
    recipient: req.user._id,
    type: 'COMPLAINT_REGISTERED',
    title: 'Complaint Registered',
    message: `Your complaint ${trackingId} has been registered successfully.`,
    relatedComplaint: complaint._id,
    priority: 'MEDIUM',
    actionUrl: `/complaint/${complaint._id}`,
  });

  // Log activity
  await ActivityLog.create({
    user: req.user._id,
    complaint: complaint._id,
    action: 'CREATED',
    description: 'Complaint created',
    newValue: {
      category: detectedCategory,
      priority: detectedPriority,
      trackingId,
    },
  });

  res.status(201).json({
    success: true,
    complaint,
    metadata: {
      trackingId,
      detectedCategory,
      detectedPriority,
      isDuplicate,
      slaDeadline: slaDeadline,
    },
  });
});

// @desc    Get all complaints with AI metadata
// @route   GET /api/complaints
export const getAllComplaintsEnhanced = catchAsyncErrors(async (req, res, next) => {
  const { status, category, locality, page = 1, limit = 10, isOverdue = false } = req.query;
  let query = {};

  if (status) query.status = status;
  if (category) query.category = category;
  if (locality) query.locality = locality;
  if (isOverdue === 'true') {
    query['sla.isOverdue'] = true;
  }

  // If admin has a specific department, filter by that category
  if (req.user.department && req.user.role === 'ADMIN') {
    query.category = req.user.department;
  }

  const skip = (page - 1) * limit;

  const complaints = await Complaint.find(query)
    .populate('citizenId', 'name email phone')
    .populate('assignedTeamId', 'name performanceMetrics')
    .populate('assignedByAdminId', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  // Calculate time metrics
  const enrichedComplaints = complaints.map(complaint => {
    const now = new Date();
    const createdAt = new Date(complaint.createdAt);
    const responseTime = complaint.responseTime || (complaint.assignedTeamId ? (complaint.timeline?.find(t => t.status === 'ASSIGNED')?.timestamp - createdAt) / (1000 * 60 * 60) : null);
    const resolutionTime = complaint.resolutionTime || (complaint.resolvedAt ? (complaint.resolvedAt - createdAt) / (1000 * 60 * 60) : null);

    return {
      ...complaint.toObject(),
      responseTime,
      resolutionTime,
      isOverdue: complaint.sla?.deadline < now,
    };
  });

  const total = await Complaint.countDocuments(query);

  res.status(200).json({
    success: true,
    count: complaints.length,
    total,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
    complaints: enrichedComplaints,
  });
});

// @desc    Update complaint status with SLA tracking
// @route   PATCH /api/complaints/:id/status
export const updateStatusWithSLA = catchAsyncErrors(async (req, res, next) => {
  const { status, remarks } = req.body;

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    return next(new ErrorHandler('Complaint not found', 404));
  }

  const oldStatus = complaint.status;
  const now = new Date();

  // Calculate response time if moving from PENDING to ASSIGNED
  if (oldStatus === 'PENDING' && status === 'ASSIGNED') {
    complaint.responseTime = (now - complaint.createdAt) / (1000 * 60 * 60); // in hours
  }

  // Check SLA compliance
  if (complaint.sla?.resolutionDeadline) {
    complaint.sla.isOverdue = now > complaint.sla.resolutionDeadline;
  }

  // Update status
  complaint.status = status;
  if (status === 'RESOLVED') {
    complaint.resolvedAt = now;
    complaint.resolutionTime = (now - complaint.createdAt) / (1000 * 60 * 60); // in hours
  }

  // Add to timeline
  complaint.timeline.push({
    status,
    timestamp: now,
    ChangedBy: req.user._id,
    remarks,
  });

  // Add remarks
  if (remarks) {
    complaint.remarks.push({
      addedBy: req.user._id,
      text: remarks,
      timestamp: now,
    });
  }

  await complaint.save();

  // Create notification
  const notificationTypes = {
    ASSIGNED: 'COMPLAINT_ASSIGNED',
    IN_PROGRESS: 'STATUS_UPDATED',
    RESOLVED: 'COMPLAINT_RESOLVED',
  };

  if (notificationTypes[status]) {
    await Notification.create({
      recipient: complaint.citizenId,
      type: notificationTypes[status],
      title: `Complaint ${status}`,
      message: `Your complaint ${complaint.trackingId} status has been updated to ${status}.`,
      relatedComplaint: complaint._id,
      priority: complaint.priority,
      actionUrl: `/complaint/${complaint._id}`,
    });
  }

  // Log activity
  await ActivityLog.create({
    user: req.user._id,
    complaint: complaint._id,
    action: 'STATUS_CHANGED',
    description: `Status changed from ${oldStatus} to ${status}`,
    oldValue: { status: oldStatus },
    newValue: { status },
  });

  res.status(200).json({
    success: true,
    complaint,
    metrics: {
      responseTime: complaint.responseTime,
      resolutionTime: complaint.resolutionTime,
      isOverdue: complaint.sla?.isOverdue,
    },
  });
});

// @desc    Assign complaint to team
// @route   PATCH /api/complaints/:id/assign-team
export const assignToTeam = catchAsyncErrors(async (req, res, next) => {
  const { teamId, remarks } = req.body;

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    return next(new ErrorHandler('Complaint not found', 404));
  }

  const team = await Team.findById(teamId);
  if (!team) {
    return next(new ErrorHandler('Team not found', 404));
  }

  // Check team capacity
  if (team.currentLoad >= team.maxCapacity) {
    return next(new ErrorHandler('Team is at full capacity', 400));
  }

  // Update complaint
  complaint.assignedTeamId = teamId;
  complaint.assignedByAdminId = req.user._id;
  complaint.status = 'ASSIGNED';
  
  const now = new Date();
  complaint.timeline.push({
    status: 'ASSIGNED',
    timestamp: now,
    ChangedBy: req.user._id,
    remarks: `Assigned to team: ${team.name}`,
  });

  if (remarks) {
    complaint.remarks.push({
      addedBy: req.user._id,
      text: remarks,
      timestamp: now,
    });
  }

  await complaint.save();

  // Update team
  team.currentLoad += 1;
  team.assignedComplaints.push(complaint._id);
  team.performanceMetrics.totalAssigned += 1;
  await team.updateAvailabilityStatus();

  // Create notification for citizen
  await Notification.create({
    recipient: complaint.citizenId,
    type: 'COMPLAINT_ASSIGNED',
    title: 'Complaint Assigned',
    message: `Your complaint ${complaint.trackingId} has been assigned to ${team.name}.`,
    relatedComplaint: complaint._id,
    priority: 'HIGH',
    actionUrl: `/complaint/${complaint._id}`,
  });

  // Create notification for team
  team.members.forEach(async (memberId) => {
    await Notification.create({
      recipient: memberId,
      type: 'TEAM_NOTIFICATION',
      title: 'New Complaint Assigned',
      message: `New complaint ${complaint.trackingId} assigned to your team.`,
      relatedComplaint: complaint._id,
      relatedTeam: team._id,
      priority: complaint.priority,
    });
  });

  res.status(200).json({
    success: true,
    complaint,
    team: {
      name: team.name,
      currentLoad: team.currentLoad,
      maxCapacity: team.maxCapacity,
      availabilityStatus: team.availabilityStatus,
    },
  });
});

// @desc    Get complaint analytics
// @route   GET /api/complaints/analytics/summary
export const getComplaintAnalytics = catchAsyncErrors(async (req, res, next) => {
  const { startDate, endDate, category } = req.query;

  let query = {};
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  if (category) query.category = category;

  const complaints = await Complaint.find(query);

  const analytics = {
    totalComplaints: complaints.length,
    byStatus: {},
    byCategory: {},
    byPriority: {},
    averageResolutionTime: 0,
    slaComplianceRate: 0,
    overdue: 0,
    duplicates: complaints.filter(c => c.isDuplicate).length,
  };

  let totalResolutionTime = 0;
  let resolvedCount = 0;
  let slaCompliant = 0;

  complaints.forEach(complaint => {
    // By status
    analytics.byStatus[complaint.status] = (analytics.byStatus[complaint.status] || 0) + 1;

    // By category
    analytics.byCategory[complaint.category] = (analytics.byCategory[complaint.category] || 0) + 1;

    // By priority
    analytics.byPriority[complaint.priority] = (analytics.byPriority[complaint.priority] || 0) + 1;

    // Resolution time
    if (complaint.resolvedAt) {
      totalResolutionTime += complaint.resolutionTime || 0;
      resolvedCount += 1;

      // SLA compliance
      if (!complaint.sla?.isOverdue) {
        slaCompliant += 1;
      }
    }

    // Overdue
    if (complaint.sla?.isOverdue) {
      analytics.overdue += 1;
    }
  });

  analytics.averageResolutionTime = resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0;
  analytics.slaComplianceRate = complaints.length > 0 ? (slaCompliant / complaints.length) * 100 : 0;

  res.status(200).json({
    success: true,
    analytics,
  });
});

// @desc    Export complaints report
// @route   GET /api/complaints/export/pdf
export const exportComplaintsReport = catchAsyncErrors(async (req, res, next) => {
  const { format = 'json', category, status, startDate, endDate } = req.query;

  let query = {};
  if (category) query.category = category;
  if (status) query.status = status;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const complaints = await Complaint.find(query)
    .populate('citizenId', 'name email phone')
    .populate('assignedTeamId', 'name');

  const reportData = complaints.map(c => ({
    trackingId: c.trackingId,
    category: c.category,
    status: c.status,
    priority: c.priority,
    createdAt: c.createdAt,
    resolvedAt: c.resolvedAt,
    assignedTeam: c.assignedTeamId?.name,
    citizen: c.citizenId?.name,
    isOverdue: c.sla?.isOverdue,
  }));

  if (format === 'csv') {
    const csv = [
      Object.keys(reportData[0]).join(','),
      ...reportData.map(row => Object.values(row).join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=complaints-report.csv');
    res.send(csv);
  } else {
    res.status(200).json({
      success: true,
      totalRecords: reportData.length,
      data: reportData,
    });
  }
});
