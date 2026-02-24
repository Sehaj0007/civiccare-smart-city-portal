import mongoose from 'mongoose';

const labourTeamSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: [true, 'Please provide team name'],
      unique: true,
      maxlength: [100, 'Team name cannot exceed 100 characters'],
    },
    departmentCategory: {
      type: String,
      enum: [
        'WASTE_MANAGEMENT',
        'ROAD_MAINTENANCE',
        'ELECTRICITY',
        'PUBLIC_PROPERTY',
        'E_WASTE',
        'SECURITY',
        'HEALTH',
        'ENVIRONMENT',
        'TRANSPORT',
        'EDUCATION',
      ],
      required: [true, 'Please specify department'],
    },
    contactNumber: {
      type: String,
      required: [true, 'Please provide contact number'],
      match: [/^\d{10}$/, 'Please provide a valid 10-digit phone number'],
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
      default: '',
    },
    leaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    availabilityStatus: {
      type: String,
      enum: ['AVAILABLE', 'BUSY', 'INACTIVE'],
      default: 'AVAILABLE',
    },
    assignedComplaints: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Complaint',
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

labourTeamSchema.index({ departmentCategory: 1 });

export default mongoose.model('LabourTeam', labourTeamSchema);
