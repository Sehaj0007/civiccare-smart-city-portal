import Complaint from '../models/Complaint.js';
import LabourTeam from '../models/LabourTeam.js';
import WardOffice from '../models/WardOffice.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import { catchAsyncErrors } from '../utils/errorUtils.js';

const getAdminComplaintCategory = (department) => {
  const departmentMapping = {
    ROAD_MAINTENANCE: 'POTHOLES',
  };

  return departmentMapping[department] || department;
};

const getComplaintCategoryForTeam = (departmentCategory) => {
  const categoryMapping = {
    ROAD_MAINTENANCE: 'POTHOLES',
  };

  return categoryMapping[departmentCategory] || departmentCategory;
};

const ensureAdminCanAccessComplaint = (req, complaint, next) => {
  const adminCategory = getAdminComplaintCategory(req.user?.department);

  if (!adminCategory) {
    next(new ErrorHandler('Admin department is not configured', 403));
    return false;
  }

  if (complaint.category !== adminCategory) {
    next(new ErrorHandler('You can only access complaints from your own department', 403));
    return false;
  }

  return true;
};

// @desc    Assign complaint to labour team
// @route   POST /api/admin/assign-team
export const assignTeam = catchAsyncErrors(async (req, res, next) => {
  const { complaintId, teamId, remarks } = req.body;

  const complaint = await Complaint.findById(complaintId);

  if (!complaint) {
    return next(new ErrorHandler('Complaint not found', 404));
  }

  if (!ensureAdminCanAccessComplaint(req, complaint, next)) return;

  const team = await LabourTeam.findById(teamId);

  if (!team) {
    return next(new ErrorHandler('Labour team not found', 404));
  }

  if (getComplaintCategoryForTeam(team.departmentCategory) !== complaint.category) {
    return next(new ErrorHandler('You can only assign teams from your own department', 403));
  }

  // Update complaint
  complaint.status = 'ASSIGNED';
  complaint.assignedTeamId = teamId;
  complaint.assignedByAdminId = req.user._id;
  if (remarks) {
    complaint.remarks.push({
      status: 'ASSIGNED',
      timestamp: new Date(),
      remarks: remarks,
    });
  }

  await complaint.save();

  // Add complaint to team's assigned complaints
  if (!team.assignedComplaints) {
    team.assignedComplaints = [];
  }
  if (!team.assignedComplaints.includes(complaintId)) {
    team.assignedComplaints.push(complaintId);
    await team.save();
  }

  // Populate details
  await complaint.populate('citizenId', 'name email phone');
  await complaint.populate('assignedTeamId');
  await complaint.populate('assignedByAdminId', 'name email department');

  res.status(200).json({
    success: true,
    message: 'Complaint assigned to team',
    complaint,
  });
});

// @desc    Escalate complaint to ward office
// @route   POST /api/admin/escalate
export const escalateComplaint = catchAsyncErrors(async (req, res, next) => {
  const { complaintId, wardOfficeId, remarks } = req.body;

  const complaint = await Complaint.findById(complaintId);

  if (!complaint) {
    return next(new ErrorHandler('Complaint not found', 404));
  }

  if (!ensureAdminCanAccessComplaint(req, complaint, next)) return;

  const wardOffice = await WardOffice.findById(wardOfficeId);

  if (!wardOffice) {
    return next(new ErrorHandler('Ward office not found', 404));
  }

  // Update complaint
  complaint.status = 'FORWARDED';
  complaint.actionType = 'FORWARDED';
  complaint.forwardedWardOfficeId = wardOfficeId;
  complaint.assignedByAdminId = req.user._id;
  if (remarks) {
    complaint.remarks.push({
      status: 'FORWARDED',
      timestamp: new Date(),
      remarks: remarks,
    });
  }

  await complaint.save();

  // Add complaint to ward office's forwarded complaints
  if (!wardOffice.forwardedComplaints.includes(complaintId)) {
    wardOffice.forwardedComplaints.push(complaintId);
    await wardOffice.save();
  }

  // Populate details
  await complaint.populate('citizenId', 'name email phone');
  await complaint.populate('forwardedWardOfficeId');
  await complaint.populate('assignedByAdminId', 'name email department');

  res.status(200).json({
    success: true,
    message: 'Complaint escalated to ward office',
    complaint,
  });
});

// @desc    Change complaint status
// @route   PATCH /api/admin/complaints/:id/status
export const updateStatus = catchAsyncErrors(async (req, res, next) => {
  const { status, remarks } = req.body;

  const existingComplaint = await Complaint.findById(req.params.id);

  if (!existingComplaint) {
    return next(new ErrorHandler('Complaint not found', 404));
  }

  if (!ensureAdminCanAccessComplaint(req, existingComplaint, next)) return;

  const updateData = { status };
  if (remarks) updateData.remarks = remarks;
  if (status === 'RESOLVED') updateData.resolvedAt = new Date();

  const complaint = await Complaint.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  )
    .populate('citizenId', 'name email phone')
    .populate('assignedTeamId')
    .populate('forwardedWardOfficeId');

  if (!complaint) {
    return next(new ErrorHandler('Complaint not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Complaint status updated',
    complaint,
  });
});

// @desc    Get department-wise complaints
// @route   GET /api/admin/complaints/department/:category
export const getDepartmentComplaints = catchAsyncErrors(async (req, res, next) => {
  const requestedCategory = req.params.category;
  const { status } = req.query;
  const adminCategory = getAdminComplaintCategory(req.user?.department);

  const validCategories = [
    'WASTE_MANAGEMENT',
    'POTHOLES',
    'ELECTRICITY',
    'WATER',
    'SANITATION',
    'PUBLIC_PROPERTY',
    'E_WASTE',
    'SECURITY',
    'HEALTH',
    'ENVIRONMENT',
    'TRANSPORT',
    'EDUCATION',
  ];

  if (!adminCategory) {
    return next(new ErrorHandler('Admin department is not configured', 403));
  }

  if (!validCategories.includes(requestedCategory)) {
    return next(new ErrorHandler('Invalid category', 400));
  }

  if (requestedCategory !== adminCategory) {
    return next(new ErrorHandler('You can only access your own department dashboard', 403));
  }

  let query = { category: adminCategory };

  if (status) {
    query.status = status;
  }

  const complaints = await Complaint.find(query)
    .populate('citizenId', 'name email phone')
    .populate('assignedTeamId')
    .populate('forwardedWardOfficeId')
    .populate('assignedByAdminId', 'name email department')
    .sort({ createdAt: -1 });

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'PENDING').length,
    assigned: complaints.filter((c) => c.status === 'ASSIGNED').length,
    inProgress: complaints.filter((c) => c.status === 'IN_PROGRESS').length,
    forwarded: complaints.filter((c) => c.status === 'FORWARDED').length,
    underReview: complaints.filter((c) => c.status === 'UNDER_REVIEW').length,
    resolved: complaints.filter((c) => c.status === 'RESOLVED').length,
  };

  res.status(200).json({
    success: true,
    category: adminCategory,
    stats,
    complaints,
  });
});
