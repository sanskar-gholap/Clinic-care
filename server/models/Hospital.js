const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: [
        'Government',
        'Private',
        'Multispeciality',
        'Speciality',
        'Eye Hospital',
        "Children's Hospital",
        "Women's Hospital"
      ],
      required: true
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
    emergencyAvailable: {
      type: Boolean,
      default: true
    },
    emergencyPhone: {
      type: String,
      default: ''
    },
    departments: {
      type: [String],
      default: []
    },
    openingHours: {
      type: String,
      default: '24/7 Emergency & Inpatient Care'
    },
    website: {
      type: String,
      default: ''
    },
    googleMapsUrl: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=800'
    },
    rating: {
      type: Number,
      default: 4.7
    },
    bedCount: {
      type: Number,
      default: 150
    },
    isVerified: {
      type: Boolean,
      default: true
    },
    verificationNote: {
      type: String,
      default: 'Verified by ClinicCare Healthcare Verification Team'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast searching across name, area, and departments
hospitalSchema.index({ name: 'text', area: 'text', departments: 'text' });

module.exports = mongoose.model('Hospital', hospitalSchema);
