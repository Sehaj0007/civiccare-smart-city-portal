import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: [
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
      ],
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    description: String,
    sla: {
      responseTime: Number, // in hours
      resolutionTime: Number, // in hours
      priority: String,
    },
    headAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LabourTeam',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    stats: {
      totalComplaints: {
        type: Number,
        default: 0,
      },
      resolvedComplaints: {
        type: Number,
        default: 0,
      },
      pendingComplaints: {
        type: Number,
        default: 0,
      },
      overdueComplaints: {
        type: Number,
        default: 0,
      },
      averageResolutionTime: Number,
      performanceRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Department', departmentSchema);
