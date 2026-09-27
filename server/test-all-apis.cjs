const BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE BACKEND API TEST ---');
  let passed = 0;
  let failed = 0;

  const assert = (condition, title) => {
    if (condition) {
      console.log(`[PASS] ${title}`);
      passed++;
    } else {
      console.error(`[FAIL] ${title}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const health = await fetch(`${BASE}/health`).then(r => r.json());
    assert(health.status === 'ok', '1. Health check API returns ok');

    // 2. Register a new patient
    const testEmail = `patient_${Date.now()}@testclinic.com`;
    const regRes = await fetch(`${BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alex Rivera',
        email: testEmail,
        password: 'password123',
        phone: '+1 (555) 321-7654'
      })
    });
    const regData = await regRes.json();
    assert(regData.success === true && !!regData.token, '2. Registration endpoint registers user and returns JWT');
    const patientToken = regData.token;

    // 3. Login with newly created user
    const loginRes = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    assert(loginData.success === true && loginData.user.email === testEmail, '3. Login endpoint verifies bcrypt password and authenticates');

    // 4. Login as Admin
    const adminLoginRes = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@cliniccare.com',
        password: 'admin123'
      })
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginData.success === true && adminLoginData.user.role === 'admin', '4. Admin login authenticated with role admin');
    const adminToken = adminLoginData.token;

    // 5. Auth Me endpoint
    const meRes = await fetch(`${BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    const meData = await meRes.json();
    assert(meData.success === true && meData.user.name === 'Alex Rivera', '5. JWT Authentication /api/auth/me returns patient identity');

    // 6. Patient Profile GET & PUT
    const profGetRes = await fetch(`${BASE}/profile`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    const profGetData = await profGetRes.json();
    assert(profGetData.success === true && !!profGetData.profile, '6. GET /api/profile returns patient profile');

    const profPutRes = await fetch(`${BASE}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientToken}`
      },
      body: JSON.stringify({
        firstName: 'Alexander',
        lastName: 'Rivera',
        bloodGroup: 'B+',
        address: '100 Medical Plaza, Apt 4B',
        phone: '+1 (555) 999-8888',
        emergencyContact: 'Maria Rivera (Sister) - 555-0100',
        vitals: {
          bloodPressure: '118/78',
          weight: '72',
          height: '180',
          healthScore: 95
        }
      })
    });
    const profPutData = await profPutRes.json();
    assert(profPutData.success === true && profPutData.profile.bloodGroup === 'B+' && profPutData.profile.vitals.healthScore === 95, '7. PUT /api/profile updates patient profile and vitals');

    // 7. Appointments: Book an appointment
    const bookRes = await fetch(`${BASE}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientToken}`
      },
      body: JSON.stringify({
        specialty: 'Cardiology',
        doctorName: 'Dr. Eleanor Sterling',
        date: '2026-10-18',
        time: '11:30 AM',
        reason: 'Follow-up consultation on blood pressure readings.'
      })
    });
    const bookData = await bookRes.json();
    assert(bookData.success === true && bookData.appointment.status === 'Pending', '8. POST /api/appointments creates appointment with Pending status');
    const appointmentId = bookData.appointment._id;

    // 8. Appointments: List appointments
    const listApptRes = await fetch(`${BASE}/appointments`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    const listApptData = await listApptRes.json();
    assert(listApptData.success === true && listApptData.appointments.length >= 1, '9. GET /api/appointments lists patient appointments');

    // 9. Appointment Status: Admin confirms appointment
    const confirmRes = await fetch(`${BASE}/appointments/${appointmentId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'Confirmed' })
    });
    const confirmData = await confirmRes.json();
    assert(confirmData.success === true && confirmData.appointment.status === 'Confirmed', '10. PATCH /api/appointments/:id/status updates appointment status to Confirmed');

    // 10. Ambulance Request
    const ambRes = await fetch(`${BASE}/ambulance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientToken}`
      },
      body: JSON.stringify({
        patientName: 'Alexander Rivera',
        phone: '+1 (555) 999-8888',
        pickupLocation: '100 Medical Plaza, Apt 4B',
        emergencyType: 'Acute Breathing Difficulty'
      })
    });
    const ambData = await ambRes.json();
    assert(ambData.success === true && ambData.ambulance.status === 'Dispatching', '11. POST /api/ambulance creates emergency ambulance dispatch');
    const ambulanceId = ambData.ambulance._id;

    // 11. Ambulance Status update by Admin
    const ambStatusRes = await fetch(`${BASE}/ambulance/${ambulanceId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'En Route', eta: '5 mins' })
    });
    const ambStatusData = await ambStatusRes.json();
    assert(ambStatusData.success === true && ambStatusData.ambulance.status === 'En Route', '12. PATCH /api/ambulance/:id/status updates ambulance status to En Route');

    // 12. Blood Search
    const bloodSearchRes = await fetch(`${BASE}/blood/search?bloodGroup=O+&location=Metropolis`);
    const bloodSearchData = await bloodSearchRes.json();
    assert(bloodSearchData.success === true && bloodSearchData.results.length > 0, '13. GET /api/blood/search returns matching blood stock across facilities');

    // 13. Blood Requisition Request
    const bloodReqRes = await fetch(`${BASE}/blood/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientToken}`
      },
      body: JSON.stringify({
        patientName: 'Alexander Rivera',
        bloodGroup: 'B+',
        units: 2,
        hospital: 'City General Hospital',
        contactPhone: '+1 (555) 999-8888',
        urgency: 'Immediate (Critical)'
      })
    });
    const bloodReqData = await bloodReqRes.json();
    assert(bloodReqData.success === true && bloodReqData.bloodRequest.status === 'Pending', '14. POST /api/blood/request creates blood requisition request');
    const bloodRequestId = bloodReqData.bloodRequest._id;

    // 14. Blood Request Status update by Admin
    const bloodStatusRes = await fetch(`${BASE}/blood/requests/${bloodRequestId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'Approved' })
    });
    const bloodStatusData = await bloodStatusRes.json();
    assert(bloodStatusData.success === true && bloodStatusData.bloodRequest.status === 'Approved', '15. PATCH /api/blood/requests/:id/status updates blood request to Approved');

    // 15. Healthcare Facilities List & Filter
    const facRes = await fetch(`${BASE}/facilities`);
    const facData = await facRes.json();
    assert(facData.success === true && facData.facilities.length >= 6, '16. GET /api/facilities returns full catalog of healthcare facilities');

    // 16. Admin Dashboard Stats
    const adminStatsRes = await fetch(`${BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminStatsData = await adminStatsRes.json();
    assert(
      adminStatsData.success === true &&
      adminStatsData.stats.totalPatients >= 2 &&
      adminStatsData.stats.totalAppointments >= 2,
      '17. GET /api/admin/stats returns real live metrics and recent appointments'
    );

    console.log(`\n===================================`);
    console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`===================================`);

    if (failed === 0) {
      console.log('ALL API ENDPOINTS TESTED AND VERIFIED SUCCESSFULLY!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
