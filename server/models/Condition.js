const mongoose = require('mongoose');

const conditionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: [
        'General Medicine',
        'Respiratory',
        'Digestive',
        'Skin',
        'Eye',
        'ENT',
        'Dental',
        'Orthopedic',
        'Neurology',
        'Cardiology',
        "Women's Health",
        "Men's Health",
        'Pediatrics',
        'Mental Health',
        'Chronic Conditions',
        'Infectious Diseases'
      ]
    },
    commonSymptoms: [{
      type: String
    }],
    redFlagSymptoms: [{
      type: String
    }],
    generalInformation: {
      type: String,
      required: true
    },
    recommendedSpecialty: {
      type: String,
      required: true
    },
    urgencyLevel: {
      type: String,
      enum: ['General', 'Needs medical consultation', 'Same-day medical attention', 'Emergency'],
      default: 'Needs medical consultation'
    },
    whenToSeekCare: {
      type: String,
      required: true
    },
    patientEducation: {
      type: String,
      default: ''
    },
    relatedAppointmentType: {
      type: String,
      default: 'In-person Specialist Consultation'
    },
    relatedMedicines: [{
      type: String
    }],
    isVerified: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

conditionSchema.virtual('symptoms').get(function() {
  return this.commonSymptoms || [];
});
conditionSchema.virtual('redFlags').get(function() {
  return this.redFlagSymptoms || [];
});
conditionSchema.virtual('appointmentType').get(function() {
  return this.relatedAppointmentType;
});
conditionSchema.set('toJSON', { virtuals: true });
conditionSchema.set('toObject', { virtuals: true });

conditionSchema.index({ name: 'text', category: 'text', commonSymptoms: 'text' });

module.exports = mongoose.model('Condition', conditionSchema);
