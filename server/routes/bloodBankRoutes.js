const express = require('express');
const router = express.Router();
const BloodBank = require('../models/BloodBank');
const { authenticate, requireAdmin } = require('../middleware/auth');

// @route   GET /api/blood-banks
// @desc    Get verified Pune blood banks with blood-group filter & search
router.get('/', async (req, res) => {
  try {
    const { search, area, bloodGroup } = req.query;

    const query = {};

    if (area && area !== 'All') {
      query.area = { $regex: new RegExp(area, 'i') };
    }

    if (bloodGroup && bloodGroup !== 'All') {
      query.availableBloodGroups = bloodGroup;
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { address: { $regex: s, $options: 'i' } },
        { area: { $regex: s, $options: 'i' } },
        { hospitalAffiliation: { $regex: s, $options: 'i' } }
      ];
    }

    const bloodBanks = await BloodBank.find(query).sort({ isVerified: -1, name: 1 });

    return res.json({
      success: true,
      count: bloodBanks.length,
      bloodBanks
    });
  } catch (err) {
    console.error('Fetch blood banks error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve blood banks directory.',
      error: err.message
    });
  }
});

// @route   GET /api/blood-banks/:id
// @desc    Get single blood bank
router.get('/:id', async (req, res) => {
  try {
    const bloodBank = await BloodBank.findById(req.params.id);
    if (!bloodBank) {
      return res.status(404).json({
        success: false,
        message: 'Blood bank not found.'
      });
    }
    return res.json({
      success: true,
      bloodBank
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve blood bank details.',
      error: err.message
    });
  }
});

// Admin endpoints
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const bloodBank = await BloodBank.create(req.body);
    return res.status(201).json({ success: true, bloodBank });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const bloodBank = await BloodBank.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bloodBank) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, bloodBank });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await BloodBank.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Blood bank deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
