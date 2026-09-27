const Appointment = require('../models/Appointment');
const Facility = require('../models/Facility');
const PatientProfile = require('../models/PatientProfile');
const Hospital = require('../models/Hospital');
const BloodBank = require('../models/BloodBank');
const EyeCareCentre = require('../models/EyeCareCentre');

const SAFETY_DISCLAIMER = `\n\n*Disclaimer: I am an AI healthcare assistant providing informational guidance. I do not diagnose medical conditions or prescribe medications. In case of an emergency, please dial 911 or visit our [Emergency Dispatch](/ambulance).*`;

const EMERGENCY_NOTICE = `🚨 **If you or someone with you is experiencing a life-threatening medical emergency (such as severe chest pain, acute breathing difficulty, stroke symptoms, or severe trauma), please call 911 immediately or use our [Emergency Ambulance Dispatch](/ambulance).**`;

/**
 * Handle user message with clinical safety rules, database lookups, and conversational intent
 */
async function processChatMessage({ messages, user }) {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new Error('Messages array is required');
  }

  const latestMessage = messages[messages.length - 1];
  const query = (latestMessage.content || '').trim().toLowerCase();

  // 1. Gather context if user is logged in
  let userAppointments = [];
  let userProfile = null;

  if (user) {
    try {
      userAppointments = await Appointment.find({ patient: user._id }).sort({ date: 1 });
      userProfile = await PatientProfile.findOne({ user: user._id });
    } catch (e) {
      console.warn('Could not fetch user context for AI:', e.message);
    }
  }

  // 2. Fetch live data for grounding
  let hospitals = [];
  let bloodBanks = [];
  let eyeCareCentres = [];
  try {
    hospitals = await Hospital.find({}).limit(30);
    bloodBanks = await BloodBank.find({}).limit(10);
    eyeCareCentres = await EyeCareCentre.find({}).limit(10);
  } catch (e) {
    console.warn('Could not fetch directory context for AI:', e.message);
  }

  // 3. Clinical Knowledge & Intent Engine
  const response = generateClinicalResponse({
    query,
    user,
    userAppointments,
    userProfile,
    hospitals,
    bloodBanks,
    eyeCareCentres,
    messages
  });

  return response;
}

/**
 * Robust healthcare knowledge engine with safety checks and database integration
 */
