import Complaint from '../models/Complaint.js';
import LabourTeam from '../models/LabourTeam.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import { catchAsyncErrors } from '../utils/errorUtils.js';
import { emitStatusUpdate, emitToAdminChannel } from '../config/socketIO.js';

const buildStats = (complaints) => ({
  total: complaints.length,
  pending: complaints.filter((complaint) => complaint.status === 'PENDING').length,
  assigned: complaints.filter((complaint) => complaint.status === 'ASSIGNED').length,
  inProgress: complaints.filter((complaint) => complaint.status === 'IN_PROGRESS').length,
  resolved: complaints.filter((complaint) => complaint.status === 'RESOLVED').length,
  forwarded: complaints.filter((complaint) => complaint.status === 'FORWARDED').length,
});

export const getStaffDashboard = catchAsyncErrors(async (req, res, next) => {
  if (req.user.role !== 'TEAM_MEMBER') {
    return next(new ErrorHandler('Only staff members can access this dashboard', 403));
  }

  if (!req.user.department) {
    return next(new ErrorHandler('No department is assigned to this staff account', 403));
  }

  const { teamId } = req.query;
  const teams = await LabourTeam.find({ departmentCategory: req.user.department }).sort({ teamName: 1 });

  if (!teams.length) {
    return next(new ErrorHandler('No teams found for this department', 404));
  }

  const selectedTeam = teamId
    ? teams.find((team) => team._id.toString() === teamId)
    : teams[0];

  if (!selectedTeam) {
    return next(new ErrorHandler('Selected team not found in your department', 404));
  }

  const complaints = await Complaint.find({ assignedTeamId: selectedTeam._id })
    .populate('citizenId', 'name email phone')
    .populate('assignedByAdminId', 'name email department')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    department: req.user.department,
    teams: teams.map((team) => ({
      _id: team._id,
      teamName: team.teamName,
      departmentCategory: team.departmentCategory,
      contactNumber: team.contactNumber,
      email: team.email,
      availabilityStatus: team.availabilityStatus,
    })),
    selectedTeam: {
      _id: selectedTeam._id,
      teamName: selectedTeam.teamName,
      departmentCategory: selectedTeam.departmentCategory,
      contactNumber: selectedTeam.contactNumber,
      email: selectedTeam.email,
      availabilityStatus: selectedTeam.availabilityStatus,
    },
    stats: buildStats(complaints),
    complaints,
  });
});

export const updateStaffComplaintStatus = catchAsyncErrors(async (req, res, next) => {
  if (req.user.role !== 'TEAM_MEMBER') {
    return next(new ErrorHandler('Only staff members can update complaints', 403));
  }

  const { status, remarks } = req.body;
  const complaint = await Complaint.findById(req.params.id)
    .populate('citizenId', 'name email phone');

  if (!complaint) {
    return next(new ErrorHandler('Complaint not found', 404));
  }

  if (!complaint.assignedTeamId) {
    return next(new ErrorHandler('Complaint is not assigned to a team yet', 400));
  }

  const team = await LabourTeam.findById(complaint.assignedTeamId);

  if (!team || team.departmentCategory !== req.user.department) {
    return next(new ErrorHandler('You can only update complaints for teams in your department', 403));
  }

  const validStatuses = ['ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];
  if (!validStatuses.includes(status)) {
    return next(new ErrorHandler('Invalid status for staff update', 400));
  }

  complaint.status = status;
  if (status === 'RESOLVED') {
    complaint.resolvedAt = new Date();
  }

  if (remarks) {
    complaint.remarks.push({
      addedBy: req.user._id,
      text: remarks,
      timestamp: new Date(),
    });
  }

  complaint.timeline.push({
    status,
    timestamp: new Date(),
    ChangedBy: req.user._id,
    remarks: remarks || 'Updated by staff',
  });

  await complaint.save();
  await complaint.populate('assignedTeamId');
  await complaint.populate('assignedByAdminId', 'name email department');

  emitStatusUpdate(complaint.citizenId._id.toString(), complaint);
  emitToAdminChannel(team.departmentCategory, 'admin-complaint-updated', complaint);

  res.status(200).json({
    success: true,
    message: 'Complaint status updated successfully',
    complaint,
  });
});
