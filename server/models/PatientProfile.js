const mongoose = require('mongoose');

const patientProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    firstName: {
      type: String,
      default: ''
    },
    lastName: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    dateOfBirth: {
      type: String,
      default: ''
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', ''],
      default: ''
    },
    bloodGroup: {
      type: String,
      default: 'O+'
    },
    address: {
      type: String,
      default: ''
    },
    emergencyContact: {
      type: String,
      default: ''
    },
    medicalHistory: {
      type: [String],
      default: []
    },
    vitals: {
      bloodPressure: {
        type: String,
        default: '120/80'
      },
      weight: {
        type: String,
        default: '68'
      },
      height: {
        type: String,
        default: '175'
      },
      healthScore: {
        type: Number,
        default: 92
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('PatientProfile', patientProfileSchema);
