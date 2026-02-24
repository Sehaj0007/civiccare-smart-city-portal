import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
    },
    action: {
      type: String,
      enum: [
        'CREATED',
        'VIEWED',
        'ASSIGNED',
        'STATUS_CHANGED',
        'REMARK_ADDED',
        'EVIDENCE_ADDED',
        'ESCALATED',
        'RESOLVED',
        'TEAM_CHANGED',
      ],
      required: true,
    },
    description: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: false }
);

activityLogSchema.index({ complaint: 1, timestamp: -1 });
activityLogSchema.index({ user: 1, timestamp: -1 });

export default mongoose.model('ActivityLog', activityLogSchema);
