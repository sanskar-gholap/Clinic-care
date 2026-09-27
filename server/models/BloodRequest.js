const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    patientName: {
      type: String,
      required: [true, 'Please provide patient name']
    },
    bloodGroup: {
      type: String,
      required: [true, 'Please provide blood group'],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    units: {
      type: Number,
      default: 1,
      min: 1
    },
    hospital: {
      type: String,
      required: [true, 'Please provide target hospital or facility']
    },
    contactPhone: {
      type: String,
      required: [true, 'Please provide contact phone number']
    },
    urgency: {
      type: String,
      enum: ['Immediate (Critical)', 'Urgent (Within 6h)', 'Standard (24h)'],
      default: 'Urgent (Within 6h)'
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Fulfilled', 'Cancelled'],
      default: 'Pending'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
