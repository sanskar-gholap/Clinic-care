const express = require('express');
const router = express.Router();
const Consultation = require('../models/Consultation');
const Prescription = require('../models/Prescription');
const Doctor = require('../models/Doctor');
const Medicine = require('../models/Medicine');
const { authenticate, requireDoctorOrAdmin } = require('../middleware/auth');

// @route   GET /api/doctor/consultations
// @desc    Get all AI consultations requiring or undergoing doctor review
router.get('/consultations', authenticate, async (req, res) => {
  try {
    const { status, urgency } = req.query;
    const query = {};

    // If user is a patient, only show their own consultations
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (urgency && urgency !== 'All') {
      query['aiAssessment.urgencyLevel'] = urgency;
    }

    const consultations = await Consultation.find(query)
      .populate('reviewedByDoctor', 'name specialty clinicOrHospital')
      .populate('prescription')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: consultations.length,
      consultations
    });
  } catch (err) {
    console.error('Fetch consultations error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve clinical consultations.', error: err.message });
  }
});

// @route   GET /api/doctor/consultations/:id
// @desc    Get single consultation details
router.get('/consultations/:id', authenticate, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('reviewedByDoctor')
      .populate('prescription');

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation record not found.' });
    }

    return res.json({ success: true, consultation });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/doctor/review
// @desc    Doctor reviews AI consultation (Approve, Modify, Reject, Request More Information)
router.post('/review', authenticate, requireDoctorOrAdmin, async (req, res) => {
  try {
    const { consultationId, decision, doctorNotes, clinicalImpression, actionPlan } = req.body;

    if (!consultationId || !decision) {
      return res.status(400).json({ success: false, message: 'Consultation ID and clinical decision are required.' });
    }

    const validDecisions = ['Approve', 'Modify', 'Reject', 'Request More Information'];
    if (!validDecisions.includes(decision)) {
      return res.status(400).json({ success: false, message: `Invalid decision. Must be one of: ${validDecisions.join(', ')}` });
    }

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found.' });
    }

    // Determine status based on decision
    let newStatus = 'Under Doctor Review';
    if (decision === 'Approve') newStatus = 'Approved by Doctor';
    else if (decision === 'Modify') newStatus = 'Modified by Doctor';
    else if (decision === 'Reject') newStatus = 'Rejected by Doctor';
    else if (decision === 'Request More Information') newStatus = 'More Information Requested';

    // Find doctor record if linked
    const doctorRecord = await Doctor.findOne({ email: req.user.email });

    consultation.status = newStatus;
    consultation.reviewedByDoctor = doctorRecord?._id || undefined;
    consultation.doctorDecision = {
      decision,
      doctorNotes: doctorNotes || '',
      clinicalImpression: clinicalImpression || '',
      actionPlan: actionPlan || '',
      reviewedAt: new Date()
    };

    await consultation.save();

    return res.json({
      success: true,
      message: `Consultation marked as "${newStatus}" by ${req.user.name}.`,
      consultation
    });
  } catch (err) {
    console.error('Doctor review error:', err);
    return res.status(500).json({ success: false, message: 'Failed to record doctor review.', error: err.message });
  }
});

// @route   POST /api/doctor/prescription
// @desc    Doctor formulates and signs official prescription
router.post('/prescription', authenticate, requireDoctorOrAdmin, async (req, res) => {
  try {
    const {
      consultationId,
      medications,
      clinicalImpression,
      dietaryLifestyleAdvice,
      followUp
    } = req.body;

    if (!consultationId || !medications || !Array.isArray(medications) || medications.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Consultation ID and at least one medication item are required to issue a prescription.'
      });
    }

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Associated consultation not found.' });
    }

    const doctorRecord = await Doctor.findOne({ email: req.user.email });

    const formattedMedications = medications.map(m => ({
      medicineName: m.medicineName || m.name || 'Medication',
      name: m.name || m.medicineName || 'Medication',
      dosage: m.dosage || 'As advised',
      frequency: m.frequency || 'Twice daily',
      duration: m.duration || '5 days',
      instructions: m.instructions || 'Take as advised with water.'
    }));

    const newPrescription = await Prescription.create({
      consultation: consultation._id,
      patient: consultation.patient || undefined,
      patientName: consultation.patientName,
      doctor: doctorRecord?._id || undefined,
      doctorName: req.user.name,
      doctorSpecialty: doctorRecord?.specialty || 'General Medicine',
      doctorRegistrationNumber: doctorRecord?.registrationNumber || 'MMC-2015-84920',
      clinicOrHospital: doctorRecord?.clinicOrHospital || 'ClinicCare Healthcare Super Speciality Centre, Pune',
      medications: formattedMedications,
      clinicalImpression: clinicalImpression || consultation.aiAssessment?.possibleCauses?.[0] || 'Clinical Assessment Completed',
      dietaryLifestyleAdvice: dietaryLifestyleAdvice || 'Hydrate well, rest adequately, and maintain a balanced diet.',
      followUp: followUp || 'Review in 5-7 days or sooner if symptoms persist or escalate.',
      status: 'Signed and Finalized',
      signedAt: new Date()
    });

    // Link prescription to consultation
    consultation.prescription = newPrescription._id;
    consultation.status = 'Approved by Doctor';
    if (!consultation.doctorDecision.decision || consultation.doctorDecision.decision === 'Pending') {
      consultation.doctorDecision = {
        decision: 'Approve',
        doctorNotes: `Prescription issued with ${medications.length} medication(s).`,
        clinicalImpression: clinicalImpression || '',
        actionPlan: 'Follow prescribed medication schedule.',
        reviewedAt: new Date()
      };
    }
    await consultation.save();

    return res.status(201).json({
      success: true,
      message: 'Official doctor prescription signed and generated successfully.',
      prescription: newPrescription,
      consultation
    });
  } catch (err) {
    console.error('Prescription issue error:', err);
    return res.status(500).json({ success: false, message: 'Failed to issue prescription.', error: err.message });
  }
});

// @route   GET /api/doctor/prescriptions
// @desc    Get prescriptions issued by doctor or patient prescriptions
router.get('/prescriptions', authenticate, async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    }

    const prescriptions = await Prescription.find(query)
      .populate('consultation')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: prescriptions.length,
      prescriptions
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
