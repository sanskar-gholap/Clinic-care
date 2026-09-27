const express = require('express');
const router = express.Router();
const EyeCareCentre = require('../models/EyeCareCentre');
const { authenticate, requireAdmin } = require('../middleware/auth');

// @route   GET /api/eye-care
// @desc    Get verified Pune eye clinics and eye hospitals with category & area filter
router.get('/', async (req, res) => {
  try {
    const { search, area, category } = req.query;

    const query = {};

    if (area && area !== 'All') {
      query.area = { $regex: new RegExp(area, 'i') };
    }

    if (category && category !== 'All') {
      query.categories = { $regex: new RegExp(category, 'i') };
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { address: { $regex: s, $options: 'i' } },
        { area: { $regex: s, $options: 'i' } },
        { services: { $regex: s, $options: 'i' } },
        { categories: { $regex: s, $options: 'i' } }
      ];
    }

    const eyeCentres = await EyeCareCentre.find(query).sort({ rating: -1, isVerified: -1 });

    return res.json({
      success: true,
      count: eyeCentres.length,
      eyeCentres
    });
  } catch (err) {
    console.error('Fetch eye care centres error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve eye care directory.',
      error: err.message
    });
  }
});

// @route   GET /api/eye-care/:id
// @desc    Get single eye care centre
router.get('/:id', async (req, res) => {
  try {
    const centre = await EyeCareCentre.findById(req.params.id);
    if (!centre) {
      return res.status(404).json({
        success: false,
        message: 'Eye care centre not found.'
      });
    }
    return res.json({
      success: true,
      centre
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve eye care centre details.',
      error: err.message
    });
  }
});

// Admin endpoints
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const centre = await EyeCareCentre.create(req.body);
    return res.status(201).json({ success: true, centre });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const centre = await EyeCareCentre.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!centre) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, centre });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await EyeCareCentre.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Eye care centre deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
