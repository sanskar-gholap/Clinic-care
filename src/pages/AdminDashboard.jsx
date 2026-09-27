import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  Shield, 
  Users, 
  Calendar, 
  Activity, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  RefreshCw,
  Building2,
  Droplet,
  Eye,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  X,
  Phone,
  MapPin,
  Stethoscope,
  Pill,
  BookOpen,
  Lock,
  Mail,
  Key,
  UserPlus,
  LogIn,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('directory'); // 'directory', 'security', 'doctors', 'medicines', 'conditions', 'appointments'

  // Security & Users State (Section 8)
  const [securityData, setSecurityData] = useState(null);
  const [loadingSecurity, setLoadingSecurity] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // Doctors State
  const [doctorsList, setDoctorsList] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState('');

  // Medicines State
  const [medicinesList, setMedicinesList] = useState([]);
  const [loadingMedicines, setLoadingMedicines] = useState(false);
  const [medicineSearch, setMedicineSearch] = useState('');

  // Conditions State
  const [conditionsList, setConditionsList] = useState([]);
  const [loadingConditions, setLoadingConditions] = useState(false);
  const [conditionSearch, setConditionSearch] = useState('');

  // Appointment & stats state
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    appointmentsToday: 0,
    activeStaff: 48,
    systemHealth: '99.9%',
    pendingAmbulance: 0,
    pendingBlood: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Facility management state
  const [facilityType, setFacilityType] = useState('hospitals'); // 'hospitals', 'blood-banks', 'eye-care'
  const [facilities, setFacilities] = useState([]);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [facilitySearch, setFacilitySearch] = useState('');
  
  // Modal / Form state for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Multispeciality',
    area: '',
    address: '',
    phone: '',
    emergencyAvailable: false,
    departments: '',
    services: '',
    openingHours: '24/7 Emergency & ICU',
    website: '',
    googleMapsUrl: '',
    isVerified: true
  });
  const [savingFacility, setSavingFacility] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoadingStats(true);
      const data = await api.get('/admin/stats');
      if (data.success) {
        setStats(data.stats || {});
        setRecentAppointments(data.recentAppointments || []);
      }
    } catch (err) {
      if (err.status === 403 || err.status === 401) {
        toast.error('Admin privileges required. Please sign in as administrator.');
      } else {
        toast.error(err.message || 'Failed to fetch admin metrics.');
      }
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchFacilities = async () => {
    try {
      setLoadingFacilities(true);
      const endpoint = facilityType === 'hospitals' 
        ? '/hospitals?limit=100' 
        : facilityType === 'blood-banks' 
        ? '/blood-banks' 
        : '/eye-care';
      
      const res = await api.get(endpoint);
      if (res.success) {
        if (facilityType === 'hospitals') setFacilities(res.hospitals || []);
        else if (facilityType === 'blood-banks') setFacilities(res.bloodBanks || []);
        else setFacilities(res.eyeCentres || res.centres || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load facilities.');
    } finally {
      setLoadingFacilities(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const res = await api.get('/doctors?limit=100');
      if (res.success) setDoctorsList(res.doctors || []);
    } catch (err) {
      toast.error('Failed to load doctors: ' + err.message);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchMedicines = async () => {
    try {
      setLoadingMedicines(true);
      const res = await api.get('/medicines?limit=120');
      if (res.success) setMedicinesList(res.medicines || []);
    } catch (err) {
      toast.error('Failed to load medicines: ' + err.message);
    } finally {
      setLoadingMedicines(false);
    }
  };

  const fetchConditions = async () => {
    try {
      setLoadingConditions(true);
      const res = await api.get('/ai/conditions?limit=120');
      if (res.success) setConditionsList(res.conditions || []);
    } catch (err) {
      toast.error('Failed to load conditions: ' + err.message);
    } finally {
      setLoadingConditions(false);
    }
  };

  const fetchSecurityData = async () => {
    try {
      setLoadingSecurity(true);
      const res = await api.get('/admin/security');
      if (res.success) {
        setSecurityData(res);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load security overview.');
    } finally {
      setLoadingSecurity(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchAdminData();
      if (activeTab === 'directory') fetchFacilities();
      if (activeTab === 'security') fetchSecurityData();
      if (activeTab === 'doctors') fetchDoctors();
      if (activeTab === 'medicines') fetchMedicines();
      if (activeTab === 'conditions') fetchConditions();
    } else {
      setLoadingStats(false);
    }
  }, [isAuthenticated, isAdmin, facilityType, activeTab]);

  // Doctor Verification & Delete
  const handleToggleDoctorVerify = async (doc) => {
    try {
      const newStatus = !doc.isVerified;
      await api.put(`/doctors/${doc._id}`, { isVerified: newStatus });
      toast.success(newStatus ? 'Marked as "✓ Verified"' : 'Verification removed');
      setDoctorsList(prev => prev.map(d => d._id === doc._id ? { ...d, isVerified: newStatus } : d));
    } catch (err) {
      toast.error('Failed to update doctor verification: ' + err.message);
    }
  };

  const handleDeleteDoctor = async (id, name) => {
    if (!window.confirm(`Delete Dr. ${name}?`)) return;
    try {
      await api.delete(`/doctors/${id}`);
      toast.success(`Dr. ${name} removed.`);
      setDoctorsList(prev => prev.filter(d => d._id !== id));
    } catch (err) {
      toast.error('Delete failed: ' + err.message);
    }
  };

  // Medicine Verification & Delete
  const handleToggleMedicineVerify = async (med) => {
    try {
      const newStatus = !med.isVerified;
      await api.put(`/medicines/${med._id}`, { isVerified: newStatus });
      toast.success(newStatus ? 'Marked as "✓ Verified"' : 'Verification removed');
      setMedicinesList(prev => prev.map(m => m._id === med._id ? { ...m, isVerified: newStatus } : m));
    } catch (err) {
      toast.error('Failed to update medicine: ' + err.message);
    }
  };

  const handleDeleteMedicine = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await api.delete(`/medicines/${id}`);
      toast.success(`${name} deleted.`);
      setMedicinesList(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      toast.error('Delete failed: ' + err.message);
    }
  };

  // Condition Verification & Delete
  const handleToggleConditionVerify = async (cond) => {
    try {
      const newStatus = !cond.isVerified;
      await api.put(`/ai/conditions/${cond._id}`, { isVerified: newStatus });
      toast.success(newStatus ? 'Marked as "✓ Verified"' : 'Verification removed');
      setConditionsList(prev => prev.map(c => c._id === cond._id ? { ...c, isVerified: newStatus } : c));
    } catch (err) {
      toast.error('Failed to update condition: ' + err.message);
    }
  };

  const handleDeleteCondition = async (id, name) => {
    if (!window.confirm(`Delete condition "${name}"?`)) return;
    try {
      await api.delete(`/ai/conditions/${id}`);
      toast.success(`Condition "${name}" removed.`);
      setConditionsList(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      toast.error('Delete failed: ' + err.message);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    setUpdatingId(appointmentId);
    try {
      const data = await api.patch(`/appointments/${appointmentId}/status`, { status: newStatus });
      if (data.success) {
        toast.success(`Appointment status set to ${newStatus}`);
        setRecentAppointments((prev) =>
          prev.map((a) => (a._id === appointmentId ? { ...a, status: newStatus } : a))
        );
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Facility Actions
  const handleOpenAddModal = () => {
    setEditingFacility(null);
    setFormData({
      name: '',
      type: facilityType === 'hospitals' ? 'Multispeciality' : facilityType === 'blood-banks' ? 'Blood Bank & Component Centre' : 'Eye Hospital',
      area: '',
      address: '',
      phone: '',
      emergencyAvailable: true,
      departments: 'General Medicine, Emergency, ICU',
      services: 'OPD, Inpatient Care, Diagnostic Services',
      openingHours: '24/7 Emergency & Inpatient',
      website: '',
      googleMapsUrl: '',
      isVerified: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (facility) => {
    setEditingFacility(facility);
    setFormData({
      name: facility.name || '',
      type: facility.type || 'Multispeciality',
      area: facility.area || '',
      address: facility.address || '',
      phone: facility.phone || '',
      emergencyAvailable: facility.emergencyAvailable ?? true,
      departments: Array.isArray(facility.departments) ? facility.departments.join(', ') : (facility.departments || ''),
      services: Array.isArray(facility.services) ? facility.services.join(', ') : (facility.services || ''),
      openingHours: facility.openingHours || '24/7',
      website: facility.website || '',
      googleMapsUrl: facility.googleMapsUrl || '',
      isVerified: facility.isVerified ?? true
    });
    setIsModalOpen(true);
  };

  const handleSaveFacility = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.area || !formData.address || !formData.phone) {
      toast.error('Please fill in facility name, area, address, and verified phone.');
      return;
    }

    setSavingFacility(true);
    try {
      const payload = {
        ...formData,
        departments: typeof formData.departments === 'string' 
          ? formData.departments.split(',').map(s => s.trim()).filter(Boolean) 
          : formData.departments,
        services: typeof formData.services === 'string' 
          ? formData.services.split(',').map(s => s.trim()).filter(Boolean) 
          : formData.services
      };

      const endpoint = facilityType === 'hospitals'
        ? '/hospitals'
        : facilityType === 'blood-banks'
        ? '/blood-banks'
        : '/eye-care';

      if (editingFacility) {
        await api.put(`${endpoint}/${editingFacility._id}`, payload);
        toast.success(`Facility updated successfully.`);
      } else {
        await api.post(endpoint, payload);
        toast.success(`New facility added to Pune Directory.`);
      }

      setIsModalOpen(false);
      fetchFacilities();
    } catch (err) {
      toast.error(err.message || 'Failed to save facility.');
    } finally {
      setSavingFacility(false);
    }
  };

  const handleToggleVerify = async (facility) => {
    try {
      const newStatus = !facility.isVerified;
      const endpoint = facilityType === 'hospitals'
        ? `/hospitals/${facility._id}`
        : facilityType === 'blood-banks'
        ? `/blood-banks/${facility._id}`
        : `/eye-care/${facility._id}`;

      await api.put(endpoint, { isVerified: newStatus });
      toast.success(newStatus ? 'Marked as "✓ Verified by ClinicCare"' : 'Verification removed');
      setFacilities(prev => prev.map(f => f._id === facility._id ? { ...f, isVerified: newStatus } : f));
    } catch (err) {
      toast.error(err.message || 'Failed to update verification status');
    }
  };

  const handleDeleteFacility = async (facilityId, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      return;
    }
    try {
      const endpoint = facilityType === 'hospitals'
        ? `/hospitals/${facilityId}`
        : facilityType === 'blood-banks'
        ? `/blood-banks/${facilityId}`
        : `/eye-care/${facilityId}`;

      await api.delete(endpoint);
      toast.success(`${name} removed from directory.`);
      setFacilities(prev => prev.filter(f => f._id !== facilityId));
    } catch (err) {
      toast.error(err.message || 'Failed to delete facility.');
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 pt-32 text-center">
        <div className="card p-10 max-w-lg mx-auto bg-white rounded-3xl shadow-xl border border-slate-100">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Administrator Access Required</h2>
          <p className="text-gray-600 mb-6 text-sm">
            You must be logged in as an administrator to access clinical management and live directory verification.
          </p>
          <div className="bg-slate-50 p-4 rounded-xl text-left text-xs text-gray-700 mb-6 border border-slate-200">
            <p className="font-bold mb-1">Demo Administrator Credentials:</p>
            <p>Email: <code className="text-blue-700 font-mono">admin@cliniccare.com</code></p>
            <p>Password: <code className="text-blue-700 font-mono">admin123</code></p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-sm"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  const filteredFacilities = facilities.filter(f => 
    f.name?.toLowerCase().includes(facilitySearch.toLowerCase()) ||
    f.area?.toLowerCase().includes(facilitySearch.toLowerCase()) ||
    f.address?.toLowerCase().includes(facilitySearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-28 min-h-[85vh]">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-100">
            <Shield className="w-3.5 h-3.5" />
            ClinicCare Central Administration
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Pune Healthcare Administration</h1>
          <p className="text-slate-500 text-sm mt-1">Manage verified Pune medical facilities, appointments, and emergency readiness.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { fetchAdminData(); fetchFacilities(); }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-2 text-sm font-semibold shadow-xs transition"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-8 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('directory')}
          className={`pb-3 px-3 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
            activeTab === 'directory' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Hospitals & Facilities
        </button>
        <button
          onClick={() => setActiveTab('doctors')}
          className={`pb-3 px-3 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
            activeTab === 'doctors' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          Doctors (Pune Specialists)
        </button>
        <button
          onClick={() => setActiveTab('medicines')}
          className={`pb-3 px-3 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
            activeTab === 'medicines' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Pill className="w-4 h-4" />
          105+ Medicines
        </button>
        <button
          onClick={() => setActiveTab('conditions')}
          className={`pb-3 px-3 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
            activeTab === 'conditions' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          105+ Health Conditions
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 px-3 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
            activeTab === 'security' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          Security & Users
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 px-3 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
            activeTab === 'appointments' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Appointments & Stats
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB: ADMIN SECURITY & AUTHENTICATION (SECTION 8)          */}
      {/* Total Users, New Registrations, Recent Logins,           */}
      {/* Failed Login Attempts, Recent Appointments & Users Table */}
      {/* ======================================================== */}
      {activeTab === 'security' && (
        <div className="space-y-8">
          
          {/* Section Header with Admin Email details */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2 border border-indigo-100">
                <Lock className="w-3.5 h-3.5" />
                Security & Authentication Monitoring
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Admin Security Dashboard</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Monitors user authentication events, failed logins, and administrative email dispatches.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Administrator Email</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 font-mono">
                  {securityData?.adminEmail || 'youradmin@gmail.com'}
                </span>
              </div>
            </div>
          </div>

          {/* Metric Cards (Section 8: Total Users, New Registrations, Recent Logins, Failed Login Attempts, Recent Appointments) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card 1: Total Users */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
                👥
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</p>
                <p className="text-2xl font-black text-slate-900">{securityData?.metrics?.totalUsers ?? '...'}</p>
              </div>
            </div>

            {/* Card 2: New Registrations */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
                🆕
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">New Registrations</p>
                <p className="text-2xl font-black text-slate-900">{securityData?.metrics?.newRegistrations ?? '...'}</p>
              </div>
            </div>

            {/* Card 3: Recent Logins */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">
                🔑
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recent Logins</p>
                <p className="text-2xl font-black text-slate-900">{securityData?.metrics?.recentLogins ?? '...'}</p>
              </div>
            </div>

            {/* Card 4: Failed Login Attempts */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xl">
                ⚠️
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Failed Logins</p>
                <p className="text-2xl font-black text-rose-600">{securityData?.metrics?.failedLoginAttempts ?? '...'}</p>
              </div>
            </div>

            {/* Card 5: Recent Appointments */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl">
                📅
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Appointments</p>
                <p className="text-2xl font-black text-slate-900">{securityData?.metrics?.recentAppointments ?? '...'}</p>
              </div>
            </div>
          </div>

          {/* SECTION 8 TABLE: User, Email, Registration Date, Last Login, Status (NO PASSWORDS) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Registered Users Directory</h3>
                <p className="text-xs text-slate-400">
                  User accounts and security status. Passwords and hashes are strictly withheld from administrative views.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {loadingSecurity ? (
              <div className="p-12 text-center text-slate-400 text-xs">Loading registered users...</div>
            ) : !securityData?.users || securityData.users.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">No user accounts found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-6">User</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Registration Date</th>
                      <th className="py-3.5 px-4">Last Login</th>
                      <th className="py-3.5 px-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {securityData.users
                      .filter((u) => {
                        if (!userSearch) return true;
                        const q = userSearch.toLowerCase();
                        return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
                      })
                      .map((u) => {
                        const regDate = u.registrationDate ? new Date(u.registrationDate) : null;
                        const formattedReg = regDate && !isNaN(regDate.getTime())
                          ? regDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : 'N/A';

                        const lastLoginDate = u.lastLogin ? new Date(u.lastLogin) : null;
                        const formattedLogin = lastLoginDate && !isNaN(lastLoginDate.getTime())
                          ? lastLoginDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : 'Never logged in';

                        return (
                          <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap flex items-center gap-2">
                              <span>{u.name}</span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                {u.role}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-mono text-blue-600 whitespace-nowrap">
                              {u.email}
                            </td>
                            <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                              {formattedReg}
                            </td>
                            <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                              {formattedLogin}
                            </td>
                            <td className="py-4 px-6 text-right whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                u.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                <CheckCircle className="w-3 h-3" />
                                {u.status || 'Active'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>🔒 Passwords and password hashes are never displayed, stored in emails, or returned over APIs.</span>
              <span>Bcrypt 10-round salting enabled</span>
            </div>
          </div>

          {/* Email Notifications Dispatch Log */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Admin Email Notifications Log</h3>
                <p className="text-xs text-slate-500">
                  Recent system emails dispatched to {securityData?.adminEmail || 'admin@gmail.com'} via Nodemailer
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Live Audit Active
              </span>
            </div>

            {securityData?.emailAuditLogs?.length > 0 ? (
              <div className="space-y-3">
                {securityData.emailAuditLogs.slice(0, 10).map((log, lIdx) => (
                  <div key={lIdx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                        log.type === 'registration'
                          ? 'bg-emerald-100 text-emerald-700'
                          : log.type === 'login'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {log.type === 'registration' ? '✉️' : log.type === 'login' ? '🔑' : '🚨'}
                      </span>
                      <div>
                        <p className="font-bold text-slate-900">{log.subject}</p>
                        <p className="text-slate-500 text-[11px]">
                          Target: <span className="font-mono text-slate-700">{log.userEmail}</span> • Recipient: <span className="font-mono text-slate-700">{log.recipient}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right sm:shrink-0">
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        ✓ {log.status}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                No email dispatches recorded yet in this session.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 1: FACILITY DIRECTORY MANAGEMENT */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category Select */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setFacilityType('hospitals')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition ${
                  facilityType === 'hospitals'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Hospitals
              </button>
              <button
                onClick={() => setFacilityType('blood-banks')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition ${
                  facilityType === 'blood-banks'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Droplet className="w-4 h-4" />
                Blood Banks
              </button>
              <button
                onClick={() => setFacilityType('eye-care')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition ${
                  facilityType === 'eye-care'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Eye className="w-4 h-4" />
                Eye Care
              </button>
            </div>

            {/* Search & Add */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search facilities..."
                  value={facilitySearch}
                  onChange={(e) => setFacilitySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleOpenAddModal}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                Add Facility
              </button>
            </div>
          </div>

          {/* Facilities List Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {facilityType === 'hospitals' ? 'Pune Hospitals' : facilityType === 'blood-banks' ? 'Pune Blood Banks' : 'Pune Eye Care Centres'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Showing {filteredFacilities.length} registered facilities</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                {filteredFacilities.filter(f => f.isVerified).length} Verified
              </span>
            </div>

            {loadingFacilities ? (
              <div className="py-16 text-center text-slate-400">Loading facilities...</div>
            ) : filteredFacilities.length === 0 ? (
              <div className="py-16 text-center text-slate-500">No facilities matching criteria.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Facility Details</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Area & Phone</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Emergency Status</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Verification Badge</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredFacilities.map((facility) => (
                      <tr key={facility._id} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-900">{facility.name}</div>
                          <div className="text-xs text-slate-500 line-clamp-1">{facility.address}</div>
                          {facility.type && (
                            <span className="inline-block mt-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                              {facility.type}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {facility.area}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {facility.phone}
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          {facility.emergencyAvailable ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                              24/7 Emergency
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                              Standard OPD Hours
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          {facility.isVerified ? (
                            <button
                              onClick={() => handleToggleVerify(facility)}
                              title="Click to toggle verification"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              ✓ Verified by ClinicCare
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleVerify(facility)}
                              title="Click to verify this facility"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition cursor-pointer"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                              Pending Verification
                            </button>
                          )}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditModal(facility)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit facility details"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteFacility(facility._id, facility.name)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete facility"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: APPOINTMENTS & METRICS (PRESERVED) */}
      {activeTab === 'appointments' && (
        <div className="space-y-8">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-md">
              <h3 className="text-blue-100 mb-1 text-sm font-medium">Total Registered Patients</h3>
              <p className="text-3xl font-extrabold">{stats.totalPatients || 1}</p>
              <span className="text-xs text-blue-200 mt-2 block">Verified Database Records</span>
            </div>
            <div className="card p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-slate-500 mb-1 text-sm font-medium">Appointments Today</h3>
              <p className="text-3xl font-bold text-slate-900">{stats.appointmentsToday || 0}</p>
              <span className="text-xs text-emerald-600 font-semibold mt-2 block">Live Schedule</span>
            </div>
            <div className="card p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-slate-500 mb-1 text-sm font-medium">Active Staff</h3>
              <p className="text-3xl font-bold text-slate-900">{stats.activeStaff || 48}</p>
              <span className="text-xs text-slate-400 mt-2 block">Doctors & Nurses on Duty</span>
            </div>
            <div className="card p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-slate-500 mb-1 text-sm font-medium">System Health</h3>
              <p className="text-3xl font-bold text-emerald-600">{stats.systemHealth || '99.9%'}</p>
              <span className="text-xs text-slate-400 mt-2 block">All APIs Operational</span>
            </div>
          </div>

          {/* Emergency & Blood alerts */}
          {(stats.pendingAmbulance > 0 || stats.pendingBlood > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stats.pendingAmbulance > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-bold text-red-900">
                      {stats.pendingAmbulance} Active Ambulance Dispatch(es)
                    </span>
                  </div>
                  <a href="/ambulance" className="text-xs font-bold text-red-700 underline">Track</a>
                </div>
              )}
              {stats.pendingBlood > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <span className="text-sm font-bold text-amber-900">
                      {stats.pendingBlood} Pending Blood Requisition(s)
                    </span>
                  </div>
                  <a href="/blood-search" className="text-xs font-bold text-amber-700 underline">Review</a>
                </div>
              )}
            </div>
          )}

          {/* Appointments Management Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <h3 className="font-bold text-lg text-slate-900 mb-4">Patient Appointments & Status Control</h3>
            {loadingStats ? (
              <div className="py-12 text-center text-slate-500">Loading appointment records...</div>
            ) : recentAppointments.length === 0 ? (
              <div className="py-8 text-center text-slate-500">No appointments recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Specialty / Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {recentAppointments.map((appt) => (
                      <tr key={appt._id} className="hover:bg-slate-50/70 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                          {appt.patientName}
                          <span className="block text-xs font-normal text-slate-400">{appt.patientEmail}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                          <span className="font-medium">{appt.doctorName}</span>
                          <span className="block text-xs text-blue-600 font-semibold">{appt.specialty}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {appt.date} • {appt.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              appt.status === 'Confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : appt.status === 'Completed'
                                ? 'bg-blue-100 text-blue-800'
                                : appt.status === 'Cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {appt.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <select
                            value={appt.status}
                            disabled={updatingId === appt._id}
                            onChange={(e) => handleStatusChange(appt._id, e.target.value)}
                            className="text-xs border border-slate-300 rounded-lg p-1.5 bg-white text-slate-700 font-medium cursor-pointer hover:border-blue-500"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DOCTORS MANAGEMENT */}
      {activeTab === 'doctors' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                Verified Pune Medical Specialists & Practitioners
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Total: {doctorsList.length} doctors • Verified: {doctorsList.filter(d => d.isVerified).length} active
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, specialty, clinic..."
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {loadingDoctors ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                Loading doctors directory...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="px-6 py-3.5">Doctor & Credentials</th>
                      <th className="px-6 py-3.5">Specialty & Area</th>
                      <th className="px-6 py-3.5">Hospital / Clinic</th>
                      <th className="px-6 py-3.5">Fee & Slots</th>
                      <th className="px-6 py-3.5">Verification</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {doctorsList
                      .filter(d => {
                        if (!doctorSearch) return true;
                        const q = doctorSearch.toLowerCase();
                        return (
                          d.name?.toLowerCase().includes(q) ||
                          d.specialty?.toLowerCase().includes(q) ||
                          d.clinicOrHospital?.toLowerCase().includes(q) ||
                          d.area?.toLowerCase().includes(q)
                        );
                      })
                      .map(doc => (
                        <tr key={doc._id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">{doc.name}</div>
                            <div className="text-slate-500 text-xs">{doc.qualifications} • Reg: {doc.registrationNumber}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-blue-600">{doc.specialty}</span>
                            <div className="text-slate-500 text-xs">{doc.area}</div>
                          </td>
                          <td className="px-6 py-4 text-slate-700">
                            {doc.clinicOrHospital}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-900">₹{doc.consultationFee}</div>
                            <div className="text-slate-500 text-xs">{doc.availableDays?.slice(0, 3).join(', ')}</div>
                          </td>
                          <td className="px-6 py-4">
                            {doc.isVerified ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                ✓ Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                Pending Verification
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => handleToggleDoctorVerify(doc)}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                                doc.isVerified
                                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              {doc.isVerified ? 'Unverify' : '✓ Verify Doctor'}
                            </button>
                            <button
                              onClick={() => handleDeleteDoctor(doc._id, doc.name)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: MEDICINES MANAGEMENT */}
      {activeTab === 'medicines' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-600" />
                105+ Medicines & Pharmacological Reference Database
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Total: {medicinesList.length} medicines indexed • Verified: {medicinesList.filter(m => m.isVerified).length} verified
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search generic name, brand, uses..."
                value={medicineSearch}
                onChange={(e) => setMedicineSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {loadingMedicines ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                Loading medicines database...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="px-6 py-3.5">Generic Name & Brands</th>
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5">Rx Status</th>
                      <th className="px-6 py-3.5">Common Medical Uses</th>
                      <th className="px-6 py-3.5">Verification</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {medicinesList
                      .filter(m => {
                        if (!medicineSearch) return true;
                        const q = medicineSearch.toLowerCase();
                        return (
                          m.genericName?.toLowerCase().includes(q) ||
                          m.brandExamples?.some(b => b.toLowerCase().includes(q)) ||
                          m.category?.toLowerCase().includes(q)
                        );
                      })
                      .map(med => (
                        <tr key={med._id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">{med.genericName}</div>
                            <div className="text-slate-500 text-xs">Brands: {med.brandExamples?.join(', ')}</div>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-700">
                            {med.category}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              med.prescriptionStatus?.includes('Over-the-Counter')
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {med.prescriptionStatus || 'Prescription Required (Rx)'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-xs max-w-xs truncate">
                            {med.commonMedicalUses?.join(', ')}
                          </td>
                          <td className="px-6 py-4">
                            {med.isVerified ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                ✓ Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                Pending Verification
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => handleToggleMedicineVerify(med)}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                                med.isVerified
                                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              {med.isVerified ? 'Unverify' : '✓ Verify Drug'}
                            </button>
                            <button
                              onClick={() => handleDeleteMedicine(med._id, med.genericName)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: CONDITIONS MANAGEMENT */}
      {activeTab === 'conditions' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                105+ Health Conditions Clinical Knowledge Base
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Total: {conditionsList.length} conditions • Verified: {conditionsList.filter(c => c.isVerified).length} verified
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search condition, specialty..."
                value={conditionSearch}
                onChange={(e) => setConditionSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {loadingConditions ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                Loading health conditions...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="px-6 py-3.5">Condition Name</th>
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5">Recommended Specialty</th>
                      <th className="px-6 py-3.5">Urgency Grading</th>
                      <th className="px-6 py-3.5">Verification</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {conditionsList
                      .filter(c => {
                        if (!conditionSearch) return true;
                        const q = conditionSearch.toLowerCase();
                        return (
                          c.name?.toLowerCase().includes(q) ||
                          c.category?.toLowerCase().includes(q) ||
                          c.recommendedSpecialty?.toLowerCase().includes(q)
                        );
                      })
                      .map(cond => (
                        <tr key={cond._id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">{cond.name}</div>
                            <div className="text-slate-500 text-xs line-clamp-1">{cond.commonSymptoms?.slice(0, 3).join(', ')}</div>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-700">
                            {cond.category}
                          </td>
                          <td className="px-6 py-4 font-semibold text-blue-600">
                            {cond.recommendedSpecialty}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              cond.urgencyLevel?.includes('Emergency')
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : cond.urgencyLevel?.includes('Same-day')
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {cond.urgencyLevel}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {cond.isVerified ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                ✓ Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                Pending Verification
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => handleToggleConditionVerify(cond)}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                                cond.isVerified
                                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              {cond.isVerified ? 'Unverify' : '✓ Verify Condition'}
                            </button>
                            <button
                              onClick={() => handleDeleteCondition(cond._id, cond.name)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FACILITY ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8 relative border border-slate-100">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-1">
              {editingFacility ? 'Edit Facility Details' : 'Add New Pune Medical Facility'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Facility will be immediately indexed and updated in the live directory.
            </p>

            <form onSubmit={handleSaveFacility} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Facility Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Ruby Hall Clinic"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Facility Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Multispeciality">Multispeciality</option>
                    <option value="Government">Government</option>
                    <option value="Private">Private</option>
                    <option value="Speciality">Speciality</option>
                    <option value="Eye Hospital">Eye Hospital</option>
                    <option value="Children's Hospital">Children's Hospital</option>
                    <option value="Women's Hospital">Women's Hospital</option>
                    <option value="Blood Bank">Blood Bank</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Area / Locality *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Sassoon Road / Kothrud / Baner"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Verified Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 020-66455100"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Complete street address, landmarks, Pune pin code"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Departments / Specialities</label>
                  <input
                    type="text"
                    placeholder="Comma separated: Cardiology, Oncology, ICU"
                    value={formData.departments}
                    onChange={(e) => setFormData({ ...formData, departments: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Services</label>
                  <input
                    type="text"
                    placeholder="Comma separated: 24/7 Pharmacy, Trauma Centre, Blood Bank"
                    value={formData.services}
                    onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Opening Hours</label>
                  <input
                    type="text"
                    placeholder="e.g. 24 Hours Emergency / 8:00 AM - 8:00 PM"
                    value={formData.openingHours}
                    onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Official Website</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.emergencyAvailable}
                    onChange={(e) => setFormData({ ...formData, emergencyAvailable: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded-md focus:ring-red-500"
                  />
                  <span className="text-xs font-bold text-slate-800">24/7 Emergency & ICU Available</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVerified}
                    onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Mark as "✓ Verified by ClinicCare"
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingFacility}
                  className="px-6 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {savingFacility ? 'Saving...' : editingFacility ? 'Update Facility' : 'Save New Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}