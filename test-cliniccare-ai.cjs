const http = require('http');

async function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:5000${path}`);
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(url, reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('CLINICCARE AI DOCTOR & CLINICAL SUPERVISION TESTS');
  console.log('====================================================\n');
  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
    }
  }

  // 1. Health Conditions Database (105+ across 16 categories)
  const condRes = await request('/api/ai/conditions?limit=200');
  assert(condRes.status === 200, 'GET /api/ai/conditions returns 200');
  assert(condRes.data.total >= 100, `Health Conditions database count >= 100 (actual: ${condRes.data.total})`);
  assert(condRes.data.categories.length >= 16, `Condition categories >= 16 (actual: ${condRes.data.categories.length})`);

  // 2. Medicine Information Database (105+ medicines)
  const medRes = await request('/api/medicines?limit=200');
  assert(medRes.status === 200, 'GET /api/medicines returns 200');
  assert(medRes.data.total >= 100, `Medicine database count >= 100 (actual: ${medRes.data.total})`);
  const sampleMed = medRes.data.medicines[0];
  assert(sampleMed.genericName && sampleMed.contraindications && sampleMed.commonMedicalUses, 'Medicine record contains genericName, contraindications, and uses');

  // 3. Doctor Finder & Available Specialists
  const docRes = await request('/api/doctors');
  assert(docRes.status === 200, 'GET /api/doctors returns 200');
  assert(docRes.data.doctors.length >= 10, `Pune verified specialists count >= 10 (actual: ${docRes.data.doctors.length})`);

  const eyeDocRes = await request('/api/doctors/available?specialty=Ophthalmology');
  assert(eyeDocRes.status === 200, 'GET /api/doctors/available?specialty=Ophthalmology returns 200');
  assert(eyeDocRes.data.doctors.length > 0, `Found available ophthalmologists (count: ${eyeDocRes.data.doctors.length})`);

  // 4. Symptom Assessment (Normal Triage)
  const triageRes = await request('/api/ai/symptom-assessment', {
    method: 'POST',
    body: {
      patientName: 'Kunal Deshmukh',
      age: 34,
      sex: 'Male',
      symptoms: 'Fever, headache and mild throat irritation for two days',
      duration: '2 days',
      severity: 'Moderate',
      temperature: '100.4°F',
      existingConditions: 'None',
      allergies: 'NKDA',
      currentMedicines: 'None'
    }
  });
  assert(triageRes.status === 201, 'POST /api/ai/symptom-assessment returns 201 Created');
  assert(triageRes.data.aiAssessment?.urgencyLevel !== undefined, `AI Assessment includes urgency level: "${triageRes.data.aiAssessment?.urgencyLevel}"`);
  assert(triageRes.data.aiAssessment?.recommendedSpecialty !== undefined, `AI Assessment recommended specialty: "${triageRes.data.aiAssessment?.recommendedSpecialty}"`);
  const consultationId = triageRes.data.consultation?._id;

  // 5. Emergency Warning Detection
  const emergencyRes = await request('/api/ai/symptom-assessment', {
    method: 'POST',
    body: {
      patientName: 'Emergency Patient',
      age: 58,
      sex: 'Male',
      symptoms: 'Severe crushing chest pain radiating to left arm with severe breathing difficulty and cold sweating',
      duration: '30 minutes',
      severity: 'Severe'
    }
  });
  assert(emergencyRes.data.aiAssessment?.isEmergency === true, 'Emergency flags detected in severe chest pain & breathing difficulty');
  assert(emergencyRes.data.aiAssessment?.urgencyLevel === '🔴 Emergency', `Urgency level correctly graded as 🔴 Emergency (actual: "${emergencyRes.data.aiAssessment?.urgencyLevel}")`);

  // 6. AI Conversational Chatbot & Pune Directory Integration
  const chatEyeRes = await request('/api/ai/chat', {
    method: 'POST',
    body: {
      message: 'Find an eye doctor near me'
    }
  });
  assert(chatEyeRes.status === 200, 'POST /api/ai/chat handles eye doctor search');
  assert(chatEyeRes.data.message?.content?.toLowerCase().includes('ophthalmolog') || chatEyeRes.data.message?.content?.toLowerCase().includes('eye'), 'AI Chat suggests eye specialists/ophthalmology');

  const chatEmergencyRes = await request('/api/ai/chat', {
    method: 'POST',
    body: {
      message: 'My father has severe breathing difficulty and chest pain'
    }
  });
  assert(chatEmergencyRes.data.message?.isEmergency === true, 'AI Chat detects medical emergency and halts normal routine chat');

  // 7. Doctor Review Flow (Doctor Login -> Review -> Digital Prescription)
  const doctorLogin = await request('/api/auth/login', {
    method: 'POST',
    body: {
      email: 'doctor@cliniccare.com',
      password: 'doctor123'
    }
  });
  assert(doctorLogin.status === 200 && doctorLogin.data.token, 'Doctor login successful (doctor@cliniccare.com)');
  const doctorToken = doctorLogin.data.token;

  if (consultationId) {
    // Review consultation
    const reviewRes = await request('/api/doctor/review', {
      method: 'POST',
      headers: { Authorization: `Bearer ${doctorToken}` },
      body: {
        consultationId,
        decision: 'Approve',
        doctorNotes: 'Reviewed AI assessment. Presentation matches acute viral pharyngitis with mild pyrexia.',
        clinicalImpression: 'Acute Viral Pharyngitis'
      }
    });
    assert(reviewRes.status === 200, 'Doctor successfully approved consultation triage');

    // Issue signed prescription
    const rxRes = await request('/api/doctor/prescription', {
      method: 'POST',
      headers: { Authorization: `Bearer ${doctorToken}` },
      body: {
        consultationId,
        clinicalImpression: 'Acute Viral Upper Respiratory Infection',
        medications: [
          {
            name: 'Paracetamol (Dolo 650)',
            dosage: '650 mg',
            frequency: 'Thrice daily after food (TDS)',
            duration: '3 days',
            instructions: 'Take for fever or pain, max 3 doses/day'
          },
          {
            name: 'Cetirizine (Cetzine)',
            dosage: '10 mg',
            frequency: 'Once at bedtime (OD)',
            duration: '5 days',
            instructions: 'May cause drowsiness'
          }
        ],
        dietaryLifestyleAdvice: 'Warm saline gargles thrice daily. Drink plenty of warm fluids and rest.',
        followUp: 'Review if fever persists beyond 3 days'
      }
    });
    assert(rxRes.status === 201, 'Doctor successfully formulated and signed official prescription');
    assert(rxRes.data.prescription?.medications?.length === 2, 'Prescription contains 2 itemized medications');
  }

  // 8. Admin Verification & Management
  const adminLogin = await request('/api/auth/login', {
    method: 'POST',
    body: {
      email: 'admin@cliniccare.com',
      password: 'admin123'
    }
  });
  assert(adminLogin.status === 200, 'Admin login successful');
  const adminToken = adminLogin.data.token;

  // Toggle Doctor Verification
  if (docRes.data.doctors?.[0]) {
    const docId = docRes.data.doctors[0]._id;
    const verifyDocRes = await request(`/api/doctors/${docId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { isVerified: true }
    });
    assert(verifyDocRes.status === 200 && verifyDocRes.data.doctor?.isVerified === true, 'Admin successfully verified doctor profile');
  }

  console.log(`\nResults: ${passed} / ${total} tests passed.`);
  process.exit(passed === total ? 0 : 1);
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
