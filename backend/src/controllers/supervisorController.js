import Complaint from '../models/Complaint.js';
import Team from '../models/Team.js';
import Department from '../models/Department.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import { catchAsyncErrors } from '../utils/errorUtils.js';

// @desc    Debug endpoint to check escalation flow
// @route   GET /api/supervisor/debug/escalation
export const debugEscalation = catchAsyncErrors(async (req, res, next) => {
  // Debug: Show all FORWARDED complaints
  const forwardedComplaints = await Complaint.find({ status: 'FORWARDED' }).select('trackingId status forwardedWardOfficeId assignedByAdminId');
  
  // Debug: Show total complaints count
  const totalComplaints = await Complaint.countDocuments();
  
  // Debug: Show count by status
  const statusCounts = await Complaint.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  console.log('[DEBUG] Total Complaints:', totalComplaints);
  console.log('[DEBUG] Status Distribution:', statusCounts);
  console.log('[DEBUG] Forwarded Complaints:', forwardedComplaints.length);

  res.status(200).json({
    success: true,
    debug: {
      totalComplaints,
      statusDistribution: statusCounts,
      forwardedCount: forwardedComplaints.length,
      forwardedComplaints: forwardedComplaints
    }
  });
});

// @desc    Get comprehensive dashboard overview
// @route   GET /api/supervisor/dashboard
export const getSupervisorDashboard = catchAsyncErrors(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  let dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  }

  // Get all complaints
  const complaints = await Complaint.find(dateFilter);
  const departments = await Department.find({ isActive: true });
  const teams = await Team.find();

  // Dashboard statistics
  const stats = {
    totalComplaints: complaints.length,
    resolvedComplaints: complaints.filter(c => c.status === 'RESOLVED').length,
    pendingComplaints: complaints.filter(c => c.status === 'PENDING' || c.status === 'ASSIGNED').length,
    inProgressComplaints: complaints.filter(c => c.status === 'IN_PROGRESS').length,
    overdueComplaints: complaints.filter(c => c.sla?.isOverdue).length,
    averageResolutionTime: 0,
    slaComplianceRate: 0,
    resolutionRate: 0,
  };

  // Calculate metrics
  let totalResolutionTime = 0;
  let resolvedCount = 0;
  let slaCompliantCount = 0;

  complaints.forEach(complaint => {
    if (complaint.resolvedAt) {
      totalResolutionTime += complaint.resolutionTime || 0;
      resolvedCount += 1;

      if (!complaint.sla?.isOverdue) {
        slaCompliantCount += 1;
      }
    }
  });

  stats.averageResolutionTime = resolvedCount > 0 ? (totalResolutionTime / resolvedCount).toFixed(2) : 0;
  stats.slaComplianceRate = complaints.length > 0 ? ((slaCompliantCount / complaints.length) * 100).toFixed(2) : 0;
  stats.resolutionRate = complaints.length > 0 ? ((resolvedCount / complaints.length) * 100).toFixed(2) : 0;

  // Department-wise breakdown
  const departmentBreakdown = departments.map(dept => {
    const deptComplaints = complaints.filter(c => c.category === dept.name);
    const resolved = deptComplaints.filter(c => c.status === 'RESOLVED').length;

    return {
      id: dept._id,
      name: dept.displayName,
      category: dept.name,
      totalComplaints: deptComplaints.length,
      resolved,
      pending: deptComplaints.length - resolved,
      overdue: deptComplaints.filter(c => c.sla?.isOverdue).length,
      resolutionRate: deptComplaints.length > 0 ? ((resolved / deptComplaints.length) * 100).toFixed(2) : 0,
      performanceRating: dept.stats.performanceRating || 0,
    };
  });

  // Team performance ranking
  const teamRankings = await Promise.all(
    teams.map(async team => {
      const teamComplaints = await Complaint.find({ assignedTeamId: team._id });
      const resolved = teamComplaints.filter(c => c.status === 'RESOLVED').length;
      let avgResolutionTime = 0;

      if (resolved > 0) {
        const totalTime = teamComplaints.reduce((acc, c) => acc + (c.resolutionTime || 0), 0);
        avgResolutionTime = totalTime / resolved;
      }

      return {
        id: team._id,
        name: team.name,
        totalAssigned: teamComplaints.length,
        resolved,
        slaComplianceRate: team.performanceMetrics.slaComplianceRate,
        averageResolutionTime: avgResolutionTime.toFixed(2),
        overallRating: team.performanceMetrics.overallRating,
      };
    })
  );

  // Sort teams by performance
  teamRankings.sort((a, b) => b.overallRating - a.overallRating);

  // Category-wise distribution
  const categoryDistribution = {};
  complaints.forEach(complaint => {
    categoryDistribution[complaint.category] = (categoryDistribution[complaint.category] || 0) + 1;
  });

  // Priority distribution
  const priorityDistribution = {};
  complaints.forEach(complaint => {
    priorityDistribution[complaint.priority] = (priorityDistribution[complaint.priority] || 0) + 1;
  });

  // Monthly trends
  const monthlyTrends = getMonthlyTrends(complaints);

  res.status(200).json({
    success: true,
    stats,
    departmentBreakdown: departmentBreakdown.sort((a, b) => b.totalComplaints - a.totalComplaints),
    teamRankings: teamRankings.slice(0, 10),
    categoryDistribution,
    priorityDistribution,
    monthlyTrends,
  });
});

