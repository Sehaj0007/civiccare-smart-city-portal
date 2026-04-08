import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide team name'],
      maxlength: [100, 'Team name cannot exceed 100 characters'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    description: String,
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    maxCapacity: {
      type: Number,
      required: true,
      default: 5,
    },
    currentLoad: {
      type: Number,
      default: 0,
      min: 0,
    },
    availabilityStatus: {
      type: String,
      enum: ['AVAILABLE', 'BUSY', 'OFFLINE'],
      default: 'AVAILABLE',
    },
    assignedComplaints: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Complaint',
      },
    ],
    performanceMetrics: {
      totalAssigned: {
        type: Number,
        default: 0,
      },
      totalResolved: {
        type: Number,
        default: 0,
      },
      averageResolutionTime: Number, // in hours
      slaComplianceRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      overallRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Update availability status based on load
teamSchema.methods.updateAvailabilityStatus = function () {
  const loadPercentage = (this.currentLoad / this.maxCapacity) * 100;
  if (loadPercentage >= 100) {
    this.availabilityStatus = 'BUSY';
  } else if (loadPercentage > 0) {
    this.availabilityStatus = 'BUSY';
  } else {
    this.availabilityStatus = 'AVAILABLE';
  }
  return this.save();
};

export default mongoose.model('Team', teamSchema);
