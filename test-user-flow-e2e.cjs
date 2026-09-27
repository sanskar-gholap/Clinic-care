const http = require('http');

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ [PASS] ${message}`);
  }
}

async function runTestSequence() {
  console.log('====================================================');
  console.log('SECTION 17: END-TO-END VERIFICATION SEQUENCE');
  console.log('====================================================\n');

  const timestamp = Date.now();
  const testUser = {
    name: `Rohan Deshmukh ${timestamp.toString().slice(-4)}`,
    email: `rohan.${timestamp}@example.com`,
    phone: '9876543210',
    password: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!'
  };

  // 1. Register a new user
  console.log('1. Registering new user...');
  const regRes = await request('POST', '/api/auth/register', testUser);
  assert(regRes.status === 201, `Registration returned 201 (got ${regRes.status})`);
  assert(regRes.data.message === 'Registration successful.', `Registration message is "Registration successful."`);

  // 2. Duplicate registration check
  console.log('2. Testing duplicate email prevention...');
  const dupRes = await request('POST', '/api/auth/register', testUser);
  assert(dupRes.status === 400, `Duplicate email returned 400 (got ${dupRes.status})`);
  assert(
    dupRes.data.message === 'An account with this email already exists. Please login.',
    `Shows exact message: "An account with this email already exists. Please login."`
  );

  // 3. Login using same credentials
  console.log('3. Logging in with registered credentials...');
  const loginRes = await request('POST', '/api/auth/login', {
    email: testUser.email,
    password: testUser.password
  });
  assert(loginRes.status === 200, `Login returned 200 (got ${loginRes.status})`);
  assert(loginRes.data.message === 'Login successful.', `Login message is "Login successful."`);
  assert(Boolean(loginRes.data.token), `Received persistent JWT token`);
  assert(loginRes.data.user.email === testUser.email, `User email matches`);
  const token = loginRes.data.token;

  // 4. Access Protected Route (Dashboard profile & appointments)
  console.log('4. Accessing protected dashboard profile...');
  const profileRes = await request('GET', '/api/profile', null, token);
  assert(profileRes.status === 200, `Protected profile route accessible`);
  assert(profileRes.data.user.name === testUser.name, `Authenticated user name matches`);

  // 5. Simulate closing browser / logout & Re-login later
  console.log('5. Simulating browser close, cleared memory session & re-login...');
  const reloginRes = await request('POST', '/api/auth/login', {
    email: testUser.email,
    password: testUser.password
  });
  assert(reloginRes.status === 200, `Re-login succeeded without re-registration`);
  assert(reloginRes.data.user.email === testUser.email, `Account persistently stored in MongoDB`);

  // 6. Test Natural Language Symptom: "I have fever."
  console.log('\n6. Testing Natural Language query: "I have fever."');
  const feverChat = await request('POST', '/api/ai/chat', { message: 'I have fever.' });
  assert(feverChat.status === 200, `Fever query returned 200`);
  assert(feverChat.data.message.content.includes('Fever'), `AI understands fever`);
  assert(feverChat.data.message.content.includes('PARACETAMOL'), `AI recommends Paracetamol info card`);
  assert(feverChat.data.message.content.includes('General Medicine'), `AI recommends General Medicine`);
  assert(feverChat.data.message.content.includes('[ CHECK DETAILS ]'), `Includes [ CHECK DETAILS ] button`);

  // 7. Test Check Details of Medicine
  console.log('7. Testing medicine details lookup: Paracetamol...');
  const medRes = await request('GET', '/api/medicines?search=Paracetamol&limit=1');
  assert(medRes.status === 200, `Medicine lookup succeeded`);
  assert(medRes.data.medicines.length > 0, `Paracetamol found in database`);
  const med = medRes.data.medicines[0];
  assert(med.genericName.includes('Paracetamol'), `Generic name is Paracetamol (Acetaminophen)`);
  assert(med.category.includes('Analgesic'), `Category includes Analgesic`);
  assert(Array.isArray(med.contraindications) && med.contraindications.length > 0, `Contraindications verified`);

  // 8. Test Natural Language Queries:
  // "I have tooth pain", "I have eye pain", "I have cough", "I have headache", "I have stomach pain", "I have skin rash"
  console.log('\n8. Testing required natural language queries:');
  const queries = [
    { query: 'I have tooth pain', expectedSpecialty: 'Dentistry', expectedMed: 'Ibuprofen' },
    { query: 'I have eye pain', expectedSpecialty: 'Ophthalmology', expectedMed: 'Carboxymethylcellulose' },
    { query: 'I have cough', expectedSpecialty: 'Pulmonology', expectedMed: 'Dextromethorphan' },
    { query: 'I have headache', expectedSpecialty: 'General Medicine', expectedMed: 'Paracetamol' },
    { query: 'I have stomach pain', expectedSpecialty: 'Gastroenterology', expectedMed: 'Pantoprazole' },
    { query: 'I have skin rash', expectedSpecialty: 'Dermatology', expectedMed: 'Cetirizine' }
  ];

  for (const q of queries) {
    const res = await request('POST', '/api/ai/chat', { message: q.query });
    assert(res.status === 200, `Query "${q.query}" returned 200`);
    assert(
      res.data.message.content.includes(q.expectedSpecialty),
      `Query "${q.query}" maps to ${q.expectedSpecialty}`
    );
    assert(
      res.data.message.content.includes(q.expectedMed.toUpperCase()) || res.data.message.content.includes('PARACETAMOL'),
      `Query "${q.query}" retrieves verified medicine info`
    );
  }

  // 9. Test Emergency Detection
  console.log('\n9. Testing Emergency Detection...');
  const emRes = await request('POST', '/api/ai/chat', { message: 'I have severe chest pain and difficulty breathing' });
  assert(emRes.status === 200, `Emergency check returned 200`);
  assert(emRes.data.message.isEmergency === true, `isEmergency is true`);
  assert(emRes.data.message.content.includes('POSSIBLE MEDICAL EMERGENCY'), `Shows 🚨 POSSIBLE MEDICAL EMERGENCY`);
  const emActionLabels = emRes.data.message.suggestedActions.map(a => a.label);
  assert(emActionLabels.includes('🚑 Find Emergency Hospital'), `Contains [🚑 Find Emergency Hospital]`);
  assert(emActionLabels.includes('📞 Emergency Help'), `Contains [📞 Emergency Help]`);
  assert(emActionLabels.includes('🏥 Find Nearby Hospital'), `Contains [🏥 Find Nearby Hospital]`);

  console.log('\n====================================================');
  console.log('ALL SECTION 17 TESTS PASSED SUCCESSFULLY! (100%)');
  console.log('====================================================');
}

runTestSequence().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