function generateClinicalResponse({ query, user, userAppointments, userProfile, hospitals, bloodBanks, eyeCareCentres, messages }) {
  // Emergency check
  const emergencyKeywords = ['heart attack', 'stroke', 'bleeding heavily', 'choking', 'unconscious', 'dying', 'cannot breathe', 'cant breathe'];
  const isEmergency = emergencyKeywords.some(k => query.includes(k));

  if (isEmergency) {
    return {
      content: `${EMERGENCY_NOTICE}\n\nOur telemetry ambulance units in Pune and PCMC are active 24/7. You can request immediate paramedic dispatch right away by clicking **[Call Ambulance Now](/ambulance)** or contacting our direct emergency line at **1-800-555-0199**.`,
      suggestedActions: [
        { label: '🚑 Call Ambulance', path: '/ambulance' },
        { label: '🚨 Emergency Overview', path: '/emergency' }
      ]
    };
  }

  // Cancel appointment
  if (query.includes('cancel')) {
    return {
      content: `To cancel or reschedule an appointment:\n\n1. Visit your **[Appointments](/appointments)** page.\n2. Locate the appointment you wish to cancel.\n3. Click the **Cancel Appointment** link under the appointment card.\n\nPatients can cancel upcoming visits up to 2 hours prior to the scheduled consultation time.`,
      suggestedActions: [
        { label: '📋 View My Appointments', path: '/appointments' },
        { label: '📅 Book New Appointment', path: '/book-appointment' }
      ]
    };
  }

  // Eye Testing & Eye Care queries (Requirement: "Find eye testing near me" / "I need an eye test")
  if (query.includes('eye test') || query.includes('eye care') || query.includes('eye clinic') || query.includes('ophthalmolog') || query.includes('cataract') || query.includes('lasik')) {
    const matchingEyeCentres = eyeCareCentres.slice(0, 4);
    const centreList = matchingEyeCentres.map(c => `• **${c.name}** (${c.area}) — 📞 ${c.phone}\n  *Services: ${c.categories.slice(0, 4).join(', ')}*`).join('\n\n');

    return {
      content: `I can help you find eye-care centres offering eye examinations.\n\nHere are nearby eye-care centres in the ClinicCare directory:\n\n${centreList}\n\nExplore all verified eye hospitals, check opening hours, or get directions on our **[Pune Eye Care Directory](/eye-care)**.`,
      suggestedActions: [
        { label: '👁️ Open Eye Care Directory', path: '/eye-care' },
        { label: '📅 Book Doctor Visit', path: '/book-appointment' }
      ]
    };
  }

  // Area-specific hospital query (e.g. "Find hospitals in Kothrud", "Hospitals in Baner", etc.)
  const puneAreas = ['kothrud', 'baner', 'shivajinagar', 'hadapsar', 'kharadi', 'aundh', 'pimpri', 'chinchwad', 'deccan', 'nigdi', 'hinjewadi', 'warje', 'katraj', 'wanowrie', 'koregaon park', 'sadashiv peth', 'rasta peth'];
  const matchedArea = puneAreas.find(a => query.includes(a));

  if (matchedArea) {
    const areaNameFormatted = matchedArea.charAt(0).toUpperCase() + matchedArea.slice(1);
    const areaHospitals = hospitals.filter(h => h.area.toLowerCase().includes(matchedArea) || h.address.toLowerCase().includes(matchedArea));

    if (areaHospitals.length > 0) {
      const list = areaHospitals.slice(0, 4).map(h => {
        return `• **${h.name}** (${h.type})\n  📍 ${h.address}\n  📞 ${h.phone} | 🚨 Emergency: ${h.emergencyAvailable ? 'Available 24/7' : 'Contact Hospital'}`;
      }).join('\n\n');

      return {
        content: `🏥 **Verified Hospitals in ${areaNameFormatted}, Pune**:\n\nHere are hospitals listed in ${areaNameFormatted}:\n\n${list}\n\nView details, specialties, or get Google Maps directions on the **[Pune Hospitals Directory](/hospitals?area=${areaNameFormatted})**.`,
        suggestedActions: [
          { label: `🏥 View ${areaNameFormatted} Hospitals`, path: `/hospitals?area=${areaNameFormatted}` },
          { label: '🚑 Request Ambulance', path: '/ambulance' }
        ]
      };
    }
  }

  // Blood Requirements & Blood Bank Queries (Requirement: "I need blood urgently")
  if (query.includes('blood') || query.includes('donor') || query.includes('platelet') || query.includes('plasma')) {
    const isUrgent = query.includes('urgent') || query.includes('need blood') || query.includes('emergency');
    const introText = isUrgent
      ? `Please select your blood group and location. I can show registered blood banks and hospitals. For an emergency, contact the hospital/blood bank directly.\n\n`
      : `Here are licensed, verified blood centres across Pune:\n\n`;

    const bbList = bloodBanks.slice(0, 4).map(b => `• **${b.name}** (${b.area})\n  📞 ${b.phone} | ⏰ ${b.workingHours}`).join('\n');

    return {
      content: `🩸 **Pune Blood Banks & Component Directory**:\n\n${introText}${bbList}\n\nYou can search live blood groups (A+, B+, O+, AB+, negative groups) and submit requirement requests on our **[Blood Banks & Donation Directory](/blood-banks)**.`,
      suggestedActions: [
        { label: '🩸 Open Blood Banks', path: '/blood-banks' },
        { label: '❤️ I Want to Donate', path: '/blood-banks' }
      ]
    };
  }

  // Personal appointments query
  if (query.includes('my appointment') || query.includes('view my appointment') || query.includes('check appointment') || query.includes('see my appointment') || query.includes('scheduled')) {
    if (!user) {
      return {
        content: `To view your scheduled appointments and medical visit records, please [Sign In](/login) to your ClinicCare patient account. If you are new to ClinicCare, you can [Register here](/register).`,
        suggestedActions: [
          { label: '🔐 Sign In', path: '/login' },
          { label: '📅 Book Appointment', path: '/book-appointment' }
        ]
      };
    }

    if (userAppointments.length === 0) {
      return {
        content: `Hello ${user.name.split(' ')[0]}, you currently do not have any upcoming appointments scheduled.\n\nWould you like to schedule a consultation with one of our Pune specialists?`,
        suggestedActions: [
          { label: '📅 Book Appointment', path: '/book-appointment' },
          { label: '🏥 Explore Hospitals', path: '/hospitals' }
        ]
      };
    }

    const apptList = userAppointments.map((a) => {
      return `• **${a.specialty}** with **${a.doctorName}** on 🗓️ **${a.date}** at ⏰ **${a.time}** (Status: *${a.status}*)`;
    }).join('\n');

    return {
      content: `Here are your scheduled appointments, **${user.name.split(' ')[0]}**:\n\n${apptList}\n\nYou can manage or cancel visits anytime on your [Appointments Page](/appointments).`,
      suggestedActions: [
        { label: '📋 Manage Appointments', path: '/appointments' },
        { label: '📅 Book New Visit', path: '/book-appointment' }
      ]
    };
  }

  // How to book appointment
  if (query.includes('book') || query.includes('schedule') || query.includes('appointment')) {
    return {
      content: `Booking an appointment at ClinicCare is fast and simple:\n\n1. Go to the **[Book Appointment](/book-appointment)** page.\n2. Choose your medical specialty (e.g. Cardiology, Dermatology, Pediatrics, General Practice, Orthopedics).\n3. Pick your preferred date and time.\n4. Enter a brief note on your visit reasons and submit.\n\nYour appointment will be confirmed by clinic coordinators immediately!`,
      suggestedActions: [
        { label: '📅 Book Appointment Now', path: '/book-appointment' },
        { label: '📋 View Appointments', path: '/appointments' }
      ]
    };
  }

  // Ambulance requests
  if (query.includes('ambulance') || query.includes('paramedic')) {
    return {
      content: `🚑 **Emergency Ambulance Dispatch in Pune & PCMC**:\n\nYou can request an emergency ambulance with live telemetry and ETA tracking by visiting **[Ambulance Services](/ambulance)**.\n\n• Average response time in Pune: **8-12 minutes**\n• Paramedic units equipped with full ICU telemetry and oxygen\n• Direct emergency hotline: **911** or **1-800-555-0199**`,
      suggestedActions: [
        { label: '🚑 Request Ambulance', path: '/ambulance' },
        { label: '🚨 Emergency Overview', path: '/emergency' }
      ]
    };
  }

  // Hospitals general query
  if (query.includes('hospital') || query.includes('hospitals') || query.includes('clinic in pune')) {
    return {
      content: `🏥 **Pune & PCMC Hospital Directory**:\n\nClinicCare lists **30+ verified hospitals** across Pune and Pimpri-Chinchwad, including:\n• **Ruby Hall Clinic** (Shivajinagar) — 020-66455100\n• **Deenanath Mangeshkar Hospital** (Kothrud) — 020-40151000\n• **Jupiter Hospital** (Baner) — 020-27992799\n• **Sassoon General Hospital** (Government / Station) — 020-26128000\n• **Aditya Birla Memorial Hospital** (Chinchwad) — 020-30717500\n\nFilter by area, emergency services, or hospital type on our **[Pune Hospital Directory](/hospitals)**.`,
      suggestedActions: [
        { label: '🏥 Explore 30+ Hospitals', path: '/hospitals' },
        { label: '📍 Healthcare Directory', path: '/healthcare-directory' }
      ]
    };
  }

  // Doctors queries
  if (query.includes('doctor') || query.includes('physician') || query.includes('specialist') || query.includes('cardiologist')) {
    return {
      content: `👨‍⚕️ **Featured ClinicCare Specialists in Pune**:\n\n• **Dr. Eleanor Sterling** — Chief Cardiologist & Internal Medicine\n• **Dr. Johnson** — Senior Family Physician & General Practice\n• **Dr. Sarah Chen** — Consultant Dermatologist\n• **Dr. Marcus Patel** — Neurology & Stroke Recovery\n• **Dr. Emily Miller** — Pediatrician & Child Wellness\n\nAll specialists are accepting new patient consultations. You can select your desired department when booking!`,
      suggestedActions: [
        { label: '📅 Book with a Doctor', path: '/book-appointment' },
        { label: '🏥 Explore Facilities', path: '/facilities' }
      ]
    };
  }

  // Timings / Hours
  if (query.includes('timing') || query.includes('hour') || query.includes('time') || query.includes('open') || query.includes('close')) {
    return {
      content: `⏰ **Pune Healthcare Operating Hours**:\n\n• **Emergency Rooms & Trauma Centers**: Open **24 hours / 7 days a week** across major hospitals\n• **Outpatient Consultations**: Monday to Saturday, **8:00 AM – 8:00 PM**\n• **Blood Banks (Emergency Issue)**: **24/7 round the clock**\n• **Eye Hospitals (OPD)**: Monday to Saturday, **8:30 AM – 7:30 PM**`,
      suggestedActions: [
        { label: '🏥 View Hospitals', path: '/hospitals' },
        { label: '📅 Book Visit', path: '/book-appointment' }
      ]
    };
  }

  // Location / Address / Where is clinic
  if (query.includes('where') || query.includes('location') || query.includes('address') || query.includes('map') || query.includes('direction')) {
    return {
      content: `📍 **Pune Healthcare Locations & Coverage**:\n\nClinicCare covers major areas across Pune and Pimpri-Chinchwad:\n• **Central**: Shivajinagar, Sadashiv Peth, Deccan, Rasta Peth, Camp\n• **West**: Kothrud, Baner, Aundh, Warje, Hinjewadi\n• **East**: Kharadi, Hadapsar, Viman Nagar, Koregaon Park\n• **PCMC**: Pimpri, Chinchwad, Nigdi, Thergaon\n\nFind centers by neighborhood on our **[Healthcare Directory](/healthcare-directory)**.`,
      suggestedActions: [
        { label: '📍 Healthcare Directory', path: '/healthcare-directory' },
        { label: '🏥 View Hospitals', path: '/hospitals' }
      ]
    };
  }

  // Contact / Phone
  if (query.includes('contact') || query.includes('phone') || query.includes('email') || query.includes('call') || query.includes('reach')) {
    return {
      content: `📞 **Contact ClinicCare Pune**:\n\n• **General Inquiries & Appointments**: +1 (555) 019-2834\n• **24/7 Emergency Dispatch**: 911 or +1 (800) 555-0199\n• **Support Email**: care@cliniccare.com\n• **Online Assistance**: Fill out our inquiry form on the **[Contact Page](/contact)**.`,
      suggestedActions: [
        { label: '📞 Contact Page', path: '/contact' },
        { label: '📅 Book Appointment', path: '/book-appointment' }
      ]
    };
  }

  // Medical symptoms safety check
  const symptomKeywords = ['fever', 'headache', 'cough', 'cold', 'stomach', 'pain', 'sore throat', 'rash', 'nausea', 'vomit', 'dizzy'];
  const hasSymptom = symptomKeywords.some(s => query.includes(s));

  if (hasSymptom) {
    return {
      content: `I understand you may be feeling unwell. While I can provide general health information, **I cannot provide medical diagnoses, treatment plans, or prescription dosages**.\n\n• Please stay hydrated and get adequate rest.\n• If your symptoms are severe, worsening, or accompanied by high fever or shortness of breath, please consult a physician immediately.\n\nWould you like to book a consultation with our General Practice team or find nearby hospitals?${SAFETY_DISCLAIMER}`,
      suggestedActions: [
        { label: '📅 Book Consultation', path: '/book-appointment' },
        { label: '🏥 Find Nearby Hospitals', path: '/hospitals' },
        { label: '🚑 Emergency Assistance', path: '/emergency' }
      ]
    };
  }

  // Greetings
  if (query.includes('hello') || query.includes('hi') || query.includes('hey') || query === 'help') {
    const greetingName = user ? ` ${user.name.split(' ')[0]}` : '';
    return {
      content: `👋 Hello${greetingName}! I'm ClinicCare AI Assistant.\n\nI can help you explore the **Pune Healthcare Directory**, find 30+ verified hospitals, locate 24/7 blood banks, search eye-care clinics, book appointments, or dispatch an ambulance. How can I assist you today?`,
      suggestedActions: [
        { label: '🏥 Pune Hospitals', path: '/hospitals' },
        { label: '🩸 Blood Banks', path: '/blood-banks' },
        { label: '👁️ Eye Care', path: '/eye-care' },
        { label: '📅 Book Appointment', path: '/book-appointment' }
      ]
    };
  }

  // Fallback
  return {
    content: `I'm here to assist you across the ClinicCare Pune Healthcare Directory! You can ask me:\n\n• *"Find hospitals in Kothrud"* or *"Hospitals in Baner"*\n• *"Find eye testing near me"*\n• *"I need blood urgently"*\n• *"Show my appointments"*\n• *"How can I request an ambulance?"*\n• *"What are the clinic timings?"*${SAFETY_DISCLAIMER}`,
    suggestedActions: [
      { label: '🏥 Hospitals Directory', path: '/hospitals' },
      { label: '🩸 Blood Banks', path: '/blood-banks' },
      { label: '👁️ Eye Care', path: '/eye-care' },
      { label: '📅 Book Appointment', path: '/book-appointment' }
    ]
  };
}

module.exports = { processChatMessage };
