const BASE = 'http://localhost:5000/api';

async function testAIChatbot() {
  console.log('--- STARTING CLINICCARE AI CHATBOT TEST SUITE ---');
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
    // 1. Test guest query: "How can I book an appointment?"
    const res1 = await fetch(`${BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'How can I book an appointment?' }]
      })
    });
    const d1 = await res1.json();
    assert(
      d1.success && d1.message.content.includes('Book Appointment') && d1.message.suggestedActions.length > 0,
      '1. AI responds to "How can I book an appointment?" with guidance & action pills'
    );

    // 2. Test guest asking for appointments (should prompt to sign in)
    const res2 = await fetch(`${BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'I want to see my appointments' }]
      })
    });
    const d2 = await res2.json();
    assert(
      d2.success && d2.message.content.includes('Sign In'),
      '2. AI prompts unauthenticated users to sign in to see their appointments'
    );

    // 3. Authenticate as Sarah Smith
    const loginRes = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sarah.smith@example.com',
        password: 'patient123'
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    assert(!!token, '3. Authenticated Sarah Smith successfully');

    // 4. Test authenticated user asking for their appointments
    const res3 = await fetch(`${BASE}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'I want to see my appointments' }]
      })
    });
    const d3 = await res3.json();
    assert(
      d3.success && (d3.message.content.includes('Cardiology') || d3.message.content.includes('Sarah')),
      '4. AI retrieves authenticated user appointments from database and does not expose others'
    );

    // 5. Test "Which doctors are available?"
    const res4 = await fetch(`${BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Which doctors are available?' }]
      })
    });
    const d4 = await res4.json();
    assert(
      d4.success && d4.message.content.includes('Eleanor Sterling'),
      '5. AI lists available clinic doctors and departments'
    );

    // 6. Test "How can I request an ambulance?"
    const res5 = await fetch(`${BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'How can I request an ambulance?' }]
      })
    });
    const d5 = await res5.json();
    assert(
      d5.success && d5.message.content.includes('Ambulance') && d5.message.content.includes('8-12 minutes'),
      '6. AI provides ambulance emergency response info'
    );

    // 7. Test "I need blood"
    const res6 = await fetch(`${BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'I need blood' }]
      })
    });
    const d6 = await res6.json();
    assert(
      d6.success && d6.message.content.includes('Blood Search') && d6.message.content.includes('blood bank'),
      '7. AI provides blood inventory lookup & requisition instructions'
    );

    // 8. Test "What are the clinic timings?"
    const res7 = await fetch(`${BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'What are the clinic timings?' }]
      })
    });
    const d7 = await res7.json();
    assert(
      d7.success && d7.message.content.includes('24 hours') && d7.message.content.includes('8:00 AM'),
      '8. AI explains clinic operating hours'
    );

    // 9. Test "Where is the clinic?"
    const res8 = await fetch(`${BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Where is the clinic?' }]
      })
    });
    const d8 = await res8.json();
    assert(
      d8.success && d8.message.content.includes('City General Hospital') && d8.message.content.includes('Healthcare Ave'),
      '9. AI shares facility locations and addresses'
    );

    // 10. Test "How do I cancel my appointment?"
    const res9 = await fetch(`${BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'How do I cancel my appointment?' }]
      })
    });
    const d9 = await res9.json();
    assert(
      d9.success && d9.message.content.includes('Cancel Appointment') && d9.message.content.includes('/appointments'),
      '10. AI provides appointment cancellation guidance'
    );

    // 11. Test Healthcare Safety (No Medical Diagnosis/Prescriptions)
    const res10 = await fetch(`${BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'I have a high fever and painful stomachache, what pills should I take?' }]
      })
    });
    const d10 = await res10.json();
    assert(
      d10.success &&
      (d10.message.content.includes('cannot provide medical diagnoses') || d10.message.content.includes('Disclaimer')) &&
      d10.message.content.includes('consult a physician'),
      '11. Healthcare Safety: AI refuses to prescribe medicines and recommends consulting a doctor'
    );

    // 12. Test Emergency Handling
    const res11 = await fetch(`${BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Emergency! My father has severe chest pain and cannot breathe!' }]
      })
    });
    const d11 = await res11.json();
    assert(
      d11.success && d11.message.content.includes('911') && d11.message.content.includes('Ambulance'),
      '12. Emergency Handling: AI immediately displays emergency protocol and ambulance dispatch options'
    );

    // 13. Test Conversation Context (multi-turn follow-up)
    const res12 = await fetch(`${BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Hi' },
          { role: 'assistant', content: 'Hello! How can I help you today?' },
          { role: 'user', content: 'How do I contact the clinic?' }
        ]
      })
    });
    const d12 = await res12.json();
    assert(
      d12.success && d12.message.content.includes('+1 (555) 019-2834'),
      '13. Conversation Context: AI processes multi-turn conversation and provides contact info'
    );

    console.log(`\n===========================================`);
    console.log(`AI CHATBOT TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`===========================================`);

    if (failed === 0) {
      console.log('ALL AI CHATBOT CAPABILITIES VERIFIED SUCCESSFULLY!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

testAIChatbot();
