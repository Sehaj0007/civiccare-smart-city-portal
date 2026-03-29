import mongoose from 'mongoose';
import { generateTrackingId } from '../utils/aiDetection.js';

const complaintSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      unique: true,
      index: true,
      default: generateTrackingId,
    },
    category: {
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
      required: [true, 'Please select a complaint category'],
      index: true,
    },
    complaintType: {
      type: String,
      required: [true, 'Please specify complaint type'],
      maxlength: [50, 'Complaint type cannot exceed 50 characters'],
    },
    title: {
      type: String,
      required: [true, 'Please provide complaint title'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide complaint description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
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
    city: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere',
      },
    },
    images: [
      {
        url: String,
        uploadedAt: Date,
      },
    ],
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
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
        'CLOSED',
        'REJECTED',
      ],
      default: 'PENDING',
      index: true,
    },
    isDuplicate: {
      type: Boolean,
      default: false,
    },
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
    },
    assignedTeamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabourTeam',
    },
    assignedByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    forwardedWardOfficeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WardOffice',
    },
    sla: {
      deadline: Date,
      isOverdue: {
        type: Boolean,
        default: false,
      },
      responseDeadline: Date,
      resolutionDeadline: Date,
    },
    remarks: [
      {
        addedBy: mongoose.Schema.Types.ObjectId,
        text: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    resolutionProof: {
      images: [String],
      description: String,
      uploadedAt: Date,
    },
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      score: {
        type: Number,
        min: 1,
        max: 5,
      },
      feedback: String,
      ratedAt: Date,
    },
    timeline: [
      {
        status: String,
        timestamp: Date,
        ChangedBy: mongoose.Schema.Types.ObjectId,
        remarks: String,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    resolvedAt: Date,
    responseTime: Number, // in hours
    resolutionTime: Number, // in hours
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
