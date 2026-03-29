import mongoose from 'mongoose';

const supervisorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Supervisor name is required'],
    },
    email: {
      type: String,
      required: [true, 'Supervisor email is required'],
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    designation: {
      type: String,
      default: 'Supervisor',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    assignedZones: [
      {
        type: String,
        enum: ['ZONE_A', 'ZONE_B', 'ZONE_C', 'ZONE_D', 'ZONE_E'],
      },
    ],
    permissions: [
      {
        type: String,
        enum: [
          'VIEW_DASHBOARD',
          'VIEW_ANALYTICS',
          'MANAGE_COMPLAINTS',
          'MANAGE_TEAMS',
          'MANAGE_USERS',
          'GENERATE_REPORTS',
          'VIEW_ACTIVITY_LOG',
          'SEND_NOTIFICATIONS',
          'MANAGE_SLA',
          'DELETE_COMPLAINTS',
        ],
        default: [
          'VIEW_DASHBOARD',
          'VIEW_ANALYTICS',
          'MANAGE_COMPLAINTS',
          'MANAGE_TEAMS',
          'GENERATE_REPORTS',
          'SEND_NOTIFICATIONS',
        ],
      },
    ],
    supervisoryLevel: {
      type: String,
      enum: ['JUNIOR', 'SENIOR', 'LEAD', 'CHIEF'],
      default: 'SENIOR',
    },
    performanceMetrics: {
      totalComplaints: {
        type: Number,
        default: 0,
      },
      resolvedComplaints: {
        type: Number,
        default: 0,
      },
      slaComplianceRate: {
        type: Number,
        default: 100,
      },
      averageResolutionTime: {
        type: Number,
        default: 0,
      },
      teamRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
    activityLog: [
      {
        action: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        details: mongoose.Schema.Types.Mixed,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      dashboardLayout: {
        type: String,
        default: 'default',
      },
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
supervisorSchema.index({ userId: 1 });
supervisorSchema.index({ email: 1 });
supervisorSchema.index({ department: 1 });
supervisorSchema.index({ isActive: 1 });

// Populate user details when fetching supervisor
supervisorSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next();
  }
  this.populate({
    path: 'userId',
    select: 'name email phone',
  }).options._recursed = true;
  next();
});

export default mongoose.model('Supervisor', supervisorSchema);
