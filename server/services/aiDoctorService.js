const Condition = require('../models/Condition');
const Medicine = require('../models/Medicine');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const BloodBank = require('../models/BloodBank');
const EyeCareCentre = require('../models/EyeCareCentre');
const Consultation = require('../models/Consultation');

const EMERGENCY_PATTERNS = [
  'severe chest pain',
  'chest pressure',
  'crushing chest',
  'radiating to left arm',
  'severe breathing difficulty',
  'difficulty breathing',
  'breathing difficulty',
  'shortness of breath',
  'cannot breathe',
  'cant breathe',
  'gasping for air',
  'stridor',
  'blue lips',
  'cyanosis',
  'loss of consciousness',
  'passed out',
  'unconscious',
  'fainted',
  'severe bleeding',
  'bleeding heavily',
  'gushing blood',
  'stroke-like',
  'stroke',
  'slurred speech',
  'facial droop',
  'face drooping',
  'sudden paralysis',
  'arm weakness',
  'seizure',
  'continuous seizure',
  'severe allergic reaction',
  'throat swelling',
  'tongue swelling',
  'anaphylaxis',
  'serious injury',
  'massive blood',
  'head injury unconscious'
];

/**
 * Checks if user message or symptom text indicates a medical emergency
 */
function detectEmergency(text) {
  if (!text || typeof text !== 'string') return false;
  const lower = text.toLowerCase();
  if (EMERGENCY_PATTERNS.some(pattern => lower.includes(pattern))) return true;
  // Keyword combinations
  if (lower.includes('chest') && (lower.includes('pain') || lower.includes('pressure') || lower.includes('crush') || lower.includes('tight'))) return true;
  if (lower.includes('breath') && (lower.includes('severe') || lower.includes('difficult') || lower.includes('short') || lower.includes('stop'))) return true;
  if (lower.includes('bleed') && (lower.includes('severe') || lower.includes('heavy') || lower.includes('lot') || lower.includes('gush'))) return true;
  return false;
}

/**
 * Conducts structured clinical symptom assessment
 */
