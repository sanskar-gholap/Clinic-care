const express = require('express');
const router = express.Router();
const BloodRequest = require('../models/BloodRequest');
const Facility = require('../models/Facility');
const { optionalAuth, authenticate } = require('../middleware/auth');

// @route   GET /api/blood/search
// @desc    Search blood availability across healthcare facilities & blood banks
router.get('/search', async (req, res) => {
  try {
    const { bloodGroup, location } = req.query;

    let query = {};
    if (location) {
      query.$or = [
        { city: { $regex: location, $options: 'i' } },
        { address: { $regex: location, $options: 'i' } },
        { pincode: { $regex: location, $options: 'i' } },
        { name: { $regex: location, $options: 'i' } }
      ];
    }

    const facilities = await Facility.find(query);

    const results = facilities.map((f) => {
      let matchingStock = f.bloodStock;
      if (bloodGroup) {
        matchingStock = f.bloodStock.filter((s) => s.bloodGroup === bloodGroup);
      }
      const totalUnits = matchingStock.reduce((acc, curr) => acc + curr.units, 0);

      return {
        facilityId: f._id,
        facilityName: f.name,
        facilityType: f.type,
        address: f.address,
        city: f.city,
        pincode: f.pincode,
        phone: f.phone,
        openHours: f.openHours,
        stock: matchingStock,
        totalUnitsAvailable: totalUnits,
        status: totalUnits > 5 ? 'Available' : totalUnits > 0 ? 'Low Stock' : 'Unavailable'
      };
    });

    return res.json({
      success: true,
      count: results.length,
      bloodGroup: bloodGroup || 'All',
      results
    });
  } catch (err) {
    console.error('Blood search error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to search blood inventory.',
      error: err.message
    });
  }
});

// @route   POST /api/blood/request
// @desc    Submit a blood requisition request
router.post('/request', optionalAuth, async (req, res) => {
  try {
    const { patientName, bloodGroup, units, hospital, contactPhone, urgency, notes } = req.body;

    if (!patientName || !bloodGroup || !hospital || !contactPhone) {
      return res.status(400).json({
        success: false,
        message: 'Patient name, blood group, hospital, and contact phone are required.'
      });
    }

    const bloodRequest = await BloodRequest.create({
      user: req.user ? req.user._id : undefined,
      patientName,
      bloodGroup,
      units: units ? Number(units) : 1,
      hospital,
      contactPhone,
      urgency: urgency || 'Urgent (Within 6h)',
      status: 'Pending',
      notes: notes || ''
    });

    return res.status(201).json({
      success: true,
      message: 'Blood request registered successfully! Donors and blood banks are being notified.',
      bloodRequest
    });
  } catch (err) {
    console.error('Blood request error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit blood request.',
      error: err.message
    });
  }
});

// @route   GET /api/blood/requests
// @desc    Get blood requests (user or admin)
router.get('/requests', authenticate, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const requests = await BloodRequest.find(filter).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (err) {
    console.error('Fetch blood requests error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve blood requests.',
      error: err.message
    });
  }
});

// @route   PATCH /api/blood/requests/:id/status
// @desc    Update blood request status
router.patch('/requests/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Approved', 'Fulfilled', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const bloodReq = await BloodRequest.findById(req.params.id);
    if (!bloodReq) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found.'
      });
    }

    if (req.user.role !== 'admin' && (!bloodReq.user || bloodReq.user.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this request.'
      });
    }

    bloodReq.status = status;
    await bloodReq.save();

    return res.json({
      success: true,
      message: `Blood request status updated to ${status}.`,
      bloodRequest: bloodReq
    });
  } catch (err) {
    console.error('Update blood request status error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update blood request status.',
      error: err.message
    });
  }
});

module.exports = router;
