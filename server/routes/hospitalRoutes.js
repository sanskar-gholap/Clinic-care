const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');
const { authenticate, requireAdmin } = require('../middleware/auth');

// @route   GET /api/hospitals
// @desc    Get verified hospitals in Pune & PCMC with search & filters
router.get('/', async (req, res) => {
  try {
    const { search, area, location, type, emergency, department, page = 1, limit = 50 } = req.query;

    const query = {};

    // Area / Location filter
    const targetArea = area || location;
    if (targetArea && targetArea !== 'All') {
      query.area = { $regex: new RegExp(targetArea, 'i') };
    }

    // Hospital Type filter
    if (type && type !== 'All') {
      query.type = type;
    }

    // Emergency filter
    if (emergency === 'true') {
      query.emergencyAvailable = true;
    }

    // Department filter
    if (department && department !== 'All') {
      query.departments = { $regex: new RegExp(department, 'i') };
    }

    // Search query across name, address, area, departments
    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { area: { $regex: s, $options: 'i' } },
        { address: { $regex: s, $options: 'i' } },
        { departments: { $regex: s, $options: 'i' } },
        { type: { $regex: s, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Hospital.countDocuments(query);
    const hospitals = await Hospital.find(query)
      .sort({ rating: -1, isVerified: -1, name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      count: hospitals.length,
      hospitals
    });
  } catch (err) {
    console.error('Fetch hospitals error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve hospitals directory.',
      error: err.message
    });
  }
});

// @route   GET /api/hospitals/:id
// @desc    Get single hospital details
router.get('/:id', async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found.'
      });
    }
    return res.json({
      success: true,
      hospital
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve hospital details.',
      error: err.message
    });
  }
});

// @route   POST /api/hospitals
// @desc    Create new hospital (Admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const hospital = await Hospital.create(req.body);
    return res.status(201).json({
      success: true,
      message: 'Hospital added successfully.',
      hospital
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Failed to create hospital.',
      error: err.message
    });
  }
});

// @route   PUT /api/hospitals/:id
// @desc    Update hospital details / verification (Admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found.'
      });
    }
    return res.json({
      success: true,
      message: 'Hospital updated successfully.',
      hospital
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Failed to update hospital.',
      error: err.message
    });
  }
});

// @route   DELETE /api/hospitals/:id
// @desc    Delete hospital (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found.'
      });
    }
    return res.json({
      success: true,
      message: 'Hospital deleted successfully.'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete hospital.',
      error: err.message
    });
  }
});

module.exports = router;
