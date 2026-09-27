import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Stethoscope, 
  Calendar, 
  Pill, 
  UserCheck, 
  Building2, 
  AlertTriangle, 
  Send, 
  Sparkles, 
  Mic, 
  Trash2, 
  CheckCircle, 
  ArrowRight, 
  Clock, 
  ShieldAlert, 
  PhoneCall, 
  Search, 
  Info, 
  ChevronRight,
  Filter,
  User,
  Activity,
  Heart,
  FileText,
  MapPin,
  ExternalLink
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function AIDoctor() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'symptoms';
  const [activeTab, setActiveTab] = useState(initialTab); // 'symptoms', 'chat', 'appointments', 'medicines', 'doctors', 'emergency'
  
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // ----------------------------------------
  // 1. SYMPTOM ASSESSMENT STATE & HANDLERS
  // ----------------------------------------
  const [symptomForm, setSymptomForm] = useState({
    patientName: user?.name || '',
    age: '32',
    sex: 'Female',
    symptoms: '',
    duration: '2-3 days',
    severity: 'Moderate',
    temperature: '99.2°F',
    existingConditions: 'None',
    allergies: 'None',
    currentMedicines: 'None',
    riskFactors: 'Desk job, mild stress'
  });
  const [assessing, setAssessing] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);

  const handleSymptomSubmit = async (e) => {
    e.preventDefault();
    if (!symptomForm.symptoms.trim()) {
      toast.error('Please describe your symptoms.');
      return;
    }

    setAssessing(true);
    setAssessmentResult(null);
    try {
      const data = await api.post('/ai/symptom-assessment', symptomForm);
      if (data.success) {
        setAssessmentResult(data);
        if (data.isEmergency) {
          toast.error('🚨 Potential medical emergency detected. Please review immediate advice.');
        } else {
          toast.success('Clinical triage assessment generated.');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to complete assessment.');
    } finally {
      setAssessing(false);
    }
  };

  // ----------------------------------------
  // 2. CHATBOT STATE & STREAMING SIMULATION
  // ----------------------------------------
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: `👋 **Hello! I'm the ClinicCare AI Clinical Assistant.**\n\nI can assist you with preliminary symptom triaging, finding verified specialists across Pune, exploring medical condition information, and reviewing 100+ pharmaceuticals.\n\n*How can I help you today?*`,
      suggestedActions: [
        { label: '🩺 Assess My Symptoms', action: () => switchTab('symptoms') },
        { label: '📅 Book Doctor Visit', action: () => switchTab('appointments') },
        { label: '💊 Medicine Information', action: () => switchTab('medicines') },
        { label: '👨‍⚕️ Find Doctor', action: () => switchTab('doctors') },
        { label: '🏥 Find Hospital', action: () => navigate('/hospitals') },
        { label: '🚑 Emergency', action: () => switchTab('emergency') }
      ]
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const msg = textToSend || chatInput;
    if (!msg || !msg.trim() || isTyping) return;

    const userMsg = { role: 'user', content: msg.trim() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
      const data = await api.post('/ai/chat', { message: msg.trim() });
      if (data.success && data.message) {
        setChatMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: data.message.content,
            isEmergency: data.message.isEmergency,
            suggestedActions: data.message.suggestedActions?.map(act => ({
              label: act.label,
              action: () => {
                if (act.path) {
                  if (act.path.includes('tab=medicines&search=')) {
                    const searchName = decodeURIComponent(act.path.split('search=')[1]);
                    api.get(`/medicines?search=${encodeURIComponent(searchName)}&limit=1`).then(res => {
                      if (res.medicines && res.medicines.length > 0) {
                        setSelectedMedicineModal(res.medicines[0]);
                      } else {
                        switchTab('medicines');
                      }
                    }).catch(() => switchTab('medicines'));
                  } else if (act.path.startsWith('/ai-doctor?tab=')) {
                    const targetTab = act.path.split('tab=')[1].split('&')[0];
                    switchTab(targetTab);
                  } else {
                    navigate(act.path);
                  }
                }
              }
            }))
          }
        ]);
      }
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'I apologize, but my connection encountered a momentary disruption. Please try rephrasing or select one of the direct directory options below.'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // ----------------------------------------
  // 3. MEDICINES DATABASE STATE
  // ----------------------------------------
  const [medicines, setMedicines] = useState([]);
  const [loadingMeds, setLoadingMeds] = useState(false);
  const [medSearch, setMedSearch] = useState('');
  const [selectedMedCategory, setSelectedMedCategory] = useState('All');
  const [medCategories, setMedCategories] = useState([]);
  const [selectedMedicineModal, setSelectedMedicineModal] = useState(null);

  const fetchMedicines = async () => {
    setLoadingMeds(true);
    try {
      const params = new URLSearchParams();
      if (medSearch.trim()) params.append('search', medSearch.trim());
      if (selectedMedCategory !== 'All') params.append('category', selectedMedCategory);
      params.append('limit', '50');

      const data = await api.get(`/medicines?${params.toString()}`);
      if (data.success) {
        setMedicines(data.medicines || []);
        if (data.categories && medCategories.length === 0) {
          setMedCategories(['All', ...data.categories]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMeds(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'medicines') {
      fetchMedicines();
    }
  }, [activeTab, medSearch, selectedMedCategory]);

  // ----------------------------------------
  // 4. DOCTORS DIRECTORY STATE
  // ----------------------------------------
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [doctorSpecialtyFilter, setDoctorSpecialtyFilter] = useState('All');
  const [doctorSpecialties, setDoctorSpecialties] = useState([]);
  const [doctorSearch, setDoctorSearch] = useState('');

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const params = new URLSearchParams();
      if (doctorSpecialtyFilter !== 'All') params.append('specialty', doctorSpecialtyFilter);
      if (doctorSearch.trim()) params.append('search', doctorSearch.trim());

      const data = await api.get(`/doctors?${params.toString()}`);
      if (data.success) {
        setDoctors(data.doctors || []);
        if (data.specialties && doctorSpecialties.length === 0) {
          setDoctorSpecialties(['All', ...data.specialties]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDoctors(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'doctors' || activeTab === 'appointments') {
      fetchDoctors();
    }
  }, [activeTab, doctorSpecialtyFilter, doctorSearch]);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Module Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold tracking-wide uppercase mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" style={{ animationDuration: '4s' }} />
            AI Clinical Assistant & Doctor-Supervised Care
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            ClinicCare AI Doctor
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600 font-medium">
            AI-powered health information and appointment assistant
          </p>
          <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            <span>Physician-supervised platform. AI does not autonomously diagnose or prescribe.</span>
          </div>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {[
            { id: 'symptoms', label: 'Symptom Assessment', icon: Stethoscope, color: 'text-blue-600' },
            { id: 'chat', label: 'AI Clinical Chat', icon: Bot, color: 'text-indigo-600' },
            { id: 'appointments', label: 'Appointment Assistant', icon: Calendar, color: 'text-emerald-600' },
            { id: 'medicines', label: 'Medicine Information', icon: Pill, color: 'text-purple-600' },
            { id: 'doctors', label: 'Doctor Finder', icon: UserCheck, color: 'text-cyan-600' },
            { id: 'emergency', label: 'Emergency Assistance', icon: ShieldAlert, color: 'text-red-600' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shadow-xs cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md scale-102'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : tab.color}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* TAB 1: SYMPTOM ASSESSMENT (Structured + Natural Language) */}
        {/* ======================================================== */}
        {activeTab === 'symptoms' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Form Column */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl shadow-xs">
                  🩺
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Symptom Assessment</h2>
                  <p className="text-xs text-slate-500">Provide details for clinical risk triaging and specialist mapping.</p>
                </div>
              </div>

              <form onSubmit={handleSymptomSubmit} className="space-y-4">
                {/* Natural language symptom description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Describe your symptoms naturally *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="e.g., I have fever, dry cough, and headache for two days, worsening at night..."
                    value={symptomForm.symptoms}
                    onChange={(e) => setSymptomForm({ ...symptomForm, symptoms: e.target.value })}
                    className="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                {/* Structured Follow-ups */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Age</label>
                    <input
                      type="number"
                      min="1"
                      max="115"
                      value={symptomForm.age}
                      onChange={(e) => setSymptomForm({ ...symptomForm, age: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Sex</label>
                    <select
                      value={symptomForm.sex}
                      onChange={(e) => setSymptomForm({ ...symptomForm, sex: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Severity</label>
                    <select
                      value={symptomForm.severity}
                      onChange={(e) => setSymptomForm({ ...symptomForm, severity: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 font-medium"
                    >
                      <option value="Mild">Mild</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Severe">Severe</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 2 days, 1 week"
                      value={symptomForm.duration}
                      onChange={(e) => setSymptomForm({ ...symptomForm, duration: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Temperature (if checked)</label>
                    <input
                      type="text"
                      placeholder="e.g. 101.4°F or Normal"
                      value={symptomForm.temperature}
                      onChange={(e) => setSymptomForm({ ...symptomForm, temperature: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Existing Conditions & Allergies</label>
                  <input
                    type="text"
                    placeholder="e.g. Asthma, Penicillin allergy (or None)"
                    value={symptomForm.existingConditions}
                    onChange={(e) => setSymptomForm({ ...symptomForm, existingConditions: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={assessing}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {assessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Analyzing Clinical Pathways...</span>
                    </>
                  ) : (
                    <>
                      <Stethoscope className="w-5 h-5" />
                      <span>Generate Clinical Assessment</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Clinical Notice:</strong> Never present AI triage as a definitive diagnosis. Assessments are forwarded to licensed Pune doctors for supervised treatment.
                </p>
              </div>
            </div>

            {/* Results Column */}
            <div className="lg:col-span-6 space-y-6">
              {!assessmentResult && !assessing && (
                <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-xs">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4 text-2xl">
                    📊
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">No Assessment Active</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto">
                    Fill out the symptom assessment form on the left. The AI Clinical Assistant will categorize urgency, extract clinical indicators, and map appropriate Pune specialists.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => setSymptomForm(prev => ({ ...prev, symptoms: 'High fever, body aches, and dry cough for 2 days' }))}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                    >
                      Sample: Viral Fever
                    </button>
                    <button
                      onClick={() => setSymptomForm(prev => ({ ...prev, symptoms: 'Eye redness, burning, and gritty feeling since morning' }))}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                    >
                      Sample: Eye Irritation
                    </button>
                  </div>
                </div>
              )}

              {assessmentResult && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
                  {/* Urgency Badge Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Clinical Triage Result</span>
                      <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">Assessment Summary</h3>
                    </div>
                    <div>
                      {assessmentResult.assessment?.urgencyLevel === 'General' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          🟢 General
                        </span>
                      )}
                      {assessmentResult.assessment?.urgencyLevel === 'Needs medical consultation' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          🟡 Needs Medical Consultation
                        </span>
                      )}
                      {assessmentResult.assessment?.urgencyLevel === 'Same-day medical attention' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-orange-100 text-orange-800 border border-orange-300">
                          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                          🟠 Same-Day Medical Attention
                        </span>
                      )}
                      {assessmentResult.assessment?.urgencyLevel === 'Emergency' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-800 border border-red-300 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-red-600"></span>
                          🔴 Emergency
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Symptoms Understood */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Symptoms Understood</h4>
                    <div className="flex flex-wrap gap-2">
                      {assessmentResult.assessment?.symptomsUnderstood?.map((sym, idx) => (
                        <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200">
                          ✓ {sym}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Possible Causes to Discuss with Doctor */}
                  <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100">
                    <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">
                      Possible Causes (To discuss with a doctor)
                    </h4>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-blue-950 font-medium">
                      {assessmentResult.assessment?.possibleCauses?.map((cause, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                          {cause}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2.5 text-[11px] text-blue-700 italic">
                      *These are differential possibilities generated for physician discussion, not a final medical diagnosis.
                    </p>
                  </div>

                  {/* Recommended Specialty & Next Step */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Recommended Specialty</span>
                      <p className="text-base font-extrabold text-slate-900 mt-1">
                        {assessmentResult.assessment?.recommendedSpecialty || 'General Medicine'}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Consultation Status</span>
                      <p className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Sent to Doctor Review
                      </p>
                    </div>
                  </div>

                  {/* Recommended Next Step */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Recommended Next Step</h4>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-medium">
                      {assessmentResult.assessment?.recommendedNextStep}
                    </p>
                  </div>

                  {/* Commonly Used Medicine Information (Sections 4 & 16) */}
                  <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Commonly used medicine information
                      </h4>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100">
                        Information Only
                      </span>
                    </div>

                    <p className="text-[11px] text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200/80 leading-relaxed">
                      ⚠️ <strong>Medical Notice:</strong> Consult a qualified doctor before taking medication, especially if you are pregnant, have chronic conditions, take other medicines, or have allergies. The AI does not prescribe personalized doses or treatment plans.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {(assessmentResult.relatedMedicines?.length > 0 ? assessmentResult.relatedMedicines : [
                        {
                          _id: 'default-med',
                          genericName: 'Paracetamol',
                          category: 'Analgesic / Antipyretic',
                          commonUses: ['Fever', 'Mild to moderate pain'],
                          relatedSymptoms: ['Fever', 'Headache', 'Body aches', 'Tooth pain'],
                          prescriptionStatus: 'OTC (Over-The-Counter)'
                        }
                      ]).slice(0, 2).map((med, mIdx) => (
                        <div
                          key={med._id || mIdx}
                          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                                💊 {med.genericName}
                              </h5>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                {med.prescriptionStatus?.includes('OTC') ? 'OTC' : 'Rx Required'}
                              </span>
                            </div>
                            <p className="text-xs text-purple-700 font-medium">{med.category}</p>
                            
                            <div className="mt-2 text-xs text-slate-600">
                              <span className="font-semibold text-slate-800">Common uses:</span>{' '}
                              {med.commonUses?.slice(0, 2).join(' • ') || 'Fever • Pain'}
                            </div>

                            {!med.prescriptionStatus?.includes('OTC') && (
                              <p className="mt-1.5 text-[10px] text-amber-700 font-semibold">
                                *Doctor consultation required.
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => setSelectedMedicineModal(med)}
                            className="mt-3.5 w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1"
                          >
                            <span>[ CHECK DETAILS ]</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Matching Pune Doctors Ready for Booking */}
                  {assessmentResult.matchingDoctors?.length > 0 && (
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Available {assessmentResult.assessment?.recommendedSpecialty} Specialists in Pune
                        </h4>
                        <Link to="/appointments" className="text-xs font-bold text-blue-600 hover:underline">
                          View all
                        </Link>
                      </div>

                      <div className="space-y-2.5">
                        {assessmentResult.matchingDoctors.slice(0, 2).map((doc) => (
                          <div key={doc._id} className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-300 transition flex items-center justify-between bg-white shadow-2xs">
                            <div>
                              <p className="text-sm font-bold text-slate-900">{doc.name}</p>
                              <p className="text-xs text-slate-500">{doc.clinicOrHospital} • {doc.area}</p>
                              <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                                Slots: {doc.availableSlots?.slice(0, 2).join(', ')} • ₹{doc.consultationFee}
                              </p>
                            </div>
                            <Link
                              to={`/book-appointment?doctor=${encodeURIComponent(doc.name)}&specialty=${encodeURIComponent(doc.specialty)}`}
                              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                            >
                              Book
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Doctor Review Portal Link */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Record ID: #{assessmentResult.consultationId?.slice(-6)}</span>
                    <Link
                      to="/doctor-dashboard"
                      className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                    >
                      <span>Open Doctor Review Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: AI CLINICAL CHAT (ChatGPT-style Interface)        */}
        {/* ======================================================== */}
        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden flex flex-col h-[75vh]">
            
            {/* Chat Header */}
            <div className="p-4 sm:p-5 bg-linear-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                    ClinicCare AI Clinical Chat
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  </h3>
                  <p className="text-xs text-slate-300">Doctor-supervised intelligent assistant</p>
                </div>
              </div>
              <button
                onClick={() => setChatMessages([chatMessages[0]])}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer"
                title="Clear conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>

            {/* Quick Action Chips */}
            <div className="p-2 sm:px-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {[
                { label: '🩺 Check Symptoms', query: 'I have fever and headache for two days' },
                { label: '📅 Book Appointment', query: 'I need an eye doctor in Pune' },
                { label: '💊 Medicine Info', query: 'What are common side effects of Paracetamol?' },
                { label: '👨‍⚕️ Find Doctor', query: 'Find available cardiologists in Pune' },
                { label: '🏥 Find Hospital', query: 'Find hospitals in Kothrud' },
                { label: '🚑 Emergency', query: 'What should I do during severe chest pain?' }
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.query)}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 whitespace-nowrap transition cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Message Stream */}
            <div className="grow overflow-y-auto p-4 sm:p-6 space-y-4">
              {chatMessages.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      isUser ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white'
                    }`}>
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div className={`max-w-[85%] rounded-3xl p-4 sm:p-5 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : msg.isEmergency
                        ? 'bg-red-50 text-red-950 border-2 border-red-300 rounded-tl-none shadow-sm'
                        : 'bg-slate-100 text-slate-800 rounded-tl-none'
                    }`}>
                      <div className="whitespace-pre-line prose prose-sm max-w-none">
                        {msg.content}
                      </div>

                      {msg.suggestedActions?.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-wrap gap-2">
                          {msg.suggestedActions.map((action, aIdx) => (
                            <button
                              key={aIdx}
                              onClick={action.action}
                              className="px-3 py-1.5 rounded-xl bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 font-bold text-xs transition shadow-2xs cursor-pointer"
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-slate-100 rounded-2xl px-4 py-3 text-slate-500 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    <span className="ml-1 font-medium">Formulating clinical guidance...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <div className="relative grow">
                  <input
                    type="text"
                    placeholder="Ask about symptoms, doctor visits, medicines, or Pune hospitals..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="w-full pl-4 pr-12 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      toast('Voice input: Listening simulation active', { icon: '🎙️' });
                      setChatInput('I have headache and fever for 2 days');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 p-1 rounded-lg"
                    title="Voice input simulation"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!chatInput.trim() || isTyping}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm flex items-center gap-1.5 transition shadow-sm disabled:opacity-40 cursor-pointer"
                >
                  <span>Send</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: APPOINTMENT ASSISTANT                             */}
        {/* ======================================================== */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Automated Appointment Assistant</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Connect with verified specialists across Pune clinics and hospitals for in-person or video consultations.
                </p>
              </div>
              <Link
                to="/appointments"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs"
              >
                View My Scheduled Visits
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <div key={doctor._id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-lg hover:border-blue-300 transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        {doctor.specialty}
                      </span>
                      <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                        ★ {doctor.rating} ({doctor.reviewCount})
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-slate-900">{doctor.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{doctor.qualifications}</p>
                    <p className="text-xs text-slate-600 mt-2 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {doctor.clinicOrHospital}, {doctor.area}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Consultation Fee:</span>
                        <strong className="text-slate-900 font-bold">₹{doctor.consultationFee}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Available Days:</span>
                        <span className="text-slate-800 font-medium">{doctor.availableDays?.slice(0, 3).join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Next: {doctor.availableSlots?.[0] || '10:00 AM'}
                    </span>
                    <Link
                      to={`/book-appointment?doctor=${encodeURIComponent(doctor.name)}&specialty=${encodeURIComponent(doctor.specialty)}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      Book Slot
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: MEDICINE INFORMATION (100+ Database)              */}
        {/* ======================================================== */}
        {activeTab === 'medicines' && (
          <div className="space-y-6">
            {/* Search & Categories Bar */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">100+ Verified Medicine Database</h3>
                  <p className="text-xs text-slate-500">Therapeutic indications, contraindications, and pharmacological guidance.</p>
                </div>

                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search medicines (e.g. Paracetamol, Metformin)..."
                    value={medSearch}
                    onChange={(e) => setMedSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Treatment Flow Banner */}
              <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 text-xs text-blue-950 flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-blue-700 shrink-0" />
                  <span>
                    <strong>Clinical Safety Protocol:</strong> AI does not autonomously prescribe medicines. All treatments follow:
                  </span>
                </div>
                <div className="flex items-center gap-1 font-bold text-blue-900 text-xs overflow-x-auto whitespace-nowrap">
                  <span>AI Assessment</span>
                  <span>➔</span>
                  <span>Doctor Review</span>
                  <span>➔</span>
                  <span>Doctor Approval</span>
                  <span>➔</span>
                  <span className="text-emerald-700 font-extrabold">Prescription</span>
                </div>
              </div>
            </div>

            {/* Medicines Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingMeds ? (
                <div className="col-span-3 py-16 text-center text-slate-400">Loading verified medicines...</div>
              ) : medicines.length === 0 ? (
                <div className="col-span-3 py-16 text-center text-slate-500">No medicines found matching criteria.</div>
              ) : (
                medicines.map((med) => (
                  <div
                    key={med._id}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-lg transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                          {med.category}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                          med.prescriptionStatus.includes('OTC') ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
                        }`}>
                          {med.prescriptionStatus.split(' ')[0]}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900">{med.genericName}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        Brands: <span className="text-slate-700 font-medium">{med.brandExamples?.join(', ')}</span>
                      </p>

                      <div className="mt-3 text-xs text-slate-600 line-clamp-2">
                        <strong>Uses:</strong> {med.commonUses?.join(', ')}
                      </div>

                      <div className="mt-2 text-xs text-rose-700 bg-rose-50/70 p-2.5 rounded-xl border border-rose-100 line-clamp-2">
                        <strong>Warning:</strong> {med.contraindications?.join(', ')}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedMedicineModal(med)}
                      className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center justify-between w-full cursor-pointer"
                    >
                      <span>View Pharmacology Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: DOCTOR FINDER                                     */}
        {/* ======================================================== */}
        {activeTab === 'doctors' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Verified Pune Medical Specialists</h3>
                <p className="text-xs text-slate-500">Board-certified doctors affiliated with leading Pune & PCMC hospitals.</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={doctorSpecialtyFilter}
                  onChange={(e) => setDoctorSpecialtyFilter(e.target.value)}
                  className="px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="All">All Specialties</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Ophthalmology">Ophthalmology</option>
                  <option value="Pulmonology">Pulmonology</option>
                  <option value="Gastroenterology">Gastroenterology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Women's Health">Women's Health</option>
                  <option value="ENT">ENT</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Psychiatry">Psychiatry</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <div key={doctor._id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-lg transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        {doctor.specialty}
                      </span>
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-slate-900">{doctor.name}</h4>
                    <p className="text-xs text-slate-500">{doctor.qualifications} • {doctor.experienceYears} yrs exp</p>
                    
                    <p className="text-xs text-slate-600 mt-2 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {doctor.clinicOrHospital} ({doctor.area})
                    </p>

                    <p className="text-xs text-slate-600 line-clamp-2 mt-3 leading-relaxed">
                      {doctor.bio}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400">Consultation Fee</span>
                      <p className="text-sm font-extrabold text-slate-900">₹{doctor.consultationFee}</p>
                    </div>
                    <Link
                      to={`/book-appointment?doctor=${encodeURIComponent(doctor.name)}&specialty=${encodeURIComponent(doctor.specialty)}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      Book Visit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: EMERGENCY ASSISTANCE                              */}
        {/* ======================================================== */}
        {activeTab === 'emergency' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-red-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shrink-0">
                  🚨
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black">24/7 Pune Emergency Medical Protocol</h3>
                  <p className="text-red-100 text-sm mt-1">Immediate dispatch, trauma centres, and emergency hospital care.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <a
                  href="tel:108"
                  className="bg-white text-red-700 hover:bg-red-50 p-4 rounded-2xl font-black text-center shadow-md transition flex flex-col items-center justify-center gap-1"
                >
                  <PhoneCall className="w-6 h-6 text-red-600" />
                  <span className="text-xl">108</span>
                  <span className="text-[11px] font-bold text-red-900 uppercase">National Ambulance</span>
                </a>

                <a
                  href="tel:112"
                  className="bg-white text-red-700 hover:bg-red-50 p-4 rounded-2xl font-black text-center shadow-md transition flex flex-col items-center justify-center gap-1"
                >
                  <ShieldAlert className="w-6 h-6 text-red-600" />
                  <span className="text-xl">112</span>
                  <span className="text-[11px] font-bold text-red-900 uppercase">National Emergency</span>
                </a>

                <a
                  href="tel:104"
                  className="bg-white text-red-700 hover:bg-red-50 p-4 rounded-2xl font-black text-center shadow-md transition flex flex-col items-center justify-center gap-1"
                >
                  <Heart className="w-6 h-6 text-red-600" />
                  <span className="text-xl">104</span>
                  <span className="text-[11px] font-bold text-red-900 uppercase">Blood & Health Helpline</span>
                </a>
              </div>
            </div>

            {/* Emergency Hospital Quick Search */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Find 24/7 Casualty & ICU Hospitals Near You
              </h4>
              <p className="text-sm text-slate-600">
                Explore hospitals in Pune with verified round-the-clock emergency casualty wards, critical care ICU beds, and trauma surgical teams.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  to="/hospitals?emergency=true"
                  className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-sm transition shadow-sm flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  Explore 24/7 Emergency Hospitals
                </Link>
                <Link
                  to="/ambulance"
                  className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-sm transition shadow-sm flex items-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  Request Telemetry Ambulance
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Medicine Details Modal (Sections 5 & 6) */}
        {selectedMedicineModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 my-8 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedMedicineModal(null)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                  {selectedMedicineModal.category}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  selectedMedicineModal.prescriptionStatus?.includes('OTC') ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
                }`}>
                  {selectedMedicineModal.prescriptionStatus || 'Prescription Medicine'}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
                💊 {selectedMedicineModal.genericName}
              </h3>
              {selectedMedicineModal.brandExamples?.length > 0 && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Common Brands: <span className="font-semibold text-slate-700">{selectedMedicineModal.brandExamples.join(', ')}</span>
                </p>
              )}

              {/* Strict Medical Disclaimer Notice */}
              <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950">
                <strong>Important:</strong> The AI must NOT tell a patient a personalized dosage or treatment duration. Consult a qualified doctor before taking medication, especially if you are pregnant, have chronic conditions, take other medicines, or have allergies.
              </div>

              <div className="mt-6 space-y-4 text-xs sm:text-sm">
                {/* Generic Name & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Generic Name</span>
                    <p className="text-sm font-bold text-slate-900">{selectedMedicineModal.genericName}</p>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Category</span>
                    <p className="text-sm font-bold text-slate-900">{selectedMedicineModal.category}</p>
                  </div>
                </div>

                {/* Common Uses */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <strong className="text-slate-900 block mb-1">Common Uses:</strong>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {selectedMedicineModal.commonUses?.map((u, i) => (
                      <li key={i}>{u}</li>
                    ))}
                  </ul>
                </div>

                {/* Common symptom categories */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <strong className="text-slate-900 block mb-1">Common symptom categories:</strong>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {(selectedMedicineModal.relatedSymptoms?.length > 0
                      ? selectedMedicineModal.relatedSymptoms
                      : (selectedMedicineModal.commonUses || ['Fever', 'Headache', 'Pain'])
                    ).map((sym, i) => (
                      <span key={i} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-medium">
                        • {sym}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Section 6: Where this medicine may commonly be used */}
                <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100">
                  <strong className="text-blue-950 block mb-1 text-xs uppercase tracking-wider">
                    Where this medicine may commonly be used:
                  </strong>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {(selectedMedicineModal.relatedSymptoms?.length > 0
                      ? selectedMedicineModal.relatedSymptoms
                      : (selectedMedicineModal.commonUses || ['Fever', 'Mild/moderate pain'])
                    ).map((sym, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-blue-900 font-semibold">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{sym}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] text-blue-700 italic border-t border-blue-200/60 pt-2">
                    "These are common uses, not a personalized recommendation. Do NOT automatically take this medicine for your disease without a medical consultation."
                  </p>
                </div>

                {/* Warnings & Contraindications */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-100">
                    <strong className="text-rose-950 block text-xs uppercase tracking-wider mb-1">Warnings:</strong>
                    <ul className="space-y-1 text-rose-800 text-xs">
                      {selectedMedicineModal.warnings?.length > 0 ? (
                        selectedMedicineModal.warnings.map((w, i) => <li key={i}>• {w}</li>)
                      ) : (
                        <>
                          <li>• Allergy to the active medicine requires immediate avoidance</li>
                          <li>• Liver or kidney disease requires medical advice</li>
                          <li>• Check other medicines to avoid duplicate active products</li>
                        </>
                      )}
                    </ul>
                  </div>

                  <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-100">
                    <strong className="text-rose-950 block text-xs uppercase tracking-wider mb-1">Contraindications:</strong>
                    <ul className="space-y-1 text-rose-800 text-xs">
                      {selectedMedicineModal.contraindications?.map((c, i) => (
                        <li key={i}>• {c}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Side Effects & Interactions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-white">
                    <strong className="text-slate-900 block text-xs uppercase tracking-wider mb-1">Possible Side Effects:</strong>
                    <ul className="space-y-1 text-slate-600 text-xs">
                      {selectedMedicineModal.commonSideEffects?.map((s, i) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-white">
                    <strong className="text-slate-900 block text-xs uppercase tracking-wider mb-1">Interactions:</strong>
                    <p className="text-slate-600 text-xs">
                      {selectedMedicineModal.importantInteractions?.join(', ') || selectedMedicineModal.interactions?.join(', ') || 'Consult doctor or pharmacist before combining with other medications.'}
                    </p>
                  </div>
                </div>

                {/* When to Consult a Doctor */}
                <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/80">
                  <strong className="text-amber-950 block text-xs uppercase tracking-wider mb-1">When to Consult a Doctor:</strong>
                  <ul className="space-y-1 text-amber-900 text-xs">
                    <li>• Persistent or severe fever</li>
                    <li>• Severe symptoms or symptoms getting worse</li>
                    <li>• Unexplained recurrent symptoms</li>
                  </ul>
                </div>

                {/* Prescription Status Notice */}
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Prescription Status:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedMedicineModal.prescriptionStatus}
                    {!selectedMedicineModal.prescriptionStatus?.includes('OTC') && ' — Doctor consultation required.'}
                  </span>
                </div>
              </div>

              {/* Action Buttons: [📅 Book Doctor] [👨‍⚕️ Find Doctor] [← Back to AI Doctor] */}
              <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedMedicineModal(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>← Back to AI Doctor</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedMedicineModal(null);
                      switchTab('doctors');
                    }}
                    className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>👨‍⚕️ Find Doctor</span>
                  </button>

                  <Link
                    to="/appointments"
                    onClick={() => setSelectedMedicineModal(null)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>📅 Book Doctor</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
