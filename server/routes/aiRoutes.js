const express = require('express');
const router = express.Router();
const Condition = require('../models/Condition');
const { optionalAuth, authenticate, requireAdmin } = require('../middleware/auth');
const { processAIDoctorChat, performSymptomAssessment } = require('../services/aiDoctorService');

// @route   POST /api/ai/chat
// @desc    Process conversational chat with ClinicCare AI Doctor
router.post('/chat', optionalAuth, async (req, res) => {
  try {
    const { messages, message } = req.body;
    let userMessage = message;

    if (!userMessage && Array.isArray(messages) && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      userMessage = lastMsg.content;
    }

    if (!userMessage) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload: user message or messages array is required.'
      });
    }

    const response = await processAIDoctorChat({
      message: userMessage,
      conversationHistory: messages || [],
      user: req.user
    });

    return res.json({
      success: true,
      message: {
        role: 'assistant',
        content: response.content,
        isEmergency: response.isEmergency || false,
        suggestedActions: response.suggestedActions || []
      }
    });
  } catch (err) {
    console.error('AI chat endpoint error:', err);
    return res.status(500).json({
      success: false,
      message: 'ClinicCare AI Doctor is temporarily recalibrating. You can still access doctors and emergency services directly.',
      error: err.message
    });
  }
});

// @route   POST /api/ai/symptom-assessment
// @desc    Perform structured clinical symptom intake & triage assessment
router.post('/symptom-assessment', optionalAuth, async (req, res) => {
  try {
    const {
      patientName,
      age,
      sex,
      symptoms,
      duration,
      severity,
      temperature,
      existingConditions,
      allergies,
      currentMedicines,
      riskFactors
    } = req.body;

    if (!symptoms || !symptoms.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a description of your symptoms to conduct an assessment.'
      });
    }

    const result = await performSymptomAssessment({
      patientName: patientName || req.user?.name || 'Patient',
      patientId: req.user?._id,
      age,
      sex,
      symptoms: symptoms.trim(),
      duration,
      severity,
      temperature,
      existingConditions,
      allergies,
      currentMedicines,
      riskFactors
    });

    return res.status(201).json(result);
  } catch (err) {
    console.error('Symptom assessment error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete symptom assessment. Please consult a physician directly.',
      error: err.message
    });
  }
});

// @route   GET /api/ai/conditions
// @desc    Get 100+ verified health conditions with search & category filters
router.get('/conditions', async (req, res) => {
  try {
    const { search, category, urgency, limit = 50, page = 1 } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(category, 'i') };
    }

    if (urgency && urgency !== 'All') {
      query.urgencyLevel = urgency;
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { category: { $regex: s, $options: 'i' } },
        { commonSymptoms: { $regex: s, $options: 'i' } },
        { generalInformation: { $regex: s, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Condition.countDocuments(query);
    const conditions = await Condition.find(query)
      .sort({ category: 1, name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const categories = await Condition.distinct('category');

    return res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      count: conditions.length,
      categories,
      conditions
    });
  } catch (err) {
    console.error('Fetch conditions error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve conditions.', error: err.message });
  }
});

// @route   GET /api/ai/conditions/:id
// @desc    Get single condition record
router.get('/conditions/:id', async (req, res) => {
  try {
    const condition = await Condition.findById(req.params.id);
    if (!condition) {
      return res.status(404).json({ success: false, message: 'Health condition not found.' });
    }
    return res.json({ success: true, condition });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Admin endpoints for conditions
router.post('/conditions', authenticate, requireAdmin, async (req, res) => {
  try {
    const condition = await Condition.create(req.body);
    return res.status(201).json({ success: true, condition });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/conditions/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const condition = await Condition.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!condition) return res.status(404).json({ success: false, message: 'Condition not found.' });
    return res.json({ success: true, condition });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/conditions/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await Condition.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Condition deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
