const mongoose = require('mongoose');

const ambulanceRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    patientName: {
      type: String,
      required: [true, 'Please provide the patient or caller name']
    },
    phone: {
      type: String,
      required: [true, 'Please provide contact phone number']
    },
    pickupLocation: {
      type: String,
      required: [true, 'Please provide pickup location or address']
    },
    emergencyType: {
      type: String,
      default: 'General Medical Emergency'
    },
    urgency: {
      type: String,
      enum: ['Critical', 'High', 'Moderate'],
      default: 'Critical'
    },
    status: {
      type: String,
      enum: ['Dispatching', 'En Route', 'Arrived', 'Completed', 'Cancelled'],
      default: 'Dispatching'
    },
    eta: {
      type: String,
      default: '8-12 mins'
    },
    driverName: {
      type: String,
      default: 'Paramedic Team Alpha'
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

module.exports = mongoose.model('AmbulanceRequest', ambulanceRequestSchema);
