const bcrypt = require('bcryptjs');
const User = require('./models/User');
const PatientProfile = require('./models/PatientProfile');
const Facility = require('./models/Facility');
const Appointment = require('./models/Appointment');
const AmbulanceRequest = require('./models/AmbulanceRequest');
const BloodRequest = require('./models/BloodRequest');
const Hospital = require('./models/Hospital');
const BloodBank = require('./models/BloodBank');
const EyeCareCentre = require('./models/EyeCareCentre');
const { hospitalsData, bloodBanksData, eyeCareCentresData } = require('./puneDirectoryData');

const seedData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already contains records. Ensuring admin and default facilities exist...');
    }

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const patientPassword = await bcrypt.hash('patient123', salt);

    // 1. Seed or find Admin
    let admin = await User.findOne({ email: 'admin@cliniccare.com' });
    if (!admin) {
      admin = await User.create({
        name: 'System Administrator',
        email: 'admin@cliniccare.com',
        password: adminPassword,
        role: 'admin',
        phone: '+1 (555) 900-1122'
      });
      console.log('Created Admin: admin@cliniccare.com / admin123');
    }

    // 2. Seed or find Demo Patient (Sarah Smith)
    let patient = await User.findOne({ email: 'sarah.smith@example.com' });
    if (!patient) {
      patient = await User.create({
        name: 'Sarah Smith',
        email: 'sarah.smith@example.com',
        password: patientPassword,
        role: 'patient',
        phone: '+1 (555) 234-5678'
      });
      console.log('Created Demo Patient: sarah.smith@example.com / patient123');
    }

    // 3. Patient Profile
    let profile = await PatientProfile.findOne({ user: patient._id });
    if (!profile) {
      profile = await PatientProfile.create({
        user: patient._id,
        firstName: 'Sarah',
        lastName: 'Smith',
        email: 'sarah.smith@example.com',
        phone: '+1 (555) 234-5678',
        dateOfBirth: '1994-06-15',
        gender: 'Female',
        bloodGroup: 'O+',
        address: '742 Evergreen Terrace, Sector 4',
        emergencyContact: '+1 (555) 987-6543 (Mark Smith - Spouse)',
        medicalHistory: ['Mild Asthmatic Bronchitis (2022)', 'Penicillin Allergy'],
        vitals: {
          bloodPressure: '120/80',
          weight: '68',
          height: '175',
          healthScore: 92
        }
      });
    }

    // 4. Facilities with real blood inventory
    const facilityCount = await Facility.countDocuments();
    if (facilityCount === 0) {
      await Facility.create([
        {
          name: 'City General Hospital',
          type: 'Hospital',
          address: '123 Healthcare Ave, Medical District',
          city: 'Metropolis',
          pincode: '10001',
          phone: '+1 (555) 019-2834',
          rating: 4.9,
          openHours: '24/7 Emergency & Care',
          specialties: ['Cardiology', 'Emergency', 'Neurology', 'Pediatrics', 'Oncology'],
          availableBeds: 45,
          image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=800',
          bloodStock: [
            { bloodGroup: 'A+', units: 28 },
            { bloodGroup: 'A-', units: 14 },
            { bloodGroup: 'B+', units: 35 },
            { bloodGroup: 'B-', units: 12 },
            { bloodGroup: 'AB+', units: 10 },
            { bloodGroup: 'AB-', units: 6 },
            { bloodGroup: 'O+', units: 50 },
            { bloodGroup: 'O-', units: 18 }
          ]
        },
        {
          name: 'St. Jude Medical Center',
          type: 'Hospital',
          address: '456 Wellness Blvd, East Wing',
          city: 'Metropolis',
          pincode: '10002',
          phone: '+1 (555) 432-8765',
          rating: 4.8,
          openHours: '24/7 Open',
          specialties: ['Cardiology', 'Orthopedics', 'Dermatology', 'Diagnostics'],
          availableBeds: 28,
          image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800',
          bloodStock: [
            { bloodGroup: 'A+', units: 15 },
            { bloodGroup: 'B+', units: 20 },
            { bloodGroup: 'O+', units: 24 },
            { bloodGroup: 'O-', units: 8 }
          ]
        },
        {
          name: 'Metro Care Urgent Clinic',
          type: 'Clinic',
          address: '789 Central Square, Suite 200',
          city: 'Metropolis',
          pincode: '10001',
          phone: '+1 (555) 789-0123',
          rating: 4.7,
          openHours: '7:00 AM - 11:00 PM',
          specialties: ['General Practice', 'Urgent Care', 'Pediatrics'],
          availableBeds: 12,
          image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
          bloodStock: [
            { bloodGroup: 'O+', units: 12 },
            { bloodGroup: 'A+', units: 9 }
          ]
        },
        {
          name: 'Beacon Hill Diagnostics & Imaging',
          type: 'Diagnostics',
          address: '321 Beacon St, North Tower',
          city: 'Metropolis',
          pincode: '10003',
          phone: '+1 (555) 654-3210',
          rating: 4.9,
          openHours: '6:00 AM - 9:00 PM',
          specialties: ['MRI & CT', 'Pathology Lab', 'Ultrasound', 'Blood Tests'],
          availableBeds: 6,
          image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800',
          bloodStock: [
            { bloodGroup: 'A+', units: 10 },
            { bloodGroup: 'B+', units: 10 },
            { bloodGroup: 'O+', units: 15 }
          ]
        },
        {
          name: 'Hope Specialized Children Hospital',
          type: 'Specialty Center',
          address: '88 Children Way, South Quarter',
          city: 'Metropolis',
          pincode: '10004',
          phone: '+1 (555) 987-1100',
          rating: 4.9,
          openHours: '24/7 Open',
          specialties: ['Pediatrics', 'Neonatal ICU', 'Pediatric Surgery'],
          availableBeds: 40,
          image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=800',
          bloodStock: [
            { bloodGroup: 'O+', units: 30 },
            { bloodGroup: 'O-', units: 15 },
            { bloodGroup: 'A+', units: 20 },
            { bloodGroup: 'B+', units: 18 }
          ]
        },
        {
          name: 'Greenfield Community Health Center',
          type: 'Clinic',
          address: '55 Greenway Rd, Greenfield',
          city: 'Metropolis',
          pincode: '10005',
          phone: '+1 (555) 345-6789',
          rating: 4.6,
          openHours: '8:00 AM - 8:00 PM',
          specialties: ['General Practice', 'Family Medicine', 'Vaccinations'],
          availableBeds: 8,
          image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=800',
          bloodStock: [
            { bloodGroup: 'A+', units: 8 },
            { bloodGroup: 'O+', units: 10 }
          ]
        }
      ]);
      console.log('Seeded healthcare facilities and blood stock.');
    }

    // 5. Seed Appointments
    const apptCount = await Appointment.countDocuments();
    if (apptCount === 0 && patient) {
      await Appointment.create([
        {
          patient: patient._id,
          patientName: 'Sarah Smith',
          patientEmail: 'sarah.smith@example.com',
          patientPhone: '+1 (555) 234-5678',
          specialty: 'Cardiology',
          doctorName: 'Dr. Eleanor Sterling',
          date: '2026-10-12',
          time: '10:00 AM',
          reason: 'Routine cardiovascular checkup and ECG consultation.',
          status: 'Confirmed'
        },
        {
          patient: patient._id,
          patientName: 'Sarah Smith',
          patientEmail: 'sarah.smith@example.com',
          patientPhone: '+1 (555) 234-5678',
          specialty: 'General Practice',
          doctorName: 'Dr. Johnson',
          date: '2026-09-20',
          time: '02:30 PM',
          reason: 'Seasonal allergy follow-up and prescription renewal.',
          status: 'Completed'
        }
      ]);
      console.log('Seeded initial appointments.');
    }

    // 6. Seed Ambulance Request
    const ambulanceCount = await AmbulanceRequest.countDocuments();
    if (ambulanceCount === 0 && patient) {
      await AmbulanceRequest.create({
        user: patient._id,
        patientName: 'Sarah Smith',
        phone: '+1 (555) 234-5678',
        pickupLocation: '742 Evergreen Terrace, Sector 4',
        emergencyType: 'Acute Chest Tightness',
        urgency: 'Critical',
        notes: 'Patient reports difficulty breathing and elevated heart rate.',
        status: 'En Route',
        eta: '6 mins',
        driverName: 'Paramedic Unit Echo-4'
      });
      console.log('Seeded initial ambulance request.');
    }

    // 7. Seed Blood Request
    const bloodReqCount = await BloodRequest.countDocuments();
    if (bloodReqCount === 0 && patient) {
      await BloodRequest.create({
        user: patient._id,
        patientName: 'Sarah Smith',
        bloodGroup: 'O+',
        units: 2,
        hospital: 'City General Hospital',
        contactPhone: '+1 (555) 234-5678',
        urgency: 'Urgent (Within 6h)',
        status: 'Pending',
        notes: 'Pre-surgery preparation requirement.'
      });
      console.log('Seeded initial blood request.');
    }

    // 8. Seed 30 Verified Pune Hospitals
    const hospitalCount = await Hospital.countDocuments();
    if (hospitalCount < 30) {
      await Hospital.deleteMany({});
      await Hospital.insertMany(hospitalsData);
      console.log(`Seeded ${hospitalsData.length} verified hospitals across Pune & PCMC.`);
    }

    // 9. Seed Verified Pune Blood Banks
    const bloodBankCount = await BloodBank.countDocuments();
    if (bloodBankCount < 8) {
      await BloodBank.deleteMany({});
      await BloodBank.insertMany(bloodBanksData);
      console.log(`Seeded ${bloodBanksData.length} verified blood banks across Pune.`);
    }

    // 10. Seed Verified Pune Eye Care Centres
    const eyeCount = await EyeCareCentre.countDocuments();
    if (eyeCount < 7) {
      await EyeCareCentre.deleteMany({});
      await EyeCareCentre.insertMany(eyeCareCentresData);
      console.log(`Seeded ${eyeCareCentresData.length} verified eye care institutions across Pune.`);
    }

    // 11. Seed Doctors
    const Doctor = require('./models/Doctor');
    const doctorsData = require('./data/doctorsData');
    const doctorCount = await Doctor.countDocuments();
    if (doctorCount < 12) {
      await Doctor.deleteMany({});
      await Doctor.insertMany(doctorsData);
      console.log(`Seeded ${doctorsData.length} verified Pune specialist doctors.`);
    }

    // 12. Seed Demo Doctor User
    const doctorPassword = await bcrypt.hash('doctor123', salt);
    let doctorUser = await User.findOne({ email: 'doctor@cliniccare.com' });
    if (!doctorUser) {
      doctorUser = await User.create({
        name: 'Dr. Ananya Kulkarni, MD',
        email: 'doctor@cliniccare.com',
        password: doctorPassword,
        role: 'doctor',
        phone: '020-40151000'
      });
      console.log('Created Demo Doctor: doctor@cliniccare.com / doctor123');
    }

    // 13. Seed Conditions (100+)
    const Condition = require('./models/Condition');
    const conditionsData = require('./data/conditionsData');
    const conditionCount = await Condition.countDocuments();
    if (conditionCount < 100) {
      await Condition.deleteMany({});
      await Condition.insertMany(conditionsData);
      console.log(`Seeded ${conditionsData.length} verified health conditions across 16 categories.`);
    }

    // 14. Seed Medicines (100+)
    const Medicine = require('./models/Medicine');
    const medicinesData = require('./data/medicinesData');
    const medicineCount = await Medicine.countDocuments();
    if (medicineCount < 100) {
      await Medicine.deleteMany({});
      await Medicine.insertMany(medicinesData);
      console.log(`Seeded ${medicinesData.length} verified medicines database.`);
    }

    // 15. Seed Initial Consultations for Doctor Review
    const Consultation = require('./models/Consultation');
    const consultationCount = await Consultation.countDocuments();
    if (consultationCount === 0) {
      await Consultation.create([
        {
          patient: patient?._id,
          patientName: 'Rahul Verma',
          patientAge: 34,
          patientSex: 'Male',
          symptomsDescription: 'Persistent fever (101.5°F), body aches, dry cough, and mild throat irritation for 2 days.',
          duration: '2 days',
          severity: 'Moderate',
          temperature: '101.5°F',
          existingConditions: 'None',
          allergies: 'No known allergies',
          currentMedicines: 'Occasional paracetamol 500mg',
          riskFactors: 'Recent local travel in Pune',
          aiAssessment: {
            symptomsUnderstood: ['Fever 101.5°F', 'Dry cough', 'Myalgia (body aches)', 'Pharyngeal irritation'],
            possibleCauses: ['Acute Viral Respiratory Infection', 'Influenza', 'Early Dengue prodrome'],
            recommendedSpecialty: 'General Medicine',
            urgencyLevel: 'Needs medical consultation',
            recommendedNextStep: 'Schedule a general physician evaluation, stay well-hydrated, and test CBC if fever continues > 3 days.',
            emergencyAlert: false,
            disclaimer: 'AI Clinical Assessment is for informational triaging only and does not constitute a definitive medical diagnosis.'
          },
          status: 'Under Doctor Review',
          doctorDecision: {
            decision: 'Pending',
            doctorNotes: '',
            clinicalImpression: '',
            actionPlan: ''
          }
        },
        {
          patient: patient?._id,
          patientName: 'Priyanka Joshi',
          patientAge: 29,
          patientSex: 'Female',
          symptomsDescription: 'Bilateral eye redness, gritty feeling, morning crusting and watering for 24 hours. No vision loss.',
          duration: '1 day',
          severity: 'Mild',
          temperature: 'Normal',
          existingConditions: 'Mild Myopia (-1.5 D)',
          allergies: 'None',
          currentMedicines: 'None',
          riskFactors: 'Contact lens wearer',
          aiAssessment: {
            symptomsUnderstood: ['Conjunctival injection (redness)', 'Foreign body sensation', 'Mucopurulent discharge', 'Preserved visual acuity'],
            possibleCauses: ['Acute Infective Conjunctivitis', 'Contact Lens-Associated Keratoconjunctivitis', 'Allergic Conjunctivitis'],
            recommendedSpecialty: 'Ophthalmology',
            urgencyLevel: 'Needs medical consultation',
            recommendedNextStep: 'Discontinue contact lens use immediately. Consult an ophthalmologist for slit-lamp evaluation to rule out corneal ulceration.',
            emergencyAlert: false,
            disclaimer: 'AI Clinical Assessment is for informational triaging only and does not constitute a definitive medical diagnosis.'
          },
          status: 'Under Doctor Review',
          doctorDecision: {
            decision: 'Pending',
            doctorNotes: '',
            clinicalImpression: '',
            actionPlan: ''
          }
        }
      ]);
      console.log('Seeded initial patient consultations for doctor review.');
    }

    console.log('Database seeding process completed.');
  } catch (err) {
    console.error('Seed error:', err);
  }
};

module.exports = seedData;
