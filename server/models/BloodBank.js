const mongoose = require('mongoose');

const bloodBankSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    area: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    availableBloodGroups: {
      type: [String],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      default: ['A+', 'B+', 'O+', 'AB+']
    },
    donationAvailability: {
      type: String,
      default: 'Walk-ins & Appointments Welcome (Mon-Sun 8:00 AM - 8:00 PM)'
    },
    workingHours: {
      type: String,
      default: '24 Hours Emergency Blood Issue'
    },
    googleMapsUrl: {
      type: String,
      default: ''
    },
    hospitalAffiliation: {
      type: String,
      default: ''
    },
    isVerified: {
      type: Boolean,
      default: true
    },
    verificationNote: {
      type: String,
      default: 'Licensed Blood Centre by Food & Drug Administration (FDA) & SBTC'
    }
  },
  {
    timestamps: true
  }
);

bloodBankSchema.index({ name: 'text', area: 'text' });

module.exports = mongoose.model('BloodBank', bloodBankSchema);
