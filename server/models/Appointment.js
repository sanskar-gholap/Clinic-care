const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    patientName: {
      type: String,
      required: true
    },
    patientEmail: {
      type: String,
      default: ''
    },
    patientPhone: {
      type: String,
      default: ''
    },
    specialty: {
      type: String,
      required: true,
      default: 'General Practice'
    },
    doctorName: {
      type: String,
      default: 'Dr. Eleanor Sterling'
    },
    date: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    reason: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
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

module.exports = mongoose.model('Appointment', appointmentSchema);
