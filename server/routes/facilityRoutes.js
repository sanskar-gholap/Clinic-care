const express = require('express');
const router = express.Router();
const Facility = require('../models/Facility');
const { authenticate, requireAdmin } = require('../middleware/auth');

// @route   GET /api/facilities
// @desc    Get all healthcare facilities
router.get('/', async (req, res) => {
  try {
    const { type, search } = req.query;
    let query = {};

    if (type && type !== 'All') {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { specialties: { $regex: search, $options: 'i' } }
      ];
    }

    const facilities = await Facility.find(query).sort({ rating: -1 });

    return res.json({
      success: true,
      count: facilities.length,
      facilities
    });
  } catch (err) {
    console.error('Fetch facilities error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve healthcare facilities.',
      error: err.message
    });
  }
});

// @route   GET /api/facilities/:id
// @desc    Get facility details
router.get('/:id', async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found.'
      });
    }
    return res.json({
      success: true,
      facility
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get facility details.',
      error: err.message
    });
  }
});

// @route   POST /api/facilities
// @desc    Add a new facility (Admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const facility = await Facility.create(req.body);
    return res.status(201).json({
      success: true,
      message: 'Facility created successfully.',
      facility
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create facility.',
      error: err.message
    });
  }
});

module.exports = router;