async function performSymptomAssessment({
  patientName = 'Patient',
  patientId,
  age = 30,
  sex = 'Unspecified',
  symptoms = '',
  duration = '1-3 days',
  severity = 'Moderate',
  temperature = '',
  existingConditions = 'None',
  allergies = 'None',
  currentMedicines = 'None',
  riskFactors = 'None'
}) {
  const isEmergency = detectEmergency(symptoms) || severity === 'Severe' && (symptoms.toLowerCase().includes('chest') || symptoms.toLowerCase().includes('breath'));

  // 1. If Emergency detected: STOP normal consultation and present emergency protocol
  if (isEmergency) {
    const assessment = {
      isEmergency: true,
      emergencyAlert: true,
      symptomsUnderstood: [
        'Acute, potentially life-threatening symptom indicators identified',
        symptoms.slice(0, 100)
      ],
      possibleCauses: [
        'Requires immediate in-person emergency department evaluation'
      ],
      recommendedSpecialty: 'Emergency Medicine / Critical Care',
      urgencyLevel: '🔴 Emergency',
      recommendedNextStep: 'STOP consultation. Call emergency services (108) or proceed immediately to the nearest casualty / trauma hospital.',
      disclaimer: 'CRITICAL ALERT: Your described symptoms indicate a potential medical emergency. AI cannot replace immediate hospital emergency resuscitation.'
    };

    // Store in DB for safety tracking
    const consultation = await Consultation.create({
      patient: patientId || undefined,
      patientName,
      patientAge: Number(age) || 30,
      patientSex: sex,
      symptomsDescription: symptoms,
      duration,
      severity: 'Severe',
      temperature,
      existingConditions,
      allergies,
      currentMedicines,
      riskFactors,
      aiAssessment: assessment,
      status: 'Assessed by AI'
    });

    return {
      success: true,
      isEmergency: true,
      consultationId: consultation._id,
      consultation,
      aiAssessment: assessment,
      assessment,
      hospitalsNearbyUrl: '/hospitals?emergency=true',
      emergencyContacts: {
        ambulance: '108',
        nationalEmergency: '112',
        bloodHelpline: '104'
      }
    };
  }

  // 2. Clinical Specialty Mapping & Symptom Extraction
  const lower = symptoms.toLowerCase();
  let specialty = 'General Medicine';
  let matchedCategory = 'General Medicine';
  let urgencyLevel = 'Needs medical consultation';

  if (lower.includes('eye') || lower.includes('vision') || lower.includes('cataract') || lower.includes('blur') || lower.includes('squint') || lower.includes('cornea')) {
    specialty = 'Ophthalmology';
    matchedCategory = 'Eye';
  } else if (lower.includes('heart') || lower.includes('chest') || lower.includes('palpitation') || lower.includes('bp') || lower.includes('hypertension')) {
    specialty = 'Cardiology';
    matchedCategory = 'Cardiology';
    urgencyLevel = 'Same-day medical attention';
  } else if (lower.includes('ear') || lower.includes('throat') || lower.includes('tonsil') || lower.includes('sinus') || lower.includes('vertigo') || lower.includes('tinnitus')) {
    specialty = 'ENT';
    matchedCategory = 'ENT';
  } else if (lower.includes('knee') || lower.includes('joint') || lower.includes('bone') || lower.includes('spine') || lower.includes('backache') || lower.includes('sprain') || lower.includes('fracture')) {
    specialty = 'Orthopedics';
    matchedCategory = 'Orthopedic';
  } else if (lower.includes('cough') || lower.includes('asthma') || lower.includes('breath') || lower.includes('wheez') || lower.includes('phlegm') || lower.includes('pneumonia')) {
    specialty = 'Pulmonology';
    matchedCategory = 'Respiratory';
    if (lower.includes('shortness of breath')) urgencyLevel = 'Same-day medical attention';
  } else if (lower.includes('stomach') || lower.includes('acidity') || lower.includes('reflux') || lower.includes('vomit') || lower.includes('diarrhea') || lower.includes('liver') || lower.includes('ulcer')) {
    specialty = 'Gastroenterology';
    matchedCategory = 'Digestive';
  } else if (lower.includes('rash') || lower.includes('skin') || lower.includes('itch') || lower.includes('acne') || lower.includes('eczema') || lower.includes('psoriasis') || lower.includes('fungal')) {
    specialty = 'Dermatology';
    matchedCategory = 'Skin';
    urgencyLevel = 'General';
  } else if (lower.includes('period') || lower.includes('menstrual') || lower.includes('pregnancy') || lower.includes('pcos') || lower.includes('ovary') || lower.includes('vaginal')) {
    specialty = "Women's Health";
    matchedCategory = "Women's Health";
  } else if (lower.includes('urine') || lower.includes('prostate') || lower.includes('testic') || lower.includes('burning urination')) {
    specialty = 'Urology';
    matchedCategory = "Men's Health";
  } else if (lower.includes('headache') || lower.includes('migraine') || lower.includes('dizziness') || lower.includes('numbness') || lower.includes('seizure') || lower.includes('tingling')) {
    specialty = 'Neurology';
    matchedCategory = 'Neurology';
  } else if (lower.includes('child') || lower.includes('infant') || lower.includes('baby') || lower.includes('toddler') || Number(age) < 14) {
    specialty = 'Pediatrics';
    matchedCategory = 'Pediatrics';
  } else if (lower.includes('anxiety') || lower.includes('depress') || lower.includes('panic') || lower.includes('sleep') || lower.includes('insomnia') || lower.includes('stress')) {
    specialty = 'Psychiatry';
    matchedCategory = 'Mental Health';
    urgencyLevel = 'General';
  } else if (lower.includes('sugar') || lower.includes('diabetes') || lower.includes('thyroid') || lower.includes('weight loss')) {
    specialty = 'Endocrinology';
    matchedCategory = 'Chronic Conditions';
  } else if (lower.includes('fever') || lower.includes('dengue') || lower.includes('malaria') || lower.includes('typhoid') || lower.includes('chills')) {
    specialty = 'General Medicine';
    matchedCategory = 'Infectious Diseases';
    urgencyLevel = 'Same-day medical attention';
  }

  // Adjust urgency if duration is long or temperature is high
  const tempNum = parseFloat(temperature);
  if (tempNum >= 103) {
    urgencyLevel = 'Same-day medical attention';
  } else if (severity === 'Mild' && duration.includes('day') && urgencyLevel !== 'Same-day medical attention') {
    urgencyLevel = 'General';
  }

  // Find matching conditions from DB
  const matchingConditions = await Condition.find({
    $or: [
      { category: matchedCategory },
      { recommendedSpecialty: { $regex: new RegExp(specialty, 'i') } }
    ]
  }).limit(3);

  const possibleCauses = matchingConditions.length > 0
    ? matchingConditions.map(c => `${c.name} (${c.category})`)
    : ['Acute Symptomatic Presentation', 'General Clinical Evaluation Recommended'];

  // Identify symptoms understood
  const tokens = symptoms.split(/[,.;\n]+/).map(s => s.trim()).filter(s => s.length > 3);
  const symptomsUnderstood = tokens.length > 0 ? tokens.slice(0, 5) : [symptoms.slice(0, 60)];

  // Recommended next step
  const nextSteps = {
    'General': 'Schedule a routine consultation with a healthcare provider. Monitor your symptoms and practice supportive home care.',
    'Needs medical consultation': `Book an evaluation with a specialist in ${specialty}. Avoid self-medicating with unprescribed pharmaceuticals.`,
    'Same-day medical attention': `Visit an outpatient clinic or urgent care facility today for in-person vital signs and diagnostic blood work.`,
    'Emergency': 'Proceed immediately to the emergency room or call 108.'
  };

  const aiAssessment = {
    symptomsUnderstood,
    possibleCauses,
    recommendedSpecialty: specialty,
    urgencyLevel,
    recommendedNextStep: nextSteps[urgencyLevel] || nextSteps['Needs medical consultation'],
    emergencyAlert: false,
    disclaimer: 'AI Clinical Assessment is for informational triaging only and does not constitute a definitive medical diagnosis. A licensed physician must review this assessment.'
  };

  // Find matching Pune specialist doctors
  const matchingDoctors = await Doctor.find({
    specialty: { $regex: new RegExp(specialty, 'i') }
  }).limit(4);

  // Store Consultation in DB for Doctor Review
  const consultation = await Consultation.create({
    patient: patientId || undefined,
    patientName,
    patientAge: Number(age) || 30,
    patientSex: sex,
    symptomsDescription: symptoms,
    duration,
    severity,
    temperature,
    existingConditions,
    allergies,
    currentMedicines,
    riskFactors,
    aiAssessment,
    status: 'Under Doctor Review'
  });

  // Controlled search for relevant medicine records from DB
  let relatedMeds = await Medicine.find({
    $or: [
      { relatedSymptoms: { $in: tokens.map(t => new RegExp(t, 'i')) } },
      { commonUses: { $in: tokens.map(t => new RegExp(t, 'i')) } }
    ]
  }).limit(3);

  if (!relatedMeds || relatedMeds.length === 0) {
    const symLower = symptoms.toLowerCase();
    if (symLower.includes('tooth') || symLower.includes('dental')) {
      relatedMeds = await Medicine.find({ genericName: { $in: ['Ibuprofen', 'Ketorolac', 'Paracetamol'] } }).limit(2);
    } else if (symLower.includes('eye') || symLower.includes('vision')) {
      relatedMeds = await Medicine.find({ genericName: { $in: ['Carboxymethylcellulose', 'Olopatadine'] } }).limit(2);
    } else if (symLower.includes('fever') || symLower.includes('headache') || symLower.includes('body ache')) {
      relatedMeds = await Medicine.find({ genericName: { $in: ['Paracetamol', 'Ibuprofen'] } }).limit(2);
    } else if (symLower.includes('cough') || symLower.includes('cold')) {
      relatedMeds = await Medicine.find({ genericName: { $in: ['Dextromethorphan', 'Guaifenesin', 'Cetirizine'] } }).limit(2);
    } else if (symLower.includes('stomach') || symLower.includes('acid') || symLower.includes('abdomen')) {
      relatedMeds = await Medicine.find({ genericName: { $in: ['Pantoprazole', 'Omeprazole', 'Dicyclomine'] } }).limit(2);
    } else if (symLower.includes('skin') || symLower.includes('rash')) {
      relatedMeds = await Medicine.find({ genericName: { $in: ['Hydrocortisone Topical', 'Calamine Lotion', 'Cetirizine'] } }).limit(2);
    } else {
      relatedMeds = await Medicine.find({ genericName: 'Paracetamol' }).limit(1);
    }
  }

  return {
    success: true,
    isEmergency: false,
    consultationId: consultation._id,
    consultation,
    aiAssessment,
    assessment: aiAssessment,
    matchingDoctors,
    relatedMedicines: relatedMeds,
    relatedConditions: matchingConditions.map(c => ({
      _id: c._id,
      name: c.name,
      category: c.category,
      whenToSeekCare: c.whenToSeekCare,
      patientEducation: c.patientEducation
    }))
  };
}

