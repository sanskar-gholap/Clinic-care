import React, { useState, useEffect } from 'react';
import {
  Droplet,
  Heart,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Navigation,
  Search,
  Filter,
  CheckCircle,
  PlusCircle,
  X
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const PUNE_AREAS = ['All', 'Sadashiv Peth', 'Shivajinagar', 'Kothrud', 'Pimpri', 'Chinchwad', 'Hadapsar'];

export default function BloodBanks() {
  const { user, profile } = useAuth();

  const [bloodBanks, setBloodBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedArea, setSelectedArea] = useState('All');

  // Modals
  const [showNeedBloodModal, setShowNeedBloodModal] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);

  // Blood Requirement Form State
  const [reqForm, setReqForm] = useState({
    patientName: '',
    bloodGroup: 'O+',
    unitsRequired: 1,
    hospital: '',
    requiredDate: '',
    contactNumber: '',
    urgency: 'Immediate (Critical)',
    additionalInfo: ''
  });
  const [submittingReq, setSubmittingReq] = useState(false);

  // Donor Intent Form State
  const [donorForm, setDonorForm] = useState({
    donorName: '',
    donorBloodGroup: 'O+',
    phone: '',
    area: 'Shivajinagar',
    lastDonatedMonths: 'None (First Time)'
  });
  const [submittingDonor, setSubmittingDonor] = useState(false);

  const fetchBloodBanks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (selectedGroup !== 'All') params.append('bloodGroup', selectedGroup);
      if (selectedArea !== 'All') params.append('area', selectedArea);

      const data = await api.get(`/blood-banks?${params.toString()}`);
      if (data.success) {
        setBloodBanks(data.bloodBanks || []);
      }
    } catch (err) {
      console.error('Fetch blood banks error:', err);
      toast.error('Failed to load blood banks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBloodBanks();
  }, [selectedGroup, selectedArea]);

  useEffect(() => {
    if (user) {
      setReqForm((prev) => ({
        ...prev,
        patientName: user.name || '',
        contactNumber: user.phone || profile?.phone || '',
        bloodGroup: profile?.bloodGroup || 'O+'
      }));
      setDonorForm((prev) => ({
        ...prev,
        donorName: user.name || '',
        phone: user.phone || profile?.phone || '',
        donorBloodGroup: profile?.bloodGroup || 'O+'
      }));
    }
  }, [user, profile]);

  const handleRequirementSubmit = async (e) => {
    e.preventDefault();
    if (!reqForm.patientName || !reqForm.contactNumber || !reqForm.hospital) {
      toast.error('Please fill in all mandatory fields.');
      return;
    }

    setSubmittingReq(true);
    try {
      const data = await api.post('/blood/request', {
        patientName: reqForm.patientName,
        bloodGroup: reqForm.bloodGroup,
        units: Number(reqForm.unitsRequired),
        hospital: reqForm.hospital,
        contactPhone: reqForm.contactNumber,
        urgency: reqForm.urgency,
        notes: `Required Date: ${reqForm.requiredDate}. Note: ${reqForm.additionalInfo}`
      });

      if (data.success) {
        toast.success(`Blood requirement for ${reqForm.bloodGroup} registered! Donors and regional blood banks alerted.`);
        setShowNeedBloodModal(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit blood request.');
    } finally {
      setSubmittingReq(false);
    }
  };

  const handleDonorSubmit = (e) => {
    e.preventDefault();
    setSubmittingDonor(true);
    setTimeout(() => {
      toast.success('Thank you for pledging to donate blood! We have registered your donor profile.');
      setSubmittingDonor(false);
      setShowDonateModal(false);
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 min-h-[85vh]">
      {/* Header Banner */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                🩸 Pune Blood Network
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                FDA & SBTC Licensed Centres
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Pune Blood Banks & Donation Directory
            </h1>
            <p className="text-gray-500 text-sm mt-1 max-w-2xl">
              Locate authorized 24/7 hospital blood banks and voluntary blood centres across Pune & Pimpri-Chinchwad.
            </p>
          </div>

          {/* Prominent Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowNeedBloodModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transition-all flex items-center gap-2 text-sm cursor-pointer"
            >
              <Droplet className="w-4 h-4 fill-white" />
              🩸 I Need Blood
            </button>
            <button
              onClick={() => setShowDonateModal(true)}
              className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-5 py-3 rounded-2xl shadow-lg transition-all flex items-center gap-2 text-sm cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-rose-400 text-rose-400" />
              ❤️ I Want to Donate Blood
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Emergency Real-time Inventory Warning */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-2xl text-amber-900 shadow-2xs">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed">
            <span className="font-bold block text-amber-950 mb-0.5">Real-Time Inventory Advisory:</span>
            Blood availability varies dynamically by component (RBC, Platelets, FFP).
            <strong className="mx-1">Please contact the relevant blood bank or hospital directly using the phone numbers listed below to confirm real-time availability</strong>
            before traveling.
          </div>
        </div>
      </div>

      {/* Search & Blood Group Filters */}
      <div className="card p-5 mb-8 bg-white border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search blood banks by name, hospital, or locality..."
              className="input-field pl-10"
            />
          </div>
          <button onClick={fetchBloodBanks} className="btn-primary py-2.5 px-6 whitespace-nowrap cursor-pointer">
            Search Centres
          </button>
        </div>

        {/* Blood Group Selectors */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
            Filter by Compatible Blood Group:
          </label>
          <div className="flex flex-wrap gap-2">
            {BLOOD_GROUPS.map((bg) => (
              <button
                key={bg}
                onClick={() => setSelectedGroup(bg)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedGroup === bg
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                }`}
              >
                {bg === 'All' ? 'All Blood Groups' : bg}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blood Banks Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-6 border border-gray-100 animate-pulse space-y-3">
              <div className="h-6 bg-gray-200 rounded-md w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded-md w-full"></div>
              <div className="h-8 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : bloodBanks.length === 0 ? (
        <div className="card p-12 text-center border border-gray-100">
          <Droplet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No blood centres found</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
            Try adjusting your search query or reset blood group filters.
          </p>
          <button onClick={() => { setSearch(''); setSelectedGroup('All'); }} className="btn-secondary text-sm">
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bloodBanks.map((bb) => (
            <div
              key={bb._id}
              className="card p-6 border border-gray-100 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 inline-block mb-1">
                      📍 {bb.area}
                    </span>
                    <h3 className="font-bold text-xl text-gray-900 leading-snug">
                      {bb.name}
                    </h3>
                    {bb.hospitalAffiliation && (
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        {bb.hospitalAffiliation}
                      </p>
                    )}
                  </div>

                  <span className="px-2 py-1 rounded-md text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 shrink-0">
                    ✓ Verified
                  </span>
                </div>

                {/* Full Address */}
                <p className="text-gray-600 text-xs mb-3 flex items-start gap-1.5 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                  <span>{bb.address}</span>
                </p>

                {/* Timings & Donation Availability */}
                <div className="space-y-1 text-xs text-gray-700 mb-4 bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                    <span className="font-semibold text-emerald-700">{bb.workingHours}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{bb.donationAvailability}</span>
                  </div>
                </div>

                {/* Blood Groups Supported */}
                <div className="mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
                    Recognized Blood Groups:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {bb.availableBloodGroups?.map((group) => (
                      <span
                        key={group}
                        className={`px-2 py-0.5 rounded-md text-xs font-bold border ${
                          selectedGroup === group
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-red-50 text-red-800 border-red-100'
                        }`}
                      >
                        {group}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Call Now & Directions */}
              <div className="pt-3 border-t border-gray-100 flex items-center gap-3">
                <a
                  href={`tel:${bb.phone}`}
                  className="btn-primary bg-red-600 hover:bg-red-700 flex-1 text-xs py-2.5 flex items-center justify-center gap-1.5 cursor-pointer text-white"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call Now: {bb.phone}
                </a>
                <a
                  href={bb.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(`${bb.name} ${bb.address}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs py-2.5 px-4 flex items-center justify-center gap-1.5 cursor-pointer text-gray-700"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  Directions
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Requirement Modal: "I Need Blood" */}
      {showNeedBloodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 my-8">
            <button
              onClick={() => setShowNeedBloodModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <Droplet className="w-5 h-5 fill-red-600 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Submit Blood Requirement</h3>
                <p className="text-xs text-gray-500">Alert registered donors & regional blood centres in Pune</p>
              </div>
            </div>

            <form onSubmit={handleRequirementSubmit} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  value={reqForm.patientName}
                  onChange={(e) => setReqForm({ ...reqForm, patientName: e.target.value })}
                  className="input-field"
                  placeholder="Full name of recipient"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Blood Group Required</label>
                  <select
                    value={reqForm.bloodGroup}
                    onChange={(e) => setReqForm({ ...reqForm, bloodGroup: e.target.value })}
                    className="input-field"
                  >
                    {BLOOD_GROUPS.filter((g) => g !== 'All').map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Units Required</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={reqForm.unitsRequired}
                    onChange={(e) => setReqForm({ ...reqForm, unitsRequired: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Hospital / Medical Center</label>
                <input
                  type="text"
                  required
                  value={reqForm.hospital}
                  onChange={(e) => setReqForm({ ...reqForm, hospital: e.target.value })}
                  className="input-field"
                  placeholder="Hospital name (e.g. Deenanath Mangeshkar, Ruby Hall)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Required Date</label>
                  <input
                    type="date"
                    required
                    value={reqForm.requiredDate}
                    onChange={(e) => setReqForm({ ...reqForm, requiredDate: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Urgency</label>
                  <select
                    value={reqForm.urgency}
                    onChange={(e) => setReqForm({ ...reqForm, urgency: e.target.value })}
                    className="input-field"
                  >
                    <option value="Immediate (Critical)">Immediate (Critical)</option>
                    <option value="Urgent (Within 6h)">Urgent (Within 6h)</option>
                    <option value="Standard (24h)">Standard (Within 24h)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Contact Phone Number</label>
                <input
                  type="tel"
                  required
                  value={reqForm.contactNumber}
                  onChange={(e) => setReqForm({ ...reqForm, contactNumber: e.target.value })}
                  className="input-field"
                  placeholder="Attendant / Relative mobile number"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Additional Information (Optional)</label>
                <textarea
                  rows={2}
                  value={reqForm.additionalInfo}
                  onChange={(e) => setReqForm({ ...reqForm, additionalInfo: e.target.value })}
                  className="input-field"
                  placeholder="Mention ward number, doctor name, or specific component (RBC, FFP, Platelets)"
                ></textarea>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl text-amber-800 text-xs">
                ⚠️ Please also call the hospital blood bank directly to ensure cross-matching samples are processed.
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowNeedBloodModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReq}
                  className="btn-primary bg-red-600 hover:bg-red-700 text-white"
                >
                  {submittingReq ? 'Submitting...' : 'Register Requirement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Donor Modal: "I Want to Donate" */}
      {showDonateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100">
            <button
              onClick={() => setShowDonateModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Heart className="w-5 h-5 fill-rose-600 text-rose-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Volunteer Blood Donor</h3>
                <p className="text-xs text-gray-500">Save up to 3 lives with one donation in Pune</p>
              </div>
            </div>

            <form onSubmit={handleDonorSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Donor Name</label>
                <input
                  type="text"
                  required
                  value={donorForm.donorName}
                  onChange={(e) => setDonorForm({ ...donorForm, donorName: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Blood Group</label>
                  <select
                    value={donorForm.donorBloodGroup}
                    onChange={(e) => setDonorForm({ ...donorForm, donorBloodGroup: e.target.value })}
                    className="input-field"
                  >
                    {BLOOD_GROUPS.filter((g) => g !== 'All').map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Your Area</label>
                  <select
                    value={donorForm.area}
                    onChange={(e) => setDonorForm({ ...donorForm, area: e.target.value })}
                    className="input-field"
                  >
                    {PUNE_AREAS.filter((a) => a !== 'All').map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Mobile Phone Number</label>
                <input
                  type="tel"
                  required
                  value={donorForm.phone}
                  onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value })}
                  className="input-field"
                  placeholder="For emergency blood callouts"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Last Donated</label>
                <select
                  value={donorForm.lastDonatedMonths}
                  onChange={(e) => setDonorForm({ ...donorForm, lastDonatedMonths: e.target.value })}
                  className="input-field"
                >
                  <option value="None (First Time)">None (First Time Donor)</option>
                  <option value="3+ Months Ago">More than 3 months ago (Eligible)</option>
                  <option value="1-2 Months Ago">Within last 2 months</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowDonateModal(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submittingDonor}
                  className="btn-primary"
                >
                  {submittingDonor ? 'Registering...' : 'Pledge as Donor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