// Helper function to calculate monthly trends
function getMonthlyTrends(complaints) {
  const trends = {};

  complaints.forEach(complaint => {
    const date = new Date(complaint.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!trends[monthKey]) {
      trends[monthKey] = {
        month: monthKey,
        totalComplaints: 0,
        resolvedComplaints: 0,
        overdueComplaints: 0,
      };
    }

    trends[monthKey].totalComplaints += 1;
    if (complaint.status === 'RESOLVED') {
      trends[monthKey].resolvedComplaints += 1;
    }
    if (complaint.sla?.isOverdue) {
      trends[monthKey].overdueComplaints += 1;
    }
  });

  return Object.values(trends).sort((a, b) => a.month.localeCompare(b.month));
}

// @desc    Get overdue complaint alerts
// @route   GET /api/supervisor/alerts/overdue
export const getOverdueAlerts = catchAsyncErrors(async (req, res, next) => {
  const overdueComplaints = await Complaint.find({ 'sla.isOverdue': true })
    .populate('citizenId', 'name email phone')
    .populate('assignedTeamId', 'name')
    .sort({ 'sla.deadline': 1 })
    .limit(20);

  const alerts = overdueComplaints.map(complaint => ({
    id: complaint._id,
    trackingId: complaint.trackingId,
    category: complaint.category,
    priority: complaint.priority,
    status: complaint.status,
    daysOverdue: Math.floor((new Date() - complaint.sla.deadline) / (1000 * 60 * 60 * 24)),
    deadline: complaint.sla.deadline,
    citizen: complaint.citizenId?.name,
    assignedTeam: complaint.assignedTeamId?.name,
    description: complaint.description,
  }));

  res.status(200).json({
    success: true,
    count: alerts.length,
    alerts,
  });
});

// @desc    Get escalated complaints (forwarded to ward offices)
// @route   GET /api/supervisor/complaints/escalated
export const getEscalatedComplaints = catchAsyncErrors(async (req, res, next) => {
  const { limit = 50 } = req.query;

  const escalatedComplaints = await Complaint.find({ status: 'FORWARDED' })
    .populate('citizenId', 'name email phone')
    .populate('forwardedWardOfficeId', 'name address wardNumber')
    .populate('assignedByAdminId', 'name email department')
    .populate('assignedTeamId', 'name')
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  console.log(`[Escalation Query] Found ${escalatedComplaints.length} escalated complaints`);

  const escalatedStats = {
    total: escalatedComplaints.length,
    byCategory: {},
    byPriority: {},
    byAdmin: {},
  };

  escalatedComplaints.forEach(complaint => {
    escalatedStats.byCategory[complaint.category] = (escalatedStats.byCategory[complaint.category] || 0) + 1;
    escalatedStats.byPriority[complaint.priority] = (escalatedStats.byPriority[complaint.priority] || 0) + 1;
    if (complaint.assignedByAdminId) {
      const adminName = complaint.assignedByAdminId.name;
      escalatedStats.byAdmin[adminName] = (escalatedStats.byAdmin[adminName] || 0) + 1;
    }
  });

  const formattedComplaints = escalatedComplaints.map(complaint => ({
    id: complaint._id,
    trackingId: complaint.trackingId,
    title: complaint.title,
    category: complaint.category,
    priority: complaint.priority,
    locality: complaint.locality,
    createdAt: complaint.createdAt,
    citizen: complaint.citizenId?.name,
    wardOffice: complaint.forwardedWardOfficeId?.name || 'N/A',
    escalatedBy: complaint.assignedByAdminId?.name || 'N/A',
  }));

  res.status(200).json({
    success: true,
    count: formattedComplaints.length,
    stats: escalatedStats,
    complaints: formattedComplaints,
  });
});

