const mongoose = require('mongoose');

const loginAttemptSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    ipAddress: {
      type: String,
      default: ''
    },
    success: {
      type: Boolean,
      default: false
    },
    reason: {
      type: String,
      default: ''
    },
    attemptedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

loginAttemptSchema.index({ email: 1, attemptedAt: -1 });

module.exports = mongoose.model('LoginAttempt', loginAttemptSchema);
