import Complaint from '../models/Complaint.js';
import LabourTeam from '../models/LabourTeam.js';
import WardOffice from '../models/WardOffice.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import { catchAsyncErrors } from '../utils/errorUtils.js';

// @desc    Create a new complaint
// @route   POST /api/complaints
export const createComplaint = catchAsyncErrors(async (req, res, next) => {
  const { category, complaintType, description, locality, address, imageUrl } = req.body;

  console.log('Creating complaint for user:', req.user._id);
  console.log('Complaint data:', { category, complaintType, locality });

  const complaint = await Complaint.create({
    category,
    complaintType,
    description,
    locality,
    address,
    imageUrl: imageUrl || null,
    citizenId: req.user._id,
    status: 'PENDING',
  });

  console.log('Complaint created:', complaint._id);

  // Populate citizen details
  await complaint.populate('citizenId', 'name email phone');

  res.status(201).json({
    success: true,
    complaint,
  });
});

// @desc    Get all complaints of logged in user
// @route   GET /api/complaints/user/:userId
export const getUserComplaints = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.params;
  const { status, category, page = 1, limit = 10 } = req.query;

  // Security check: Only allow users to view their own complaints, unless admin
  if (req.user.role !== 'ADMIN' && req.user._id.toString() !== userId) {
    return next(new ErrorHandler('Not authorized to access these complaints', 403));
  }

  let query = { citizenId: userId };

  if (status) {
    query.status = status;
  }

  if (category) {
    query.category = category;
  }

  const skip = (page - 1) * limit;

  const complaints = await Complaint.find(query)
    .populate('citizenId', 'name email phone')
    .populate('assignedTeamId')
    .populate('forwardedWardOfficeId')
    .populate('assignedByAdminId', 'name email department')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

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
    complaints,
  });
});

// @desc    Get single complaint
// @route   GET /api/complaints/:id
export const getComplaintById = catchAsyncErrors(async (req, res, next) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('citizenId', 'name email phone')
    .populate('assignedTeamId')
    .populate('forwardedWardOfficeId')
    .populate('assignedByAdminId', 'name email department');

  if (!complaint) {
    return next(new ErrorHandler('Complaint not found', 404));
  }

  res.status(200).json({
    success: true,
    complaint,
  });
});

// @desc    Get all complaints (admin)
// @route   GET /api/complaints
export const getAllComplaints = catchAsyncErrors(async (req, res, next) => {
  const { status, category, locality, page = 1, limit = 10 } = req.query;
  let query = {};

  if (status) query.status = status;
  if (category) query.category = category;
  if (locality) query.locality = locality;

  // If admin has a specific department, filter by that category
  if (req.user.department && req.user.role === 'ADMIN') {
    query.category = req.user.department;
  }

  const skip = (page - 1) * limit;

  const complaints = await Complaint.find(query)
    .populate('citizenId', 'name email phone')
    .populate('assignedTeamId')
    .populate('forwardedWardOfficeId')
    .populate('assignedByAdminId', 'name email department')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

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
    complaints,
  });
});

// @desc    Update complaint
// @route   PATCH /api/complaints/:id
export const updateComplaint = catchAsyncErrors(async (req, res, next) => {
  let complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return next(new ErrorHandler('Complaint not found', 404));
  }

  const { status, remarks } = req.body;

  if (status) {
    const validStatuses = [
      'PENDING',
      'ASSIGNED',
      'IN_PROGRESS',
      'FORWARDED',
      'UNDER_REVIEW',
      'RESOLVED',
      'REJECTED',
    ];
    if (!validStatuses.includes(status)) {
      return next(new ErrorHandler('Invalid status', 400));
    }
    complaint.status = status;

    if (status === 'RESOLVED') {
      complaint.resolvedAt = new Date();
    }
  }

  if (remarks) {
    complaint.remarks = remarks;
  }

  complaint = await complaint.save();

  await complaint.populate('citizenId', 'name email phone');
  await complaint.populate('assignedTeamId');
  await complaint.populate('forwardedWardOfficeId');

  res.status(200).json({
    success: true,
    complaint,
  });
});

// @desc    Add rating and feedback
// @route   PATCH /api/complaints/:id/feedback
export const addFeedback = catchAsyncErrors(async (req, res, next) => {
  const { rating, feedback } = req.body;

  const updateData = {};
  if (rating) updateData.rating = rating;
  if (feedback) updateData.feedback = feedback;

  const complaint = await Complaint.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!complaint) {
    return next(new ErrorHandler('Complaint not found', 404));
  }

  res.status(200).json({
    success: true,
    complaint,
  });
});

// @desc    Get complaints statistics
// @route   GET /api/complaints/stats/overview
export const getComplaintStats = catchAsyncErrors(async (req, res, next) => {
  const totalComplaints = await Complaint.countDocuments();
  const pendingComplaints = await Complaint.countDocuments({ status: 'PENDING' });
  const assignedComplaints = await Complaint.countDocuments({ status: 'ASSIGNED' });
  const inProgressComplaints = await Complaint.countDocuments({ status: 'IN_PROGRESS' });
  const forwardedComplaints = await Complaint.countDocuments({ status: 'FORWARDED' });
  const underReviewComplaints = await Complaint.countDocuments({ status: 'UNDER_REVIEW' });
  const resolvedComplaints = await Complaint.countDocuments({ status: 'RESOLVED' });

  const complaintsByCategory = await Complaint.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalComplaints,
      pendingComplaints,
      assignedComplaints,
      inProgressComplaints,
      forwardedComplaints,
      underReviewComplaints,
      resolvedComplaints,
      complaintsByCategory,
    },
  });
});
