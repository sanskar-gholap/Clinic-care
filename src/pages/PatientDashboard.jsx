import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Stethoscope, 
  Pill, 
  Building2, 
  Droplet, 
  Eye, 
  UserCheck, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Activity, 
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function PatientDashboard() {
  const { user, profile, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [upcomingAppointment, setUpcomingAppointment] = useState(null);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [recentConsultations, setRecentConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast('Please log in to view your dashboard.');
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        // Fetch appointments
        const apptData = await api.get('/appointments');
        if (apptData.success) {
          const list = apptData.appointments || [];
          setAppointmentsCount(list.length);
          const next = list.find((a) => a.status === 'Confirmed' || a.status === 'Pending') || list[0];
          setUpcomingAppointment(next || null);
        }

        // Fetch user's own AI consultations (scoped on server by authenticated user id)
        const consultData = await api.get('/doctor/consultations');
        if (consultData.success) {
          setRecentConsultations(consultData.consultations || []);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const patientName = user?.name || 'Patient';
  const vitals = profile?.vitals || {
    bloodPressure: '120/80',
    weight: '68',
    height: '175',
    healthScore: 92
  };

  const formatApptDate = (dateStr) => {
    if (!dateStr) return { month: 'Upcoming', day: '--' };
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return { month: 'Upcoming', day: '--' };
    return {
      month: dateObj.toLocaleString('en-US', { month: 'short' }),
      day: dateObj.getDate()
    };
  };

  const apptDateObj = formatApptDate(upcomingAppointment?.date);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 min-h-screen bg-slate-50/70">
      
      {/* Header (Section 12: Welcome, [Patient Name]) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            ClinicCare Patient Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
            Welcome, {patientName}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Access your appointments, AI health consultations, verified Pune healthcare facilities, and pharmaceuticals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/ai-doctor" 
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-sm flex items-center gap-2"
          >
            <Stethoscope className="w-4 h-4" />
            AI Doctor
          </Link>
          <Link 
            to="/book-appointment" 
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-sm flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Book Visit
          </Link>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 12 REQUIRED CARDS                                */}
      {/* 📅 Upcoming Appointment, 🩺 AI Health Assistant,          */}
      {/* 💊 Medicine Information, 🏥 Hospitals, 🩸 Blood Banks,   */}
      {/* 👁️ Eye Care, 👨‍⚕️ Doctors                                   */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        
        {/* Card 1: 📅 Upcoming Appointment */}
        <Link
          to="/appointments"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 transition-all group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
              📅
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
              {appointmentsCount} scheduled
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Upcoming Appointment
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
              {upcomingAppointment ? `${upcomingAppointment.doctorName || 'Doctor Visit'} (${upcomingAppointment.specialty})` : 'No upcoming visits'}
            </p>
          </div>
        </Link>

        {/* Card 2: 🩺 AI Health Assistant */}
        <Link
          to="/ai-doctor"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-400 transition-all group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">
              🩺
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
              Active Triage
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              AI Health Assistant
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Check symptoms & get doctor guidance
            </p>
          </div>
        </Link>

        {/* Card 3: 💊 Medicine Information */}
        <Link
          to="/ai-doctor?tab=medicines"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-purple-400 transition-all group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl">
              💊
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
              100+ Verified
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
              Medicine Information
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Explore pharmacology, side effects & uses
            </p>
          </div>
        </Link>

        {/* Card 4: 🏥 Hospitals */}
        <Link
          to="/hospitals"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-rose-400 transition-all group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xl">
              🏥
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700">
              30+ in Pune
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
              Hospitals
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Emergency casualty, ICU & multispecialty
            </p>
          </div>
        </Link>

        {/* Card 5: 🩸 Blood Banks */}
        <Link
          to="/blood-banks"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-red-400 transition-all group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-xl">
              🩸
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700">
              24/7 Supply
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-slate-900 group-hover:text-red-600 transition-colors">
              Blood Banks
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pune live component stock & donor centres
            </p>
          </div>
        </Link>

        {/* Card 6: 👁️ Eye Care */}
        <Link
          to="/eye-care"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-cyan-400 transition-all group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-xl">
              👁️
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700">
              Specialized
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
              Eye Care
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Retina, cataract, LASIK & cornea clinics
            </p>
          </div>
        </Link>

        {/* Card 7: 👨‍⚕️ Doctors */}
        <Link
          to="/ai-doctor?tab=doctors"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
              👨‍⚕️
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
              Board-Certified
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              Doctors
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Find Pune medical specialists by department
            </p>
          </div>
        </Link>

        {/* Emergency Quick Action */}
        <Link
          to="/hospitals?emergency=true"
          className="bg-red-600 text-white rounded-2xl p-5 shadow-xs hover:shadow-lg hover:bg-red-700 transition-all group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold text-xl">
              🚨
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white text-red-700">
              24/7 Ready
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-white">
              Emergency Casualty
            </h3>
            <p className="text-xs text-red-100 mt-0.5">
              Trauma centres, ICU & 108 ambulance
            </p>
          </div>
        </Link>
      </div>

      {/* Main Grid: Upcoming Visit Details + Recent Consultations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 cols): Next Appointment & Consultations */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Upcoming Appointment Detail */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Next Scheduled Visit</h3>
                <p className="text-xs text-slate-400">Doctor appointment status and location</p>
              </div>
              <Link to="/appointments" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                View All Visits →
              </Link>
            </div>

            {upcomingAppointment ? (
              <div className="p-6 sm:p-8 bg-linear-to-br from-white to-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100 flex flex-col items-center justify-center font-bold shadow-xs">
                    <span className="text-xs uppercase tracking-wider opacity-80">{apptDateObj.month}</span>
                    <span className="text-2xl leading-none mt-1">{apptDateObj.day}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{upcomingAppointment.doctorName || 'Dr. Specialist'}</h4>
                    <p className="text-slate-500 text-xs font-medium">
                      {upcomingAppointment.specialty} • Status:{' '}
                      <span className="text-blue-600 font-bold">{upcomingAppointment.status}</span>
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> {upcomingAppointment.time || '10:30 AM'}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {upcomingAppointment.clinicOrHospital || 'Pune Clinic'}</span>
                    </div>
                  </div>
                </div>
                <Link 
                  to="/appointments" 
                  className="w-full sm:w-auto bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors shadow-xs text-center"
                >
                  Manage Visit
                </Link>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50/50">
                <p className="text-slate-500 mb-3 text-xs sm:text-sm">No scheduled upcoming appointments found.</p>
                <Link to="/book-appointment" className="inline-flex px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs">
                  Schedule New Appointment
                </Link>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* SECTION 12: RECENT AI CONSULTATIONS TABLE                */}
          {/* Date, Symptoms, AI summary, Recommended specialty,       */}
          {/* Appointment status                                       */}
          {/* ======================================================== */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Recent AI Consultations</h3>
                <p className="text-xs text-slate-400">Symptom assessments reviewed and supervised by doctors</p>
              </div>
              <Link to="/ai-doctor?tab=symptoms" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                + New Assessment
              </Link>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading clinical records...</div>
            ) : recentConsultations.length === 0 ? (
              <div className="p-8 text-center bg-slate-50/50">
                <p className="text-slate-500 mb-3 text-xs sm:text-sm">No recent AI consultations recorded.</p>
                <Link to="/ai-doctor" className="inline-flex px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs">
                  Start AI Symptom Assessment
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">Date</th>
                      <th className="py-3.5 px-4">Symptoms</th>
                      <th className="py-3.5 px-4">AI Summary</th>
                      <th className="py-3.5 px-4">Recommended Specialty</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Appointment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {recentConsultations.map((consult) => {
                      const dateObj = new Date(consult.createdAt);
                      const formattedDate = !isNaN(dateObj.getTime())
                        ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'Recent';

                      const symptomsText = consult.symptomsDescription || 'General health inquiry';
                      const summaryText = consult.aiAssessment?.possibleCauses?.join(', ') || consult.aiAssessment?.recommendedNextStep || 'General clinical triage';
                      const specialty = consult.aiAssessment?.recommendedSpecialty || 'General Medicine';
                      const status = consult.status || 'Under Doctor Review';

                      return (
                        <tr key={consult._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-4 sm:px-6 font-medium text-slate-900 whitespace-nowrap">
                            {formattedDate}
                          </td>
                          <td className="py-4 px-4 max-w-xs truncate font-medium text-slate-800">
                            {symptomsText}
                          </td>
                          <td className="py-4 px-4 max-w-xs truncate text-slate-600">
                            {summaryText}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-100">
                              {specialty}
                            </span>
                          </td>
                          <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : status === 'Modified'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              <CheckCircle2 className="w-3 h-3" />
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Quick Clinical Links & Vitals */}
        <div className="space-y-6">
          
          {/* Quick Access to Portals */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Pune Directory Quick Links
            </h3>
            <div className="space-y-2">
              <Link
                to="/hospitals"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50 transition border border-slate-100 text-xs font-bold text-slate-800 hover:text-blue-700"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>30 Pune Hospitals</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to="/blood-banks"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-red-50 transition border border-slate-100 text-xs font-bold text-slate-800 hover:text-red-700"
              >
                <div className="flex items-center gap-2.5">
                  <Droplet className="w-4 h-4 text-red-600" />
                  <span>Blood Banks & Live Stock</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to="/eye-care"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-cyan-50 transition border border-slate-100 text-xs font-bold text-slate-800 hover:text-cyan-700"
              >
                <div className="flex items-center gap-2.5">
                  <Eye className="w-4 h-4 text-cyan-600" />
                  <span>Eye Care Specialists</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to="/ai-doctor?tab=medicines"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-purple-50 transition border border-slate-100 text-xs font-bold text-slate-800 hover:text-purple-700"
              >
                <div className="flex items-center gap-2.5">
                  <Pill className="w-4 h-4 text-purple-600" />
                  <span>100+ Medicine Compendium</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Vitals Summary Card */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Latest Patient Vitals
              </h3>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Blood Pressure:</span>
                <span className="font-bold text-sm text-white">{vitals.bloodPressure || '120/80'} mmHg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Weight:</span>
                <span className="font-bold text-sm text-white">{vitals.weight || '68'} kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Height:</span>
                <span className="font-bold text-sm text-white">{vitals.height || '175'} cm</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <span className="text-slate-400">Health Index:</span>
                <span className="font-bold text-sm text-emerald-400">{vitals.healthScore || '92'} / 100</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}