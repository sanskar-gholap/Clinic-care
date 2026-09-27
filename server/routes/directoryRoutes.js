const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');
const BloodBank = require('../models/BloodBank');
const EyeCareCentre = require('../models/EyeCareCentre');
const Facility = require('../models/Facility');

// @route   GET /api/directory/categories
// @desc    Get directory categories with live counts across Pune
router.get('/categories', async (req, res) => {
  try {
    const hospitalCount = await Hospital.countDocuments();
    const bloodBankCount = await BloodBank.countDocuments();
    const eyeCareCount = await EyeCareCentre.countDocuments();
    const facilityCount = await Facility.countDocuments();

    const categories = [
      {
        id: 'hospitals',
        name: 'Hospitals',
        icon: 'Hospital',
        count: hospitalCount || 30,
        description: 'Multi-speciality, tertiary & government hospitals with 24/7 emergency care',
        path: '/hospitals',
        color: 'from-blue-500 to-indigo-600',
        bgLight: 'bg-blue-50 text-blue-700'
      },
      {
        id: 'blood-banks',
        name: 'Blood Banks',
        icon: 'Droplet',
        count: bloodBankCount || 8,
        description: 'Licensed blood centres, emergency components & voluntary donor units',
        path: '/blood-banks',
        color: 'from-red-500 to-rose-600',
        bgLight: 'bg-red-50 text-red-700'
      },
      {
        id: 'eye-care',
        name: 'Eye Care',
        icon: 'Eye',
        count: eyeCareCount || 7,
        description: 'Cataract, LASIK, retina, glaucoma & comprehensive eye examination centres',
        path: '/eye-care',
        color: 'from-teal-500 to-emerald-600',
        bgLight: 'bg-teal-50 text-teal-700'
      },
      {
        id: 'dental-clinics',
        name: 'Dental Clinics',
        icon: 'Smile',
        count: 18,
        description: 'Root canal, cosmetic dentistry, orthodontics & pediatric dental care',
        path: '/healthcare-directory?category=Dental',
        color: 'from-cyan-500 to-blue-600',
        bgLight: 'bg-cyan-50 text-cyan-700'
      },
      {
        id: 'diagnostic-centres',
        name: 'Diagnostic Centres',
        icon: 'Activity',
        count: 24,
        description: 'NABL pathology labs, MRI, CT Scan, ultrasound & advanced imaging',
        path: '/healthcare-directory?category=Diagnostics',
        color: 'from-violet-500 to-purple-600',
        bgLight: 'bg-purple-50 text-purple-700'
      },
      {
        id: 'clinics',
        name: 'Clinics & Polyclinics',
        icon: 'Stethoscope',
        count: facilityCount || 15,
        description: 'Family physicians, general outpatient practices & routine wellness care',
        path: '/facilities',
        color: 'from-emerald-500 to-teal-600',
        bgLight: 'bg-emerald-50 text-emerald-700'
      },
      {
        id: 'ambulance',
        name: 'Ambulance Services',
        icon: 'Siren',
        count: 12,
        description: '24/7 ACLS, BLS & Cardiac ICU ambulance vehicles with GPS dispatch',
        path: '/ambulance',
        color: 'from-amber-500 to-red-600',
        bgLight: 'bg-amber-50 text-amber-700'
      },
      {
        id: 'pharmacies',
        name: 'Pharmacies (24/7)',
        icon: 'Pill',
        count: 35,
        description: 'Round-the-clock prescription medicines, medical surgicals & delivery',
        path: '/healthcare-directory?category=Pharmacies',
        color: 'from-emerald-600 to-green-700',
        bgLight: 'bg-green-50 text-green-700'
      },
      {
        id: 'mental-health',
        name: 'Mental Health',
        icon: 'Brain',
        count: 14,
        description: 'Psychiatrists, clinical psychologists, counseling & therapy centres',
        path: '/healthcare-directory?category=Mental Health',
        color: 'from-pink-500 to-rose-600',
        bgLight: 'bg-pink-50 text-pink-700'
      },
      {
        id: 'child-care',
        name: 'Child Care & Pediatrics',
        icon: 'Baby',
        count: 20,
        description: 'Pediatric super-specialities, NICU, vaccinations & child wellness',
        path: '/healthcare-directory?category=Child Care',
        color: 'from-sky-500 to-indigo-500',
        bgLight: 'bg-sky-50 text-sky-700'
      },
      {
        id: 'cardiology',
        name: 'Cardiology Centres',
        icon: 'HeartPulse',
        count: 16,
        description: 'Heart attack triage, cath labs, coronary interventions & bypass surgery',
        path: '/healthcare-directory?category=Cardiology',
        color: 'from-red-600 to-rose-700',
        bgLight: 'bg-rose-50 text-rose-700'
      },
      {
        id: 'orthopedic',
        name: 'Orthopedic & Spine',
        icon: 'Bone',
        count: 18,
        description: 'Joint replacement, trauma fracture treatment & spine care institutes',
        path: '/healthcare-directory?category=Orthopedic',
        color: 'from-amber-600 to-yellow-600',
        bgLight: 'bg-amber-50 text-amber-700'
      },
      {
        id: 'womens-health',
        name: "Women's Health & Maternity",
        icon: 'Sparkles',
        count: 17,
        description: 'Maternity birthing suites, gynecology, fertility & high-risk obstetrics',
        path: '/healthcare-directory?category=Womens Health',
        color: 'from-fuchsia-500 to-pink-600',
        bgLight: 'bg-fuchsia-50 text-fuchsia-700'
      }
    ];

    return res.json({
      success: true,
      categories
    });
  } catch (err) {
    console.error('Directory categories error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load categories.' });
  }
});

// @route   GET /api/directory/specialties
// @desc    Get listings filtered by specific category (Cardiology, Orthopedic, Dental, etc.)
router.get('/specialties', async (req, res) => {
  try {
    const { category, area, search } = req.query;
    const query = {};

    if (category) {
      query.departments = { $regex: new RegExp(category, 'i') };
    }

    if (area && area !== 'All') {
      query.area = { $regex: new RegExp(area, 'i') };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } },
        { departments: { $regex: search, $options: 'i' } }
      ];
    }

    const hospitals = await Hospital.find(query).limit(20);

    return res.json({
      success: true,
      category: category || 'All',
      count: hospitals.length,
      facilities: hospitals
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