// @desc    Get SLA violation trends
// @route   GET /api/supervisor/analytics/sla-violations
export const getSLAViolationTrends = catchAsyncErrors(async (req, res, next) => {
  const complaints = await Complaint.find();

  const violations = {
    byCategory: {},
    byDepartment: {},
    byTeam: {},
    byMonth: {},
  };

  const slaHours = {
    ELECTRICITY: 24,
    WATER: 48,
    POTHOLES: 72,
    SECURITY: 6,
    HEALTH: 12,
    SANITATION: 48,
    WASTE_MANAGEMENT: 48,
    PUBLIC_PROPERTY: 72,
    E_WASTE: 72,
    ENVIRONMENT: 96,
    TRANSPORT: 72,
    EDUCATION: 72,
  };

  complaints.forEach(complaint => {
    if (complaint.sla?.isOverdue) {
      // By category
      violations.byCategory[complaint.category] = (violations.byCategory[complaint.category] || 0) + 1;

      // By month
      const date = new Date(complaint.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      violations.byMonth[monthKey] = (violations.byMonth[monthKey] || 0) + 1;
    }
  });

  res.status(200).json({
    success: true,
    violations,
  });
});

// @desc    Get area heatmap data
// @route   GET /api/supervisor/analytics/heatmap
export const getAreaHeatmap = catchAsyncErrors(async (req, res, next) => {
  // Get complaints grouped by locality with status breakdown
  const heatmapByLocality = await Complaint.aggregate([
    {
      $group: {
        _id: '$locality',
        totalComplaints: { $sum: 1 },
        resolvedComplaints: {
          $sum: {
            $cond: [{ $eq: ['$status', 'RESOLVED'] }, 1, 0]
          }
        },
        pendingComplaints: {
          $sum: {
            $cond: [
              {
                $in: ['$status', ['PENDING', 'ASSIGNED', 'IN_PROGRESS']]
              },
              1,
              0
            ]
          }
        },
        categories: { $push: '$category' },
        coordinatePoints: {
          $push: {
            $cond: [
              {
                $and: [
                  { $isArray: '$location.coordinates' },
                  { $gte: [{ $size: '$location.coordinates' }, 2] }
                ]
              },
              '$location.coordinates',
              null
            ]
          }
        },
      }
    },
    {
      $sort: { totalComplaints: -1 }
    },
    {
      $limit: 50
    }
  ]);

  const formattedHeatmapData = heatmapByLocality.map(locality => {
    const validCoordinatePoints = (locality.coordinatePoints || []).filter(
      point => Array.isArray(point) && point.length >= 2
    );

    const averageCoordinates = validCoordinatePoints.length > 0
      ? [
          validCoordinatePoints.reduce((sum, point) => sum + point[0], 0) / validCoordinatePoints.length,
          validCoordinatePoints.reduce((sum, point) => sum + point[1], 0) / validCoordinatePoints.length,
        ]
      : null;

    return {
      locality: locality._id || 'Unknown',
      totalComplaints: locality.totalComplaints,
      resolvedComplaints: locality.resolvedComplaints,
      pendingComplaints: locality.pendingComplaints,
      topCategories: [...new Set(locality.categories)].slice(0, 3),
      coordinates: averageCoordinates,
    };
  });

  console.log(`[Heatmap] Generated heatmap for ${formattedHeatmapData.length} localities`);

  res.status(200).json({
    success: true,
    totalLocalities: formattedHeatmapData.length,
    heatmapData: formattedHeatmapData,
  });
});

// @desc    Get activity timeline
// @route   GET /api/supervisor/activity/timeline
export const getActivityTimeline = catchAsyncErrors(async (req, res, next) => {
  const { limit = 50 } = req.query;

  const activities = await ActivityLog.find()
    .populate('user', 'name email role')
    .populate('complaint', 'trackingId category status')
    .sort({ timestamp: -1 })
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    count: activities.length,
    activities,
  });
});

