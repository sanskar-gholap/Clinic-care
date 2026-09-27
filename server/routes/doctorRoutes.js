const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const Consultation = require('../models/Consultation');
const Prescription = require('../models/Prescription');
const User = require('../models/User');
const { authenticate, optionalAuth, requireAdmin, requireDoctorOrAdmin } = require('../middleware/auth');

// ==========================================
// 1. DOCTOR DIRECTORY & SCHEDULING APIS
// ==========================================

// @route   GET /api/doctors
// @desc    Get verified doctors with search, specialty, and area filter
router.get('/', async (req, res) => {
  try {
    const { search, specialty, area, consultationType, limit = 50 } = req.query;
    const query = {};

    if (specialty && specialty !== 'All') {
      query.specialty = { $regex: new RegExp(specialty, 'i') };
    }

    if (area && area !== 'All') {
      query.area = { $regex: new RegExp(area, 'i') };
    }

    if (consultationType && consultationType !== 'All') {
      query.consultationTypes = consultationType;
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { specialty: { $regex: s, $options: 'i' } },
        { clinicOrHospital: { $regex: s, $options: 'i' } },
        { area: { $regex: s, $options: 'i' } }
      ];
    }

    const doctors = await Doctor.find(query).sort({ rating: -1, experienceYears: -1 }).limit(parseInt(limit));
    const specialties = await Doctor.distinct('specialty');
    const areas = await Doctor.distinct('area');

    return res.json({
      success: true,
      count: doctors.length,
      specialties,
      areas,
      doctors
    });
  } catch (err) {
    console.error('Fetch doctors error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve doctors.', error: err.message });
  }
});

// @route   GET /api/doctors/available
// @desc    Get available doctors with time slots for automated scheduling
router.get('/available', async (req, res) => {
  try {
    const { specialty, day } = req.query;
    const query = {};

    if (specialty && specialty !== 'All') {
      query.specialty = { $regex: new RegExp(specialty, 'i') };
    }

    if (day) {
      query.availableDays = day;
    }

    const doctors = await Doctor.find(query)
      .select('name specialty clinicOrHospital area consultationFee availableDays availableSlots rating consultationTypes phone')
      .sort({ rating: -1 });

    return res.json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/doctors/:id
// @desc    Get single doctor profile
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }
    return res.json({ success: true, doctor });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/doctors (Admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    return res.status(201).json({ success: true, doctor });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// @route   PUT /api/doctors/:id (Admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });
    return res.json({ success: true, doctor });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// @route   DELETE /api/doctors/:id (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Doctor deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
