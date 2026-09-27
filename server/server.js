const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const seedData = require('./seed');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/ambulance', require('./routes/ambulanceRoutes'));
app.use('/api/blood', require('./routes/bloodRoutes'));
app.use('/api/facilities', require('./routes/facilityRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/hospitals', require('./routes/hospitalRoutes'));
app.use('/api/blood-banks', require('./routes/bloodBankRoutes'));
app.use('/api/eye-care', require('./routes/eyeCareRoutes'));
app.use('/api/directory', require('./routes/directoryRoutes'));
app.use('/api/medicines', require('./routes/medicineRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/doctor', require('./routes/clinicalReviewRoutes'));

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    await seedData();

    app.listen(PORT, () => {
      console.log(`===========================================`);
      console.log(`Clinic Care Backend running on port ${PORT}`);
      console.log(`API Base: http://localhost:${PORT}/api`);
      console.log(`Health:   http://localhost:${PORT}/api/health`);
      console.log(`===========================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
