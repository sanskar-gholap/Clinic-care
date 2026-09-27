import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Droplet, MapPin, Phone, Building, CheckCircle, AlertTriangle, PlusCircle } from 'lucide-react';

export default function BloodSearch() {
  const { user, profile } = useAuth();
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Blood Requisition Form state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqPatientName, setReqPatientName] = useState('');
  const [reqBloodGroup, setReqBloodGroup] = useState('O+');
  const [reqUnits, setReqUnits] = useState(1);
  const [reqHospital, setReqHospital] = useState('');
  const [reqPhone, setReqPhone] = useState('');
  const [submittingReq, setSubmittingReq] = useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const data = await api.get(`/blood/search?bloodGroup=${encodeURIComponent(bloodGroup)}&location=${encodeURIComponent(location)}`);
      if (data.success) {
        setResults(data.results || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to search blood inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const openRequisition = (facilityName = '') => {
    setReqPatientName(user?.name || '');
    setReqPhone(user?.phone || profile?.phone || '');
    setReqBloodGroup(bloodGroup);
    setReqHospital(facilityName || 'City General Hospital');
    setShowRequestModal(true);
  };

  const handleRequisitionSubmit = async (e) => {
    e.preventDefault();
    if (!reqPatientName || !reqPhone || !reqHospital) {
      toast.error('Please complete all required fields.');
      return;
    }

    setSubmittingReq(true);
    try {
      const data = await api.post('/blood/request', {
        patientName: reqPatientName,
        bloodGroup: reqBloodGroup,
        units: Number(reqUnits),
        hospital: reqHospital,
        contactPhone: reqPhone,
        urgency: 'Immediate (Critical)'
      });

      if (data.success) {
        toast.success(`Requisition for ${reqUnits} unit(s) of ${reqBloodGroup} registered successfully!`);
        setShowRequestModal(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit blood request.');
    } finally {
      setSubmittingReq(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 min-h-[80vh]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blood Availability Search</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time donor inventory across regional medical centers</p>
        </div>
        <button
          onClick={() => openRequisition()}
          className="btn-primary flex items-center gap-2 self-start cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Request Urgent Blood
        </button>
      </div>

      <div className="card p-6 mb-8 bg-gradient-to-r from-red-50 to-white border border-red-100">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="input-field"
            >
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Location / Pincode</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input-field"
              placeholder="Enter city, address or pincode (e.g. Metropolis)"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full md:w-auto cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Available Units for {bloodGroup} ({results.length} centers found)
        </h2>

        {loading ? (
          <div className="card p-12 text-center text-gray-500">Scanning inventory databases...</div>
        ) : results.length === 0 ? (
          <div className="card p-12 text-center text-gray-500">
            No blood banks found matching the criteria. Click "Request Urgent Blood" above to place a priority requisition.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((item) => (
              <div key={item.facilityId} className="card p-6 flex flex-col justify-between hover:shadow-md transition-shadow border border-gray-100">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                      <Droplet className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                      {bloodGroup}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                        item.totalUnitsAvailable > 5
                          ? 'bg-green-100 text-green-800'
                          : item.totalUnitsAvailable > 0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.totalUnitsAvailable} units available
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-gray-900 mb-1">{item.facilityName}</h3>
                  <p className="text-gray-500 text-xs flex items-center gap-1.5 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {item.address}, {item.city} ({item.pincode})
                  </p>
                  <p className="text-gray-500 text-xs flex items-center gap-1.5 mb-4">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    {item.phone}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">{item.openHours}</span>
                  <button
                    onClick={() => openRequisition(item.facilityName)}
                    className="btn-secondary text-xs py-1.5 px-3 cursor-pointer"
                  >
                    Reserve Units
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Requisition Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Urgent Blood Requisition</h3>
            <form onSubmit={handleRequisitionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  value={reqPatientName}
                  onChange={(e) => setReqPatientName(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Blood Group</label>
                  <select
                    value={reqBloodGroup}
                    onChange={(e) => setReqBloodGroup(e.target.value)}
                    className="input-field"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Units Needed</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={reqUnits}
                    onChange={(e) => setReqUnits(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Target Hospital / Clinic</label>
                <input
                  type="text"
                  required
                  value={reqHospital}
                  onChange={(e) => setReqHospital(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={reqPhone}
                  onChange={(e) => setReqPhone(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReq}
                  className="btn-primary"
                >
                  {submittingReq ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}