const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['Hospital', 'Clinic', 'Diagnostics', 'Specialty Center'],
      default: 'Hospital'
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      default: 'Metropolis'
    },
    pincode: {
      type: String,
      default: '10001'
    },
    phone: {
      type: String,
      default: '+1 (555) 019-2834'
    },
    rating: {
      type: Number,
      default: 4.8
    },
    openHours: {
      type: String,
      default: '24/7 Open'
    },
    specialties: {
      type: [String],
      default: ['Cardiology', 'Emergency', 'Pediatrics', 'Neurology', 'General Practice']
    },
    availableBeds: {
      type: Number,
      default: 32
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800'
    },
    bloodStock: [
      {
        bloodGroup: {
          type: String,
          enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        },
        units: {
          type: Number,
          default: 10
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Facility', facilitySchema);
