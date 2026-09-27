const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin'],
      default: 'patient'
    },
    phone: {
      type: String,
      default: ''
    },
    lastLogin: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['Active', 'Suspended', 'Pending'],
      default: 'Active'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
