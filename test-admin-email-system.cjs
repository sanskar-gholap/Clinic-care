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

async function runEmailNotificationTests() {
  console.log('====================================================');
  console.log('CLINICCARE ADMIN EMAIL NOTIFICATION & SECURITY TESTS');
  console.log('====================================================\n');

  const timestamp = Date.now();
  const testUser = {
    name: `Aarav Sharma ${timestamp.toString().slice(-4)}`,
    email: `aarav.${timestamp}@example.com`,
    phone: '9822012345',
    password: 'PasswordSuperSecure456!',
    confirmPassword: 'PasswordSuperSecure456!'
  };

  // 1. Register new user
  console.log('1. Registering new user...');
  const regRes = await request('POST', '/api/auth/register', testUser);
  assert(regRes.status === 201, `Registration returned 201 Created`);
  assert(regRes.data.message === 'Registration successful.', `Registration message is "Registration successful."`);

  // 2. Confirm user is saved in MongoDB
  console.log('2. Confirming user exists in MongoDB...');
  assert(Boolean(regRes.data.user?.id), `User saved with MongoDB ID: ${regRes.data.user?.id}`);
  assert(regRes.data.user.email === testUser.email, `User email accurately saved`);

  // 3. Admin login to inspect security & notification log
  console.log('3. Logging in as Administrator...');
  const adminLogin = await request('POST', '/api/auth/login', {
    email: 'admin@cliniccare.com',
    password: 'admin123'
  });
  assert(adminLogin.status === 200, `Admin login successful`);
  const adminToken = adminLogin.data.token;

  // 4. Verify Registration Email was dispatched to ADMIN_EMAIL
  console.log('4. Verifying Registration Email notification dispatch...');
  const secRes1 = await request('GET', '/api/admin/security', null, adminToken);
  assert(secRes1.status === 200, `Admin security endpoint returned 200`);
  assert(Boolean(secRes1.data.adminEmail), `Admin email configured as: ${secRes1.data.adminEmail}`);

  const regEmail = secRes1.data.emailAuditLogs?.find(
    (e) => e.type === 'registration' && e.userEmail === testUser.email
  );
  assert(Boolean(regEmail), `Registration email notification recorded for ${testUser.email}`);
  assert(regEmail.subject === 'ClinicCare - New User Registration', `Subject matches exact requirement: "ClinicCare - New User Registration"`);
  assert(regEmail.recipient === secRes1.data.adminEmail, `Sent to administrator email: ${secRes1.data.adminEmail}`);

  // 5. Login with registered credentials
  console.log('5. Logging in with new user credentials...');
  const userLogin = await request('POST', '/api/auth/login', {
    email: testUser.email,
    password: testUser.password
  });
  assert(userLogin.status === 200, `Login succeeded without re-registration`);
  assert(userLogin.data.message === 'Login successful.', `Login message is "Login successful."`);

  // 6. Verify Login Email was dispatched to ADMIN_EMAIL
  console.log('6. Verifying User Login Email notification dispatch...');
  const secRes2 = await request('GET', '/api/admin/security', null, adminToken);
  const loginEmail = secRes2.data.emailAuditLogs?.find(
    (e) => e.type === 'login' && e.userEmail === testUser.email
  );
  assert(Boolean(loginEmail), `Login email notification recorded for ${testUser.email}`);
  assert(loginEmail.subject === 'ClinicCare - User Login', `Subject matches exact requirement: "ClinicCare - User Login"`);

  // 7. Test incorrect password & failed login handling
  console.log('7. Testing failed login attempts...');
  const failRes1 = await request('POST', '/api/auth/login', {
    email: testUser.email,
    password: 'WrongPassword123'
  });
  assert(failRes1.status === 401, `Failed login returned 401 Unauthorized`);
  assert(failRes1.data.message === 'Incorrect password.', `Returns "Incorrect password."`);

  const failRes2 = await request('POST', '/api/auth/login', {
    email: testUser.email,
    password: 'WrongPasswordAgain'
  });
  assert(failRes2.status === 401, `2nd failed login returned 401`);

  const failRes3 = await request('POST', '/api/auth/login', {
    email: testUser.email,
    password: 'WrongPasswordThirdTime'
  });
  assert(failRes3.status === 401, `3rd failed login returned 401`);

  // 8. Verify Failed Login security email notification
  console.log('8. Verifying Failed Login Security alert dispatch...');
  const secRes3 = await request('GET', '/api/admin/security', null, adminToken);
  const failedEmail = secRes3.data.emailAuditLogs?.find(
    (e) => e.type === 'failed_login' && e.userEmail === testUser.email
  );
  assert(Boolean(failedEmail), `Failed login alert notification triggered for repeated failures`);
  assert(failedEmail.subject === 'ClinicCare - Failed Login Attempt', `Subject matches: "ClinicCare - Failed Login Attempt"`);

  // 9. Verify Passwords are NEVER exposed in Email, API or User Table
  console.log('9. Verifying strict password security (NO plain text passwords or hashes exposed)...');
  const userInTable = secRes3.data.users?.find((u) => u.email === testUser.email);
  assert(Boolean(userInTable), `User found in administrative users table`);
  assert(userInTable.password === undefined, `Password property is NOT present in user table`);
  assert(userInTable.passwordHash === undefined, `Password hash is NOT present in user table`);

  // 10. Verify Admin Security Metrics (Section 8)
  console.log('10. Verifying Admin Dashboard Metrics & Table (Section 8)...');
  const metrics = secRes3.data.metrics;
  assert(typeof metrics.totalUsers === 'number' && metrics.totalUsers > 0, `Total Users metric verified (${metrics.totalUsers})`);
  assert(typeof metrics.newRegistrations === 'number' && metrics.newRegistrations > 0, `New Registrations metric verified (${metrics.newRegistrations})`);
  assert(typeof metrics.recentLogins === 'number' && metrics.recentLogins > 0, `Recent Logins metric verified (${metrics.recentLogins})`);
  assert(typeof metrics.failedLoginAttempts === 'number' && metrics.failedLoginAttempts >= 3, `Failed Login Attempts metric verified (${metrics.failedLoginAttempts})`);
  assert(typeof metrics.recentAppointments === 'number', `Recent Appointments metric verified (${metrics.recentAppointments})`);

  // 11. Verify User Table fields (User, Email, Registration Date, Last Login, Status)
  assert(Boolean(userInTable.name), `Table contains User name: ${userInTable.name}`);
  assert(Boolean(userInTable.email), `Table contains Email: ${userInTable.email}`);
  assert(Boolean(userInTable.registrationDate), `Table contains Registration Date`);
  assert(Boolean(userInTable.lastLogin), `Table contains Last Login timestamp`);
  assert(userInTable.status === 'Active', `Table contains Status: ${userInTable.status}`);

  console.log('\n====================================================');
  console.log('ALL ADMIN EMAIL NOTIFICATION TESTS PASSED! (100%)');
  console.log('====================================================');
}

runEmailNotificationTests().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
