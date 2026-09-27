const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { authenticate } = require('../middleware/auth');

// @route   GET /api/appointments
// @desc    Get user appointments (or all for admin)
router.get('/', authenticate, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { patient: req.user._id };
    const appointments = await Appointment.find(filter).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (err) {
    console.error('Fetch appointments error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments.',
      error: err.message
    });
  }
});

// @route   POST /api/appointments
// @desc    Book a new appointment
router.post('/', authenticate, async (req, res) => {
  try {
    const { specialty, doctorName, date, time, reason, notes } = req.body;

    if (!specialty || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Specialty, date, and time are required.'
      });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      patientName: req.user.name,
      patientEmail: req.user.email,
      patientPhone: req.user.phone || '',
      specialty,
      doctorName: doctorName || 'Dr. Eleanor Sterling',
      date,
      time,
      reason: reason || '',
      notes: notes || '',
      status: 'Pending'
    });

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully.',
      appointment
    });
  } catch (err) {
    console.error('Book appointment error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to book appointment.',
      error: err.message
    });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get single appointment details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.'
      });
    }

    if (req.user.role !== 'admin' && appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment.'
      });
    }

    return res.json({
      success: true,
      appointment
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve appointment.',
      error: err.message
    });
  }
});

// @route   PATCH /api/appointments/:id/status
// @desc    Update appointment status (admin or patient cancel)
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.'
      });
    }

    // Patients can only cancel their own appointments
    if (req.user.role !== 'admin') {
      if (appointment.patient.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to modify this appointment.'
        });
      }
      if (status !== 'Cancelled') {
        return res.status(403).json({
          success: false,
          message: 'Patients can only cancel appointments. Contact clinic for confirmation.'
        });
      }
    }

    appointment.status = status;
    await appointment.save();

    return res.json({
      success: true,
      message: `Appointment status updated to ${status}.`,
      appointment
    });
  } catch (err) {
    console.error('Update appointment status error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update appointment status.',
      error: err.message
    });
  }
});

module.exports = router;
