const express = require('express');
const router = express.Router();
const PatientProfile = require('../models/PatientProfile');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// @route   GET /api/profile
// @desc    Get current user profile
router.get('/', authenticate, async (req, res) => {
  try {
    let profile = await PatientProfile.findOne({ user: req.user._id });

    if (!profile) {
      const nameParts = (req.user.name || '').trim().split(' ');
      profile = await PatientProfile.create({
        user: req.user._id,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: req.user.email,
        phone: req.user.phone || '',
        bloodGroup: 'O+'
      });
    }

    return res.json({
      success: true,
      profile,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (err) {
    console.error('Fetch profile error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile.',
      error: err.message
    });
  }
});

// @route   PUT /api/profile
// @desc    Update current user profile
router.put('/', authenticate, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      medicalHistory,
      vitals
    } = req.body;

    let profile = await PatientProfile.findOne({ user: req.user._id });

    if (!profile) {
      profile = new PatientProfile({ user: req.user._id });
    }

    if (firstName !== undefined) profile.firstName = firstName;
    if (lastName !== undefined) profile.lastName = lastName;
    if (email !== undefined) profile.email = email;
    if (phone !== undefined) profile.phone = phone;
    if (dateOfBirth !== undefined) profile.dateOfBirth = dateOfBirth;
    if (gender !== undefined) profile.gender = gender;
    if (bloodGroup !== undefined) profile.bloodGroup = bloodGroup;
    if (address !== undefined) profile.address = address;
    if (emergencyContact !== undefined) profile.emergencyContact = emergencyContact;
    if (medicalHistory !== undefined) profile.medicalHistory = medicalHistory;
    if (vitals !== undefined) {
      profile.vitals = { ...profile.vitals.toObject(), ...vitals };
    }

    await profile.save();

    // If firstName or lastName changed, sync User name
    if (firstName || lastName) {
      const fullName = `${profile.firstName} ${profile.lastName}`.trim();
      if (fullName) {
        await User.findByIdAndUpdate(req.user._id, { name: fullName });
      }
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      profile
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile.',
      error: err.message
    });
  }
});

module.exports = router;
