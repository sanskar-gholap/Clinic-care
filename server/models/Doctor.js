const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    specialty: {
      type: String,
      required: true
    },
    qualifications: {
      type: String,
      required: true
    },
    registrationNumber: {
      type: String,
      required: true
    },
    experienceYears: {
      type: Number,
      required: true,
      default: 5
    },
    clinicOrHospital: {
      type: String,
      required: true
    },
    area: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      default: ''
    },
    consultationFee: {
      type: Number,
      default: 800
    },
    consultationTypes: [{
      type: String,
      enum: ['In-person Clinic Visit', 'Video Consultation', 'Emergency OPD']
    }],
    availableDays: [{
      type: String
    }],
    availableSlots: [{
      type: String
    }],
    rating: {
      type: Number,
      default: 4.8
    },
    reviewCount: {
      type: Number,
      default: 45
    },
    bio: {
      type: String,
      default: ''
    },
    isVerified: {
      type: Boolean,
      default: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

doctorSchema.index({ name: 'text', specialty: 'text', clinicOrHospital: 'text', area: 'text' });

module.exports = mongoose.model('Doctor', doctorSchema);
