const mongoose = require('mongoose');

const medicationItemSchema = new mongoose.Schema({
  medicineName: { type: String },
  name: { type: String },
  dosage: { type: String, default: 'As advised' },
  frequency: { type: String, default: 'Twice daily' },
  duration: { type: String, default: '5 days' },
  instructions: { type: String, default: 'Take as directed with water.' }
});

medicationItemSchema.pre('save', function() {
  if (this.name && !this.medicineName) this.medicineName = this.name;
  if (this.medicineName && !this.name) this.name = this.medicineName;
});

const prescriptionSchema = new mongoose.Schema(
  {
    consultation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation',
      required: true
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    patientName: {
      type: String,
      required: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    doctorName: {
      type: String,
      required: true
    },
    doctorSpecialty: {
      type: String,
      default: 'General Physician'
    },
    doctorRegistrationNumber: {
      type: String,
      default: 'MMC-2015-84920'
    },
    clinicOrHospital: {
      type: String,
      default: 'ClinicCare Super Speciality Centre, Pune'
    },
    medications: [medicationItemSchema],
    clinicalImpression: {
      type: String,
      required: true
    },
    dietaryLifestyleAdvice: {
      type: String,
      default: 'Rest adequately, maintain hydration, and avoid strenuous activity.'
    },
    followUp: {
      type: String,
      default: 'Follow-up in 5 days or immediately if symptoms worsen.'
    },
    status: {
      type: String,
      enum: ['Draft', 'Signed and Finalized', 'Cancelled'],
      default: 'Signed and Finalized'
    },
    signedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
