import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  User,
  Search,
  Filter,
  Pill,
  Send,
  XCircle,
  Edit3,
  HelpCircle,
  Plus,
  Trash2,
  ShieldCheck,
  Calendar,
  Phone,
  Printer,
  ChevronRight,
  ExternalLink,
  Lock
} from 'lucide-react';

export default function DoctorDashboard() {
  const { user, isAuthenticated, login } = useAuth();
  const isDoctorOrAdmin = user?.role === 'doctor' || user?.role === 'admin';

  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Doctor Action Modal
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'Approve', 'Modify', 'Reject', 'Request More Information'
  const [actionNotes, setActionNotes] = useState('');
  const [clinicalImpression, setClinicalImpression] = useState('');
  const [actionPlan, setActionPlan] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Prescription Formulator
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({
    clinicalImpression: '',
    dietaryLifestyleAdvice: 'Adequate hydration, balanced nutritious diet, and sufficient rest.',
    followUp: 'Review after 5 days or immediately if warning signs develop.',
    medications: [
      { name: '', dosage: '', frequency: 'Twice daily after meals (BD)', duration: '5 days', instructions: 'Take with full glass of water' }
    ]
  });
  const [submittingRx, setSubmittingRx] = useState(false);

  // Quick Medicine Search in Doctor Panel
  const [medSearchQuery, setMedSearchQuery] = useState('');
  const [medSearchResults, setMedSearchResults] = useState([]);
  const [isSearchingMeds, setIsSearchingMeds] = useState(false);

  // Quick doctor login helper for testing
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && isDoctorOrAdmin) {
      fetchConsultations();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, isDoctorOrAdmin, statusFilter, urgencyFilter]);

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      let url = '/doctor/consultations?';
      if (statusFilter !== 'All') url += `status=${encodeURIComponent(statusFilter)}&`;
      if (urgencyFilter !== 'All') url += `urgency=${encodeURIComponent(urgencyFilter)}&`;

      const res = await api.get(url);
      if (res.success) {
        setConsultations(res.consultations);
        if (res.consultations.length > 0 && !selectedConsultation) {
          setSelectedConsultation(res.consultations[0]);
        } else if (selectedConsultation) {
          // Keep selected item refreshed
          const updated = res.consultations.find(c => c._id === selectedConsultation._id);
          if (updated) setSelectedConsultation(updated);
        }
      }
    } catch (err) {
      toast.error('Failed to load consultations: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDoctorLogin = async () => {
    setQuickLoginLoading(true);
    try {
      await login('doctor@cliniccare.com', 'doctor123');
      toast.success('Logged in as Dr. Rajesh Kulkarni (MD, ClinicCare Physician)');
    } catch (err) {
      toast.error('Doctor login failed: ' + err.message);
    } finally {
      setQuickLoginLoading(false);
    }
  };

  const openActionModal = (action) => {
    setPendingAction(action);
    setActionNotes('');
    setClinicalImpression(selectedConsultation?.aiAssessment?.possibleCauses?.[0] || '');
    setActionPlan(selectedConsultation?.aiAssessment?.recommendedNextStep || '');
    setActionModalOpen(true);
  };

  const submitDoctorAction = async (e) => {
    e.preventDefault();
    if (!selectedConsultation) return;
    setSubmittingAction(true);
    try {
      const res = await api.post('/doctor/review', {
        consultationId: selectedConsultation._id,
        decision: pendingAction,
        doctorNotes: actionNotes,
        clinicalImpression,
        actionPlan
      });

      if (res.success) {
        toast.success(`Consultation successfully marked as "${res.consultation.status}".`);
        setActionModalOpen(false);
        fetchConsultations();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmittingAction(false);
    }
  };

  const addMedicationRow = () => {
    setPrescriptionForm(prev => ({
      ...prev,
      medications: [
        ...prev.medications,
        { name: '', dosage: '', frequency: 'Twice daily after meals (BD)', duration: '5 days', instructions: 'Take as directed' }
      ]
    }));
  };

  const removeMedicationRow = (idx) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== idx)
    }));
  };

  const updateMedicationRow = (idx, field, val) => {
    setPrescriptionForm(prev => {
      const updated = [...prev.medications];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, medications: updated };
    });
  };

  const handleSearchMedicines = async (term) => {
    setMedSearchQuery(term);
    if (!term || term.length < 2) {
      setMedSearchResults([]);
      return;
    }
    setIsSearchingMeds(true);
    try {
      const res = await api.get(`/medicines?search=${encodeURIComponent(term)}&limit=6`);
      if (res.success) {
        setMedSearchResults(res.medicines);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingMeds(false);
    }
  };

  const applyMedicineToPrescription = (med) => {
    // Add or set into last medication row
    const newMed = {
      name: `${med.genericName} (${med.brandExamples?.[0] || 'Generic'})`,
      dosage: med.category.includes('Tablet') ? '500 mg' : 'As indicated',
      frequency: 'Twice daily after meals (BD)',
      duration: '5 days',
      instructions: med.patientInformation?.slice(0, 70) || 'Take with water'
    };

    setPrescriptionForm(prev => {
      const emptyIdx = prev.medications.findIndex(m => !m.name);
      if (emptyIdx !== -1) {
        const copy = [...prev.medications];
        copy[emptyIdx] = newMed;
        return { ...prev, medications: copy };
      }
      return { ...prev, medications: [...prev.medications, newMed] };
    });

    toast.success(`Added ${med.genericName} to prescription`);
  };

  const handleIssuePrescription = async (e) => {
    e.preventDefault();
    if (!selectedConsultation) return;

    const validMeds = prescriptionForm.medications.filter(m => m.name.trim());
    if (validMeds.length === 0) {
      toast.error('Please add at least one medication with a valid name.');
      return;
    }

    setSubmittingRx(true);
    try {
      const res = await api.post('/doctor/prescription', {
        consultationId: selectedConsultation._id,
        medications: validMeds,
        clinicalImpression: prescriptionForm.clinicalImpression || selectedConsultation.aiAssessment?.possibleCauses?.[0] || 'Clinical Diagnosis',
        dietaryLifestyleAdvice: prescriptionForm.dietaryLifestyleAdvice,
        followUp: prescriptionForm.followUp
      });

      if (res.success) {
        toast.success('Official doctor prescription finalized and issued!');
        setPrescriptionOpen(false);
        fetchConsultations();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to issue prescription');
    } finally {
      setSubmittingRx(false);
    }
  };

  const getUrgencyBadge = (urgency) => {
    if (!urgency) return null;
    if (urgency.includes('Emergency')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          🔴 Emergency
        </span>
      );
    }
    if (urgency.includes('Same-day')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          🟠 Same-day Attention
        </span>
      );
    }
    if (urgency.includes('Needs medical consultation')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          🟡 Consultation Needed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        🟢 General
      </span>
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved by Doctor':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">Approved</span>;
      case 'Modified by Doctor':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">Modified</span>;
      case 'Rejected by Doctor':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800">Rejected</span>;
      case 'More Information Requested':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">Info Requested</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">Under Review</span>;
    }
  };

  // Filter consultations by search query
  const filteredConsultations = consultations.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.patientName?.toLowerCase().includes(q) ||
      c.chiefComplaint?.toLowerCase().includes(q) ||
      c.aiAssessment?.recommendedSpecialty?.toLowerCase().includes(q)
    );
  });

  // Calculate summary metrics
  const totalReviews = consultations.length;
  const underReview = consultations.filter(c => c.status === 'Under Doctor Review').length;
  const approvedCount = consultations.filter(c => c.status === 'Approved by Doctor').length;
  const emergencyCount = consultations.filter(c => c.aiAssessment?.urgencyLevel?.includes('Emergency') || c.aiAssessment?.urgencyLevel?.includes('Same-day')).length;

  if (!isAuthenticated || !isDoctorOrAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-slate-200 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Doctor Review Portal Access</h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            The Clinical Review Dashboard is restricted to verified healthcare professionals and medical administrators.
            In compliance with healthcare safety rules, AI clinical assessments must be evaluated and approved by licensed medical practitioners before issuing prescriptions.
          </p>

          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-left mb-6 text-sm">
            <div className="font-semibold text-blue-900 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Verified Demo Doctor Account
            </div>
            <div className="text-blue-800 text-xs space-y-0.5">
              <div><strong>Email:</strong> doctor@cliniccare.com</div>
              <div><strong>Password:</strong> doctor123</div>
              <div><strong>Specialty:</strong> Internal Medicine & Clinical Reviewer (Pune MMC)</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleQuickDoctorLogin}
              disabled={quickLoginLoading}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Stethoscope className="w-5 h-5" />
              {quickLoginLoading ? 'Logging In...' : 'Quick Demo Doctor Sign-In'}
            </button>
            <Link
              to="/login"
              className="px-4 py-3 border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium rounded-xl transition flex items-center justify-center"
            >
              Standard Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Doctor Supervision Protocol Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Doctor Clinical Review Dashboard
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Supervise AI triage assessments, audit clinical warning signs, and issue signed digital prescriptions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-slate-900">{user.name}</div>
              <div className="text-xs text-slate-500">{user.role.toUpperCase()} • ClinicCare Medical Panel</div>
            </div>
            <Link
              to="/ai-doctor"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
            >
              <Stethoscope className="w-4 h-4 text-blue-600" />
              Open AI Doctor
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total Assigned</div>
            <div className="text-2xl font-bold text-slate-900">{totalReviews}</div>
            <div className="text-xs text-slate-500 mt-1">Clinical assessments</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-medium text-amber-600 uppercase tracking-wider mb-1">Needs Doctor Action</div>
            <div className="text-2xl font-bold text-amber-600">{underReview}</div>
            <div className="text-xs text-slate-500 mt-1">Awaiting clinical decision</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-1">Approved / Rx Issued</div>
            <div className="text-2xl font-bold text-emerald-600">{approvedCount}</div>
            <div className="text-xs text-slate-500 mt-1">Verified treatments</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm bg-rose-50/40">
            <div className="text-xs font-medium text-rose-600 uppercase tracking-wider mb-1">Urgent & Emergency</div>
            <div className="text-2xl font-bold text-rose-700">{emergencyCount}</div>
            <div className="text-xs text-rose-600 mt-1">Requires immediate care</div>
          </div>
        </div>

        {/* Main Content: Split Master-Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Master List: Consultations */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[750px]">
            {/* Search and Filters */}
            <div className="p-4 border-b border-slate-200 space-y-3 bg-slate-50/50">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search patient, complaint, specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-slate-500 block mb-1 font-medium">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-700 outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Under Doctor Review">Under Review</option>
                    <option value="Approved by Doctor">Approved</option>
                    <option value="Modified by Doctor">Modified</option>
                    <option value="Rejected by Doctor">Rejected</option>
                    <option value="More Information Requested">Info Requested</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 block mb-1 font-medium">Urgency</label>
                  <select
                    value={urgencyFilter}
                    onChange={(e) => setUrgencyFilter(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-700 outline-none"
                  >
                    <option value="All">All Urgencies</option>
                    <option value="Emergency">🔴 Emergency</option>
                    <option value="Same-day medical attention">🟠 Same-Day</option>
                    <option value="Needs medical consultation">🟡 Consultation</option>
                    <option value="General">🟢 General</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                  Loading clinical presentations...
                </div>
              ) : filteredConsultations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No consultations match the current criteria.
                </div>
              ) : (
                filteredConsultations.map(c => {
                  const isSelected = selectedConsultation?._id === c._id;
                  return (
                    <div
                      key={c._id}
                      onClick={() => setSelectedConsultation(c)}
                      className={`p-4 cursor-pointer transition text-left ${
                        isSelected
                          ? 'bg-blue-50/80 border-l-4 border-blue-600'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {c.patientName}
                          <span className="text-xs font-normal text-slate-500">
                            ({c.patientAge}y, {c.patientGender})
                          </span>
                        </div>
                        {getStatusBadge(c.status)}
                      </div>

                      <div className="text-xs font-medium text-slate-800 line-clamp-1 mb-1.5">
                        "{c.chiefComplaint}"
                      </div>

                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div>{getUrgencyBadge(c.aiAssessment?.urgencyLevel)}</div>
                        <div className="text-slate-400 text-[11px]">
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Detail View */}
          <div className="lg:col-span-7 space-y-6">
            {selectedConsultation ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-left">
                {/* Header & Quick Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-slate-900">
                        {selectedConsultation.patientName}
                      </h2>
                      <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                        Age: {selectedConsultation.patientAge} • {selectedConsultation.patientGender}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      Assessed: {new Date(selectedConsultation.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getUrgencyBadge(selectedConsultation.aiAssessment?.urgencyLevel)}
                    {getStatusBadge(selectedConsultation.status)}
                  </div>
                </div>

                {/* Emergency Alert if applicable */}
                {selectedConsultation.aiAssessment?.urgencyLevel?.includes('Emergency') && (
                  <div className="my-4 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-rose-900">
                      <div className="font-bold text-sm text-rose-700 mb-0.5">Critical Emergency Warning Flags Detected</div>
                      Patient reported life-threatening or severe acute symptoms. Immediate in-person hospital evaluation or emergency transport required.
                    </div>
                  </div>
                )}

                {/* Patient Clinical Profile */}
                <div className="my-5 bg-slate-50 rounded-xl p-4 border border-slate-200/80">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Patient Clinical Context</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <div className="text-slate-500">Chief Complaint</div>
                      <div className="font-semibold text-slate-900 mt-0.5">{selectedConsultation.chiefComplaint}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Duration</div>
                      <div className="font-semibold text-slate-900 mt-0.5">{selectedConsultation.symptomDuration || 'Not stated'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Severity</div>
                      <div className="font-semibold text-slate-900 mt-0.5">{selectedConsultation.symptomSeverity || 'Moderate'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Temperature</div>
                      <div className="font-semibold text-slate-900 mt-0.5">{selectedConsultation.temperature || 'Normal (98.6°F)'}</div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <div className="text-slate-500">Known Allergies</div>
                      <div className="font-medium text-slate-800 mt-0.5">{selectedConsultation.allergies || 'No known drug allergies (NKDA)'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Current Medications</div>
                      <div className="font-medium text-slate-800 mt-0.5">{selectedConsultation.currentMedicines || 'None'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Existing Conditions</div>
                      <div className="font-medium text-slate-800 mt-0.5">{selectedConsultation.existingConditions || 'None reported'}</div>
                    </div>
                  </div>
                </div>

                {/* AI Preliminary Triage Summary */}
                <div className="my-5 p-4 rounded-xl border border-blue-100 bg-blue-50/40 text-xs">
                  <div className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    AI Preliminary Triage Synthesis
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold text-slate-700">Symptoms Extracted: </span>
                      <span className="text-slate-600">
                        {selectedConsultation.aiAssessment?.symptomsUnderstood?.join(', ') || 'General constitutional symptoms'}
                      </span>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-700">Possible Causes to Discuss: </span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {selectedConsultation.aiAssessment?.possibleCauses?.map((cause, i) => (
                          <span key={i} className="px-2 py-0.5 bg-white border border-blue-200 rounded text-blue-800 text-[11px] font-medium">
                            {cause}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="font-semibold text-slate-700">Suggested Specialty: </span>
                        <span className="text-blue-700 font-semibold">{selectedConsultation.aiAssessment?.recommendedSpecialty}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">Recommended Next Step: </span>
                        <span className="text-slate-600">{selectedConsultation.aiAssessment?.recommendedNextStep}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Doctor Decision Record (If already reviewed) */}
                {selectedConsultation.doctorDecision?.decision && selectedConsultation.doctorDecision.decision !== 'Pending' && (
                  <div className="my-5 p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs">
                    <div className="font-bold text-emerald-900 text-sm mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Doctor Review Record ({selectedConsultation.doctorDecision.decision})
                    </div>
                    <div className="text-slate-700 mt-1">
                      <strong>Doctor Notes:</strong> {selectedConsultation.doctorDecision.doctorNotes || 'No additional notes'}
                    </div>
                    {selectedConsultation.doctorDecision.clinicalImpression && (
                      <div className="text-slate-700 mt-1">
                        <strong>Clinical Impression:</strong> {selectedConsultation.doctorDecision.clinicalImpression}
                      </div>
                    )}
                    <div className="text-slate-500 text-[11px] mt-1.5">
                      Reviewed on {new Date(selectedConsultation.doctorDecision.reviewedAt).toLocaleString()}
                    </div>
                  </div>
                )}

                {/* Final Prescription View or Formulator Button */}
                {selectedConsultation.prescription ? (
                  <div className="my-6 p-5 rounded-2xl bg-white border-2 border-emerald-500 shadow-md">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                          ℞
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Official Doctor Digital Prescription</div>
                          <div className="text-[11px] text-slate-500">Verified & Legally Formulated by Licensed Physician</div>
                        </div>
                      </div>
                      <button
                        onClick={() => window.print()}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print Rx
                      </button>
                    </div>

                    <div className="text-xs space-y-2 mb-3">
                      <div>
                        <strong>Doctor:</strong> {selectedConsultation.prescription.doctorName} (Reg #{selectedConsultation.prescription.doctorRegistrationNumber || 'MMC-84920'})
                      </div>
                      <div>
                        <strong>Specialty:</strong> {selectedConsultation.prescription.doctorSpecialty} • {selectedConsultation.prescription.clinicOrHospital}
                      </div>
                      <div>
                        <strong>Diagnosis / Impression:</strong> {selectedConsultation.prescription.clinicalImpression}
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden mb-3">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                          <tr>
                            <th className="p-2.5">Medication</th>
                            <th className="p-2.5">Dosage</th>
                            <th className="p-2.5">Frequency</th>
                            <th className="p-2.5">Duration</th>
                            <th className="p-2.5">Instructions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedConsultation.prescription.medications?.map((m, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="p-2.5 font-semibold text-slate-900">{m.name}</td>
                              <td className="p-2.5 text-slate-700">{m.dosage}</td>
                              <td className="p-2.5 text-slate-700">{m.frequency}</td>
                              <td className="p-2.5 text-slate-700">{m.duration}</td>
                              <td className="p-2.5 text-slate-600 italic">{m.instructions}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <div><strong>Diet & Lifestyle:</strong> {selectedConsultation.prescription.dietaryLifestyleAdvice}</div>
                      <div><strong>Follow Up:</strong> {selectedConsultation.prescription.followUp}</div>
                    </div>
                  </div>
                ) : (
                  <div className="my-6 p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-sm text-blue-900">Ready to issue prescription?</div>
                      <div className="text-xs text-blue-700">
                        Formulate an official doctor prescription with itemized medications, dosage, frequency, and instructions.
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setPrescriptionForm(prev => ({
                          ...prev,
                          clinicalImpression: selectedConsultation.aiAssessment?.possibleCauses?.[0] || ''
                        }));
                        setPrescriptionOpen(true);
                      }}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      + Issue Digital Prescription
                    </button>
                  </div>
                )}

                {/* Doctor Action Buttons (Approve, Modify, Reject, Request Info) */}
                <div className="pt-4 border-t border-slate-200">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                    Doctor Clinical Decision Actions
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <button
                      onClick={() => openActionModal('Approve')}
                      className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 shadow-sm transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve Triage
                    </button>
                    <button
                      onClick={() => openActionModal('Modify')}
                      className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 shadow-sm transition"
                    >
                      <Edit3 className="w-4 h-4" />
                      Modify Findings
                    </button>
                    <button
                      onClick={() => openActionModal('Request More Information')}
                      className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-1.5 shadow-sm transition"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Request Info
                    </button>
                    <button
                      onClick={() => openActionModal('Reject')}
                      className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center gap-1.5 shadow-sm transition"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Triage
                    </button>
                  </div>
                </div>

                {/* Quick Medicine Database Explorer Inside Review Panel */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Pill className="w-4 h-4 text-blue-600" />
                      105+ Medicine Reference Lookup
                    </div>
                    <span className="text-[11px] text-slate-500">Verified Pharmacological Database</span>
                  </div>

                  <div className="relative mb-3">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search active medicine (e.g. Paracetamol, Amoxicillin, Metformin)..."
                      value={medSearchQuery}
                      onChange={(e) => handleSearchMedicines(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  {medSearchResults.length > 0 && (
                    <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50 max-h-56 overflow-y-auto">
                      {medSearchResults.map(med => (
                        <div key={med._id} className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs flex items-start justify-between gap-3">
                          <div>
                            <div className="font-bold text-slate-900">{med.genericName} ({med.brandExamples?.join(', ')})</div>
                            <div className="text-slate-600 text-[11px] mt-0.5">
                              <strong>Uses:</strong> {med.commonMedicalUses?.slice(0, 2).join(', ')}
                            </div>
                            <div className="text-rose-600 text-[11px] mt-0.5">
                              <strong>Contraindications:</strong> {med.contraindications?.slice(0, 2).join(', ')}
                            </div>
                          </div>
                          <button
                            onClick={() => applyMedicineToPrescription(med)}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-medium whitespace-nowrap transition"
                          >
                            + Add to Rx
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-400">
                <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <div className="text-base font-medium text-slate-600">Select a consultation from the list</div>
                <div className="text-xs text-slate-400 mt-1">Review AI symptom assessments, verify warnings, and authorize care.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Doctor Action Modal */}
      {actionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl text-left border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Record Decision: {pendingAction}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Patient: {selectedConsultation?.patientName} (Chief complaint: "{selectedConsultation?.chiefComplaint}")
            </p>

            <form onSubmit={submitDoctorAction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Clinical Impression / Verified Diagnosis
                </label>
                <input
                  type="text"
                  value={clinicalImpression}
                  onChange={(e) => setClinicalImpression(e.target.value)}
                  placeholder="e.g. Acute Viral Pharyngitis"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Doctor Action Plan & Instructions
                </label>
                <input
                  type="text"
                  value={actionPlan}
                  onChange={(e) => setActionPlan(e.target.value)}
                  placeholder="e.g. Advised symptomatic relief; in-person follow up if fever exceeds 102°F"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Doctor Clinical Notes
                </label>
                <textarea
                  rows={3}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Document your clinical rationale, modifications, or specific questions for the patient..."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow transition disabled:opacity-50"
                >
                  {submittingAction ? 'Saving...' : 'Authorize Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prescription Formulator Modal */}
      {prescriptionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-left border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">
                    ℞
                  </span>
                  Issue Official Doctor Prescription
                </h3>
                <p className="text-xs text-slate-500">
                  Patient: {selectedConsultation?.patientName} • Signed by: {user.name} (Licensed Physician)
                </p>
              </div>
              <button
                onClick={() => setPrescriptionOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIssuePrescription} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Clinical Impression / Diagnosis
                </label>
                <input
                  type="text"
                  required
                  value={prescriptionForm.clinicalImpression}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, clinicalImpression: e.target.value })}
                  placeholder="e.g. Acute Bronchitis"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Medication Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Prescribed Medications ({prescriptionForm.medications.length})
                  </label>
                  <button
                    type="button"
                    onClick={addMedicationRow}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Drug Row
                  </button>
                </div>

                <div className="space-y-3">
                  {prescriptionForm.medications.map((med, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-slate-500">#{idx + 1} Medication</span>
                        {prescriptionForm.medications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMedicationRow(idx)}
                            className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-0.5"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <input
                          type="text"
                          required
                          placeholder="Drug Name (e.g. Paracetamol 500mg)"
                          value={med.name}
                          onChange={(e) => updateMedicationRow(idx, 'name', e.target.value)}
                          className="p-2 border border-slate-300 rounded-lg outline-none bg-white focus:ring-1 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Dosage (e.g. 1 Tablet)"
                          value={med.dosage}
                          onChange={(e) => updateMedicationRow(idx, 'dosage', e.target.value)}
                          className="p-2 border border-slate-300 rounded-lg outline-none bg-white focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <input
                          type="text"
                          placeholder="Frequency (e.g. BD / Twice daily)"
                          value={med.frequency}
                          onChange={(e) => updateMedicationRow(idx, 'frequency', e.target.value)}
                          className="p-2 border border-slate-300 rounded-lg outline-none bg-white focus:ring-1 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Duration (e.g. 5 days)"
                          value={med.duration}
                          onChange={(e) => updateMedicationRow(idx, 'duration', e.target.value)}
                          className="p-2 border border-slate-300 rounded-lg outline-none bg-white focus:ring-1 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Instructions (e.g. After food)"
                          value={med.instructions}
                          onChange={(e) => updateMedicationRow(idx, 'instructions', e.target.value)}
                          className="p-2 border border-slate-300 rounded-lg outline-none bg-white focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Dietary & Lifestyle Advice
                </label>
                <input
                  type="text"
                  value={prescriptionForm.dietaryLifestyleAdvice}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, dietaryLifestyleAdvice: e.target.value })}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Follow-up Recommendation
                </label>
                <input
                  type="text"
                  value={prescriptionForm.followUp}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, followUp: e.target.value })}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Legal Physician Authorization:</strong> By signing, you confirm you have verified the patient presentation and bear clinical responsibility for this electronic prescription.
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setPrescriptionOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRx}
                  className="px-6 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {submittingRx ? 'Signing...' : 'Sign & Finalize Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
