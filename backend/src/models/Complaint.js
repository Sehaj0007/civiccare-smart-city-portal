import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: [
        'WASTE_MANAGEMENT',
        'POTHOLES',
        'ELECTRICITY',
        'PUBLIC_PROPERTY',
        'E_WASTE',
        'SECURITY',
      ],
      required: [true, 'Please select a complaint category'],
    },
    complaintType: {
      type: String,
      required: [true, 'Please specify complaint type'],
      maxlength: [50, 'Complaint type cannot exceed 50 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide complaint description'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    locality: {
      type: String,
      required: [true, 'Please specify locality'],
      maxlength: [100, 'Locality cannot exceed 100 characters'],
    },
    address: {
      type: String,
      required: [true, 'Please provide full address'],
      maxlength: [200, 'Address cannot exceed 200 characters'],
    },
    imageUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'ASSIGNED',
        'IN_PROGRESS',
        'FORWARDED',
        'UNDER_REVIEW',
        'RESOLVED',
        'REJECTED',
      ],
      default: 'PENDING',
    },
    actionType: {
      type: String,
      enum: ['ASSIGNED', 'FORWARDED', null],
      default: null,
    },
    assignedTeamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabourTeam',
      default: null,
    },
    assignedByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    forwardedWardOfficeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WardOffice',
      default: null,
    },
    remarks: {
      type: String,
      default: '',
      maxlength: [500, 'Remarks cannot exceed 500 characters'],
    },
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    feedback: {
      type: String,
      default: '',
      maxlength: [500, 'Feedback cannot exceed 500 characters'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
complaintSchema.index({ citizenId: 1, createdAt: -1 });
complaintSchema.index({ category: 1, status: 1 });
complaintSchema.index({ locality: 1 });
complaintSchema.index({ status: 1 });

export default mongoose.model('Complaint', complaintSchema);