/**
 * Handles conversational queries in the ChatGPT-style AI Doctor interface
 */
async function processAIDoctorChat({ message, conversationHistory = [], user }) {
  const query = message.trim().toLowerCase();

  // 1. EMERGENCY DETECTION RULE (Section 6)
  if (detectEmergency(query)) {
    return {
      content: `🚨 **POSSIBLE MEDICAL EMERGENCY**\n\n"Your symptoms may require immediate medical attention."\n\n**Immediate Clinical Actions:**\n1. Do **not** wait for an online response or doctor review.\n2. Call emergency ambulance services at **108** or National Emergency at **112**.\n3. Proceed immediately to the nearest emergency trauma hospital in Pune.\n\n*ClinicCare AI does not diagnose emergency conditions or replace emergency medical teams.*`,
      isEmergency: true,
      suggestedActions: [
        { label: '🚑 Find Emergency Hospital', path: '/hospitals?emergency=true' },
        { label: '📞 Emergency Help', path: '/emergency' },
        { label: '🏥 Find Nearby Hospital', path: '/hospitals' }
      ]
    };
  }

  // 2. NATURAL LANGUAGE SYMPTOM ANALYSIS & CLINICAL ASSISTANT (Sections 2, 3, 4, 6, 9, 10)
  const isSymptomQuery = (
    query.includes('have') || query.includes('pain') || query.includes('fever') ||
    query.includes('headache') || query.includes('cough') || query.includes('cold') ||
    query.includes('tooth') || query.includes('teeth') || query.includes('dental') ||
    query.includes('eye') || query.includes('vision') || query.includes('stomach') ||
    query.includes('abdomen') || query.includes('rash') || query.includes('skin') ||
    query.includes('joint') || query.includes('knee') || query.includes('throat') ||
    query.includes('vomit') || query.includes('nausea') || query.includes('diarrhea') ||
    query.includes('dizzy') || query.includes('sprain') || query.includes('ear') ||
    query.includes('allergy') || query.includes('symptom')
  );

  if (isSymptomQuery) {
    let chiefComplaint = 'Your reported symptoms';
    let specialty = 'General Medicine';
    let medKeyword = 'Paracetamol';
    let defaultCauses = ['Viral infection', 'Flu-like illness', 'Other infections'];

    if (query.includes('tooth') || query.includes('teeth') || query.includes('dental')) {
      chiefComplaint = 'Tooth pain';
      specialty = 'Dentistry';
      medKeyword = 'Ibuprofen';
      defaultCauses = ['Dental caries (cavities)', 'Pulpitis or tooth nerve inflammation', 'Gingivitis or periodontal infection'];
    } else if (query.includes('eye') || query.includes('vision')) {
      chiefComplaint = 'Eye pain / irritation';
      specialty = 'Ophthalmology';
      medKeyword = 'Carboxymethylcellulose';
      defaultCauses = ['Conjunctivitis (pink eye)', 'Digital eye strain or dry eye syndrome', 'Corneal irritation or allergic conjunctivitis'];
    } else if (query.includes('stomach') || query.includes('abdomen') || query.includes('acidity')) {
      chiefComplaint = 'Stomach pain';
      specialty = 'Gastroenterology';
      medKeyword = 'Pantoprazole';
      defaultCauses = ['Gastritis or acid peptic disease', 'Gastroenteritis (stomach infection)', 'Irritable bowel syndrome'];
    } else if (query.includes('cough') || query.includes('cold')) {
      chiefComplaint = 'Cough / cold symptoms';
      specialty = 'Pulmonology';
      medKeyword = 'Dextromethorphan';
      defaultCauses = ['Upper respiratory viral infection', 'Allergic bronchitis', 'Seasonal flu'];
    } else if (query.includes('skin') || query.includes('rash') || query.includes('itch')) {
      chiefComplaint = 'Skin problem';
      specialty = 'Dermatology';
      medKeyword = 'Cetirizine';
      defaultCauses = ['Contact dermatitis or allergic rash', 'Eczema flare-up', 'Fungal skin infection'];
    } else if (query.includes('joint') || query.includes('knee') || query.includes('bone') || query.includes('back')) {
      chiefComplaint = 'Joint pain';
      specialty = 'Orthopedics';
      medKeyword = 'Paracetamol';
      defaultCauses = ['Osteoarthritis or joint degeneration', 'Ligament sprain or tendonitis', 'Inflammatory arthropathy'];
    } else if (query.includes('throat') || query.includes('ear') || query.includes('sinus')) {
      chiefComplaint = 'Ear / throat symptoms';
      specialty = 'ENT';
      medKeyword = 'Paracetamol';
      defaultCauses = ['Viral pharyngitis (sore throat)', 'Acute sinusitis', 'Otitis media (middle ear infection)'];
    } else if (query.includes('headache')) {
      chiefComplaint = 'Headache';
      specialty = 'General Medicine';
      medKeyword = 'Paracetamol';
      defaultCauses = ['Tension headache', 'Migraine without aura', 'Dehydration or stress-related headache'];
    } else if (query.includes('fever')) {
      chiefComplaint = 'Fever';
      specialty = 'General Medicine';
      medKeyword = 'Paracetamol';
      defaultCauses = ['Viral infection', 'Flu-like illness', 'Other infections'];
    }

    // Controlled search in Condition database
    const matchingCond = await Condition.findOne({
      $or: [
        { name: { $regex: new RegExp(chiefComplaint.split(' ')[0], 'i') } },
        { category: specialty },
        { recommendedSpecialty: { $regex: new RegExp(specialty, 'i') } }
      ]
    });

    const causesList = matchingCond
      ? [matchingCond.name, ...defaultCauses.slice(0, 2)]
      : defaultCauses;

    // Controlled search in 100+ Medicine database
    let medicine = await Medicine.findOne({
      $or: [
        { genericName: { $regex: new RegExp(medKeyword, 'i') } },
        { brandExamples: { $regex: new RegExp(medKeyword, 'i') } }
      ]
    });

    if (!medicine) {
      medicine = await Medicine.findOne({ genericName: 'Paracetamol' });
    }

    // Retrieve available verified specialists in Pune
    const availableDoctors = await Doctor.find({
      specialty: { $regex: new RegExp(specialty, 'i') }
    }).limit(2);

    const docList = availableDoctors.length > 0
      ? availableDoctors.map(d =>
          `• **${d.name}** (${d.specialty})\n  📍 ${d.clinicOrHospital}, ${d.area}\n  ⏰ Slots: ${d.availableSlots?.slice(0, 2).join(', ') || '10:00 AM, 04:00 PM'}\n  💰 Fee: ₹${d.consultationFee}`
        ).join('\n\n')
      : `• **Dr. Ananya Kulkarni** (General Medicine) — 📍 Kothrud, Pune (₹700)`;

    const content = `${chiefComplaint} can have many causes. I can provide general health information and help you find the appropriate doctor.\n\n` +
      `**Possible causes/topics to discuss with a doctor:**\n` +
      causesList.map(c => `• ${c}`).join('\n') + `\n\n` +
      `**Recommended specialty:**\n${specialty}\n\n` +
      `**Urgency:**\nRoutine / Same-day / Emergency depending on symptoms.\n\n` +
      `**Relevant follow-up questions where necessary:**\n` +
      `• Age\n• Duration\n• Temperature\n• Severity\n• Other symptoms\n• Existing medical conditions\n• Allergies\n• Current medicines\n\n` +
      `*Do NOT treat this as a confirmed medical diagnosis.*\n\n` +
      `─────────────────────────────────────\n` +
      `**Commonly used medicine information**\n\n` +
      `*Consult a qualified doctor before taking medication, especially if you are pregnant, have chronic conditions, take other medicines, or have allergies.*\n\n` +
      `💊 **${medicine?.genericName?.toUpperCase() || 'PARACETAMOL'}**\n` +
      `*${medicine?.category || 'Analgesic / Antipyretic'}*\n\n` +
      `Commonly used for:\n` +
      (medicine?.commonUses?.slice(0, 3).map(u => `• ${u}`).join('\n') || `• Fever\n• Mild to moderate pain`) + `\n\n` +
      `[ CHECK DETAILS ]\n` +
      `─────────────────────────────────────\n\n` +
      `👨‍⚕️ **Available ${specialty} Specialists in Pune:**\n\n${docList}`;

    return {
      content,
      suggestedActions: [
        { label: `📅 Book ${specialty} Doctor`, path: `/book-appointment?specialty=${encodeURIComponent(specialty)}` },
        { label: `💊 Check ${medicine?.genericName || 'Medicine'} Details`, path: `/ai-doctor?tab=medicines&search=${encodeURIComponent(medicine?.genericName || 'Paracetamol')}` },
        { label: '🩺 Full Symptom Assessment', path: '/ai-doctor?tab=symptoms' },
        { label: '👨‍⚕️ Find Doctor', path: '/ai-doctor?tab=doctors' }
      ]
    };
  }

  // 3. APPOINTMENT ASSISTANT (Section 2)
  if (query.includes('appointment') || query.includes('book doctor') || query.includes('see a doctor') || query.includes('schedule')) {
    let specialtyMatch = 'General Medicine';
    if (query.includes('eye') || query.includes('vision') || query.includes('cataract')) specialtyMatch = 'Ophthalmology';
    else if (query.includes('heart') || query.includes('cardio') || query.includes('chest')) specialtyMatch = 'Cardiology';
    else if (query.includes('bone') || query.includes('knee') || query.includes('joint') || query.includes('ortho')) specialtyMatch = 'Orthopedics';
    else if (query.includes('tooth') || query.includes('dental')) specialtyMatch = 'Dentistry';
    else if (query.includes('skin') || query.includes('rash') || query.includes('derma')) specialtyMatch = 'Dermatology';
    else if (query.includes('child') || query.includes('pediatric')) specialtyMatch = 'Pediatrics';
    else if (query.includes('ent') || query.includes('ear') || query.includes('throat')) specialtyMatch = 'ENT';

    const availableDoctors = await Doctor.find({
      specialty: { $regex: new RegExp(specialtyMatch, 'i') }
    }).limit(3);

    const docCards = availableDoctors.map(d =>
      `• **${d.name}** (${d.specialty})\n  📍 ${d.clinicOrHospital}, ${d.area}\n  ⏰ Available Slots: ${d.availableSlots?.slice(0, 3).join(', ')}\n  💰 Fee: ₹${d.consultationFee}`
    ).join('\n\n');

    return {
      content: `📅 **Automated Appointment Assistant**\n\nAn **${specialtyMatch}** consultation may be appropriate based on your request.\n\nHere are available verified specialists in Pune ready for scheduling:\n\n${docCards}\n\nWould you like to confirm a slot with one of these doctors? You can book directly or view the doctor profiles.`,
      suggestedActions: [
        { label: `📅 Book ${specialtyMatch} Visit`, path: `/book-appointment?specialty=${encodeURIComponent(specialtyMatch)}` },
        { label: '👨‍⚕️ View Doctor Directory', path: '/ai-doctor?tab=doctors' },
        { label: '📋 View My Appointments', path: '/appointments' }
      ]
    };
  }

  // 3. MEDICINE INFORMATION (Section 4)
  if (query.includes('medicine') || query.includes('tablet') || query.includes('drug') || query.includes('paracetamol') || query.includes('antibiotic') || query.includes('pantoprazole') || query.includes('dosage')) {
    // Check if user is asking about a specific medicine
    const medQuery = query.replace(/(what is|tell me about|medicine|tablet|drug|side effects of|uses of|dose|dosage)/gi, '').trim();
    let medicineRecord = null;
    if (medQuery.length > 2) {
      medicineRecord = await Medicine.findOne({
        $or: [
          { genericName: { $regex: new RegExp(medQuery, 'i') } },
          { brandExamples: { $regex: new RegExp(medQuery, 'i') } }
        ]
      });
    }

    if (medicineRecord) {
      return {
        content: `💊 **Medicine Information: ${medicineRecord.genericName}**\n\n` +
          `• **Common Brands**: ${medicineRecord.brandExamples.join(', ')}\n` +
          `• **Category**: ${medicineRecord.category}\n` +
          `• **Prescription Status**: ${medicineRecord.prescriptionStatus}\n` +
          `• **Common Uses**: ${medicineRecord.commonUses.join(', ')}\n` +
          `• **Common Side Effects**: ${medicineRecord.commonSideEffects.join(', ')}\n` +
          `• **Important Warnings**: ${medicineRecord.contraindications.join(', ')}\n\n` +
          `ℹ️ **Patient Guidance**: ${medicineRecord.patientInformation}\n\n` +
          `⚠️ **Important Clinical Safety Notice**: ClinicCare AI provides scientific medicine education only. In accordance with clinical safety laws, personalized prescriptions, dosages, and combinations are formulated exclusively by a licensed physician following doctor review.`,
        suggestedActions: [
          { label: '💊 Open Medicines Database', path: '/ai-doctor?tab=medicines' },
          { label: '🩺 Assess My Symptoms First', path: '/ai-doctor?tab=symptoms' }
        ]
      };
    }

    return {
      content: `💊 **ClinicCare Medicine Information Database**\n\nI can provide general pharmacology information for over 100+ verified medicines, including therapeutic indications, known side effects, contraindications, and drug interactions.\n\n*Example questions you can ask:*\n• "Tell me about Paracetamol"\n• "What is Metformin used for?"\n• "Contraindications of Amlodipine"\n\n⚠️ **Prescription Safety Protocol**: Patient-facing AI does not autonomously prescribe or adjust medication dosages. Treatment requires:\n**AI Assessment ➔ Doctor Review ➔ Doctor Approval ➔ Official Prescription ➔ Patient**.`,
      suggestedActions: [
        { label: '💊 Explore 100+ Medicines', path: '/ai-doctor?tab=medicines' },
        { label: '👨‍⚕️ Consult a Doctor', path: '/ai-doctor?tab=doctors' }
      ]
    };
  }

  // 4. HEALTH CONDITIONS DATABASE (Section 3)
  if (query.includes('condition') || query.includes('disease') || query.includes('fever') || query.includes('dengue') || query.includes('diabetes') || query.includes('asthma') || query.includes('hypertension') || query.includes('migraine')) {
    const conditionMatch = await Condition.findOne({
      $or: [
        { name: { $regex: new RegExp(query.slice(0, 15), 'i') } },
        { commonSymptoms: { $regex: new RegExp(query.slice(0, 15), 'i') } }
      ]
    });

    if (conditionMatch) {
      return {
        content: `🩺 **Condition Education: ${conditionMatch.name}**\n\n` +
          `• **Category**: ${conditionMatch.category}\n` +
          `• **Overview**: ${conditionMatch.generalInformation}\n` +
          `• **Common Symptoms**: ${conditionMatch.commonSymptoms.join(', ')}\n` +
          `• **Red-Flag Signs**: ${conditionMatch.redFlagSymptoms.join(', ')}\n` +
          `• **Recommended Specialty**: ${conditionMatch.recommendedSpecialty}\n` +
          `• **When to Seek Care**: ${conditionMatch.whenToSeekCare}\n\n` +
          `💡 **Patient Education**: ${conditionMatch.patientEducation}\n\n` +
          `*Note: This information is for patient health literacy only and is not a definitive medical diagnosis.*`,
        suggestedActions: [
          { label: `📅 Book ${conditionMatch.recommendedSpecialty} Visit`, path: `/book-appointment?specialty=${encodeURIComponent(conditionMatch.recommendedSpecialty)}` },
          { label: '🩺 Run Full Symptom Triage', path: '/ai-doctor?tab=symptoms' }
        ]
      };
    }
  }

  // 5. DIRECTORY QUERIES (Hospitals, Eye Care, Blood Banks, Ambulance)
  if (query.includes('hospital') || query.includes('kothrud') || query.includes('baner') || query.includes('shivajinagar')) {
    const hospitals = await Hospital.find().limit(3);
    const list = hospitals.map(h => `• **${h.name}** (${h.area}) — 📞 ${h.phone}`).join('\n');
    return {
      content: `🏥 **Verified Pune Hospital Directory**\n\nHere are verified hospitals listed in Pune & PCMC:\n\n${list}\n\nExplore our complete directory of 30+ verified hospitals with emergency availability and maps.`,
      suggestedActions: [
        { label: '🏥 Open Hospitals Directory', path: '/hospitals' },
        { label: '🚑 Request Ambulance', path: '/ambulance' }
      ]
    };
  }

  if (query.includes('blood') || query.includes('donor')) {
    return {
      content: `🩸 **Pune Blood Banks & Component Directory**\n\nPlease select your required blood group and location on our dedicated blood portal. For emergencies, contact the blood bank directly to verify real-time inventory.\n\n• National Blood Helpline: **104**\n• Jankalyan Raktakendra: **020-24444952**\n• Sassoon General Blood Bank: **020-26128000**`,
      suggestedActions: [
        { label: '🩸 Open Blood Banks', path: '/blood-banks' },
        { label: '❤️ I Want to Donate', path: '/blood-banks' }
      ]
    };
  }

  // 6. DEFAULT INTELLIGENT CLINICAL TRIAGE GREETING
  return {
    content: `👋 **Hello! I'm the ClinicCare AI Clinical Assistant.**\n\nI can help you with:\n• 🩺 **Symptom Assessment**: Describe your symptoms naturally for structured triaging.\n• 📅 **Doctor Appointments**: Find verified Pune specialists and check available consultation slots.\n• 💊 **Medicine Information**: Explore indications, side effects, and warnings for 100+ medicines.\n• 🏥 **Pune Healthcare Directory**: Locate hospitals, blood banks, eye clinics, and 24/7 ambulances.\n\n*How can I assist your health journey today?*`,
    suggestedActions: [
      { label: '🩺 Check Symptoms', path: '/ai-doctor?tab=symptoms' },
      { label: '📅 Book Appointment', path: '/ai-doctor?tab=appointments' },
      { label: '💊 Medicine Information', path: '/ai-doctor?tab=medicines' },
      { label: '👨‍⚕️ Find Doctor', path: '/ai-doctor?tab=doctors' },
      { label: '🏥 Find Hospital', path: '/hospitals' },
      { label: '🚑 Emergency', path: '/emergency' }
    ]
  };
}

module.exports = {
  detectEmergency,
  performSymptomAssessment,
  processAIDoctorChat
};
