const mongoose = require('mongoose');

const eyeCareCentreSchema = new mongoose.Schema(
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
    categories: {
      type: [String],
      default: [
        'Eye Testing',
        'Cataract',
        'Glaucoma',
        'Retina',
        'LASIK',
        'Cornea',
        'Pediatric Eye Care',
        'Diabetic Eye Care',
        'Emergency Eye Care',
        'Eye Donation'
      ]
    },
    services: {
      type: [String],
      default: []
    },
    openingHours: {
      type: String,
      default: 'Mon - Sat: 9:00 AM - 7:00 PM'
    },
    googleMapsUrl: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800'
    },
    rating: {
      type: Number,
      default: 4.8
    },
    isVerified: {
      type: Boolean,
      default: true
    },
    verificationNote: {
      type: String,
      default: 'Accredited Eye Care Institution in Pune'
    }
  },
  {
    timestamps: true
  }
);

eyeCareCentreSchema.index({ name: 'text', area: 'text', categories: 'text' });

module.exports = mongoose.model('EyeCareCentre', eyeCareCentreSchema);