// @desc    Get department performance comparison
// @route   GET /api/supervisor/analytics/department-comparison
export const getDepartmentComparison = catchAsyncErrors(async (req, res, next) => {
  const departments = await Department.find({ isActive: true });
  const complaints = await Complaint.find();

  const comparison = await Promise.all(
    departments.map(async dept => {
      const deptComplaints = complaints.filter(c => c.category === dept.name);
      const resolved = deptComplaints.filter(c => c.status === 'RESOLVED').length;
      const overdue = deptComplaints.filter(c => c.sla?.isOverdue).length;

      let avgResolutionTime = 0;
      const resolvedComplaints = deptComplaints.filter(c => c.resolvedAt);
      if (resolvedComplaints.length > 0) {
        const totalTime = resolvedComplaints.reduce((acc, c) => acc + (c.resolutionTime || 0), 0);
        avgResolutionTime = totalTime / resolvedComplaints.length;
      }

      return {
        name: dept.displayName,
        totalComplaints: deptComplaints.length,
        resolved,
        pending: deptComplaints.length - resolved,
        overdue,
        avgResolutionTime: avgResolutionTime.toFixed(2),
        resolutionRate: deptComplaints.length > 0 ? ((resolved / deptComplaints.length) * 100).toFixed(2) : 0,
        slaComplianceRate: dept.stats.performanceRating,
      };
    })
  );

  res.status(200).json({
    success: true,
    comparison: comparison.sort((a, b) => b.resolutionRate - a.resolutionRate),
  });
});

// @desc    Export supervisor reports
// @route   GET /api/supervisor/reports/export
export const exportSupervisorReport = catchAsyncErrors(async (req, res, next) => {
  const { format = 'json', startDate, endDate } = req.query;

  let dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  }

  const complaints = await Complaint.find(dateFilter)
    .populate('citizenId', 'name email')
    .populate('assignedTeamId', 'name');

  const departments = await Department.find();
  const teams = await Team.find();

  const reportData = {
    generatedAt: new Date(),
    dateRange: {
      startDate: startDate || 'All time',
      endDate: endDate || 'Present',
    },
    summary: {
      totalComplaints: complaints.length,
      resolved: complaints.filter(c => c.status === 'RESOLVED').length,
      pending: complaints.filter(c => c.status !== 'RESOLVED').length,
      overdue: complaints.filter(c => c.sla?.isOverdue).length,
    },
    departmentStats: {},
    teamStats: {},
    monthlyTrends: getMonthlyTrends(complaints),
  };

  // Department statistics
  departments.forEach(dept => {
    const deptComplaints = complaints.filter(c => c.category === dept.name);
    reportData.departmentStats[dept.displayName] = {
      total: deptComplaints.length,
      resolved: deptComplaints.filter(c => c.status === 'RESOLVED').length,
      overdue: deptComplaints.filter(c => c.sla?.isOverdue).length,
    };
  });

  // Team statistics
  teams.forEach(team => {
    const teamComplaints = complaints.filter(c => c.assignedTeamId?.toString() === team._id.toString());
    reportData.teamStats[team.name] = {
      assigned: teamComplaints.length,
      resolved: teamComplaints.filter(c => c.status === 'RESOLVED').length,
      performance: team.performanceMetrics.overallRating,
    };
  });

  if (format === 'csv') {
    const csvContent = convertToCSV(reportData);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=supervisor-report.csv');
    res.send(csvContent);
  } else {
    res.status(200).json({
      success: true,
      report: reportData,
    });
  }
});

// Helper function to convert to CSV
function convertToCSV(data) {
  const lines = [];
  lines.push('CivicCare Supervisor Report');
  lines.push(`Generated at: ${data.generatedAt}`);
  lines.push('');
  lines.push('SUMMARY STATISTICS');
  lines.push(`Total Complaints,${data.summary.totalComplaints}`);
  lines.push(`Resolved,${data.summary.resolved}`);
  lines.push(`Pending,${data.summary.pending}`);
  lines.push(`Overdue,${data.summary.overdue}`);
  lines.push('');
  lines.push('DEPARTMENT STATISTICS');
  lines.push('Department,Total,Resolved,Overdue');
  Object.entries(data.departmentStats).forEach(([dept, stats]) => {
    lines.push(`${dept},${stats.total},${stats.resolved},${stats.overdue}`);
  });

  return lines.join('\n');
}
