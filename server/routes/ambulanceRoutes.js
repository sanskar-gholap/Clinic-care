const express = require('express');
const router = express.Router();
const AmbulanceRequest = require('../models/AmbulanceRequest');
const { optionalAuth, authenticate } = require('../middleware/auth');

// @route   POST /api/ambulance
// @desc    Submit an urgent ambulance dispatch request
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { patientName, phone, pickupLocation, emergencyType, urgency, notes } = req.body;

    if (!patientName || !phone || !pickupLocation) {
      return res.status(400).json({
        success: false,
        message: 'Patient name, contact phone, and pickup location are required.'
      });
    }

    const ambulance = await AmbulanceRequest.create({
      user: req.user ? req.user._id : undefined,
      patientName,
      phone,
      pickupLocation,
      emergencyType: emergencyType || 'General Medical Emergency',
      urgency: urgency || 'Critical',
      notes: notes || '',
      status: 'Dispatching',
      eta: '8-12 mins',
      driverName: 'Paramedic Unit Echo-4'
    });

    return res.status(201).json({
      success: true,
      message: 'Ambulance dispatched successfully! Medical crew is en route.',
      ambulance
    });
  } catch (err) {
    console.error('Ambulance request error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to process ambulance dispatch.',
      error: err.message
    });
  }
});

// @route   GET /api/ambulance
// @desc    Get ambulance requests
router.get('/', authenticate, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const requests = await AmbulanceRequest.find(filter).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (err) {
    console.error('Fetch ambulance requests error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve ambulance requests.',
      error: err.message
    });
  }
});

// @route   GET /api/ambulance/:id
// @desc    Track ambulance request by ID
router.get('/:id', async (req, res) => {
  try {
    const ambulance = await AmbulanceRequest.findById(req.params.id);
    if (!ambulance) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance request not found.'
      });
    }
    return res.json({
      success: true,
      ambulance
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch ambulance status.',
      error: err.message
    });
  }
});

// @route   PATCH /api/ambulance/:id/status
// @desc    Update ambulance dispatch status (admin or paramedic)
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status, eta, driverName } = req.body;
    const validStatuses = ['Dispatching', 'En Route', 'Arrived', 'Completed', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const ambulance = await AmbulanceRequest.findById(req.params.id);
    if (!ambulance) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance request not found.'
      });
    }

    if (req.user.role !== 'admin' && (!ambulance.user || ambulance.user.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to modify this ambulance dispatch.'
      });
    }

    ambulance.status = status;
    if (eta) ambulance.eta = eta;
    if (driverName) ambulance.driverName = driverName;
    await ambulance.save();

    return res.json({
      success: true,
      message: `Ambulance dispatch updated to ${status}.`,
      ambulance
    });
  } catch (err) {
    console.error('Update ambulance error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update ambulance status.',
      error: err.message
    });
  }
});

module.exports = router;
