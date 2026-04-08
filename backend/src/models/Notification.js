import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'COMPLAINT_REGISTERED',
        'COMPLAINT_ASSIGNED',
        'STATUS_UPDATED',
        'COMPLAINT_RESOLVED',
        'SLA_WARNING',
        'OVERDUE_ALERT',
        'TEAM_NOTIFICATION',
        'PERFORMANCE_ALERT',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedComplaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
    },
    relatedTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabourTeam',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    actionUrl: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

// Index for faster queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

export default mongoose.model('Notification', notificationSchema);
