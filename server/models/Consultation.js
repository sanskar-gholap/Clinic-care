const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    patientName: {
      type: String,
      required: true
    },
    patientAge: {
      type: Number,
      default: 30
    },
    patientSex: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Unspecified'],
      default: 'Unspecified'
    },
    symptomsDescription: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      default: '1-3 days'
    },
    severity: {
      type: String,
      enum: ['Mild', 'Moderate', 'Severe'],
      default: 'Moderate'
    },
    temperature: {
      type: String,
      default: ''
    },
    existingConditions: {
      type: String,
      default: 'None reported'
    },
    allergies: {
      type: String,
      default: 'No known allergies'
    },
    currentMedicines: {
      type: String,
      default: 'None'
    },
    riskFactors: {
      type: String,
      default: 'None reported'
    },
    aiAssessment: {
      symptomsUnderstood: [{ type: String }],
      possibleCauses: [{ type: String }],
      recommendedSpecialty: { type: String, default: 'General Medicine' },
      urgencyLevel: {
        type: String,
        default: 'Needs medical consultation'
      },
      recommendedNextStep: { type: String },
      emergencyAlert: { type: Boolean, default: false },
      disclaimer: {
        type: String,
        default: 'AI Clinical Assessment is for informational triaging only and does not constitute a definitive medical diagnosis. A licensed physician must review this assessment.'
      }
    },
    status: {
      type: String,
      enum: [
        'Assessed by AI',
        'Under Doctor Review',
        'Approved by Doctor',
        'Modified by Doctor',
        'Rejected by Doctor',
        'More Information Requested'
      ],
      default: 'Assessed by AI'
    },
    reviewedByDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    doctorDecision: {
      decision: {
        type: String,
        enum: ['Approve', 'Modify', 'Reject', 'Request More Information', 'Pending'],
        default: 'Pending'
      },
      doctorNotes: { type: String, default: '' },
      clinicalImpression: { type: String, default: '' },
      actionPlan: { type: String, default: '' },
      reviewedAt: { type: Date }
    },
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription'
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Consultation', consultationSchema);
