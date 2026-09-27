const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    genericName: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    brandExamples: [{
      type: String
    }],
    category: {
      type: String,
      required: true
    },
    commonUses: [{
      type: String
    }],
    contraindications: [{
      type: String
    }],
    commonSideEffects: [{
      type: String
    }],
    importantInteractions: [{
      type: String
    }],
    warnings: [{
      type: String
    }],
    relatedSymptoms: [{
      type: String
    }],
    prescriptionStatus: {
      type: String,
      default: 'Prescription Required (Rx)'
    },
    patientInformation: {
      type: String,
      required: true
    },
    doctorNotes: {
      type: String,
      default: ''
    },
    standardDosageForms: [{
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

medicineSchema.virtual('commonMedicalUses').get(function() {
  return this.commonUses || [];
});
medicineSchema.virtual('interactions').get(function() {
  return this.importantInteractions || [];
});
medicineSchema.set('toJSON', { virtuals: true });
medicineSchema.set('toObject', { virtuals: true });

medicineSchema.index({ genericName: 'text', brandExamples: 'text', category: 'text', commonUses: 'text' });

module.exports = mongoose.model('Medicine', medicineSchema);
