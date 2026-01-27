import mongoose from 'mongoose';

const wardOfficeSchema = new mongoose.Schema(
  {
    wardNumber: {
      type: String,
      required: [true, 'Please provide ward number'],
      unique: true,
      maxlength: [20, 'Ward number cannot exceed 20 characters'],
    },
    officeName: {
      type: String,
      required: [true, 'Please provide office name'],
      maxlength: [100, 'Office name cannot exceed 100 characters'],
    },
    locality: [
      {
        type: String,
        maxlength: [100, 'Locality cannot exceed 100 characters'],
      },
    ],
    email: {
      type: String,
      required: [true, 'Please provide email'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Please provide phone number'],
      match: [/^\d{10}$/, 'Please provide a valid 10-digit phone number'],
    },
    address: {
      type: String,
      maxlength: [200, 'Address cannot exceed 200 characters'],
    },
    forwardedComplaints: [
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

wardOfficeSchema.index({ locality: 1 });

export default mongoose.model('WardOffice', wardOfficeSchema);
