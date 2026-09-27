const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const { authenticate, requireAdmin } = require('../middleware/auth');

// @route   GET /api/medicines
// @desc    Get verified medicines database with search & filters
router.get('/', async (req, res) => {
  try {
    const { search, category, status, limit = 50, page = 1 } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(category, 'i') };
    }

    if (status && status !== 'All') {
      query.prescriptionStatus = status;
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { genericName: { $regex: s, $options: 'i' } },
        { brandExamples: { $regex: s, $options: 'i' } },
        { category: { $regex: s, $options: 'i' } },
        { commonUses: { $regex: s, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Medicine.countDocuments(query);
    let medicines;
    
    if (search && search.trim()) {
      const sLower = search.trim().toLowerCase();
      const allMatches = await Medicine.find(query);
      allMatches.sort((a, b) => {
        const aExact = a.genericName?.toLowerCase() === sLower;
        const bExact = b.genericName?.toLowerCase() === sLower;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        const aStarts = a.genericName?.toLowerCase().startsWith(sLower);
        const bStarts = b.genericName?.toLowerCase().startsWith(sLower);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        return (a.genericName || '').localeCompare(b.genericName || '');
      });
      medicines = allMatches.slice(skip, skip + parseInt(limit));
    } else {
      medicines = await Medicine.find(query)
        .sort({ genericName: 1 })
        .skip(skip)
        .limit(parseInt(limit));
    }

    // Get unique categories for filter dropdown
    const categories = await Medicine.distinct('category');

    return res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      count: medicines.length,
      categories,
      medicines
    });
  } catch (err) {
    console.error('Fetch medicines error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve medicines directory.',
      error: err.message
    });
  }
});

// @route   GET /api/medicines/:id
// @desc    Get single medicine details
router.get('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }
    return res.json({ success: true, medicine });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/medicines
// @desc    Add new medicine (Admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const medicine = await Medicine.create(req.body);
    return res.status(201).json({ success: true, medicine });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// @route   PUT /api/medicines/:id
// @desc    Update medicine (Admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    return res.json({ success: true, medicine });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// @route   DELETE /api/medicines/:id
// @desc    Delete medicine (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Medicine deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
