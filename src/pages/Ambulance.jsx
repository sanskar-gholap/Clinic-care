import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Siren, Clock, MapPin, Phone, ShieldAlert, CheckCircle } from 'lucide-react';

export default function Ambulance() {
  const { user, profile } = useAuth();
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [emergencyType, setEmergencyType] = useState('Critical Medical Emergency');
  const [loading, setLoading] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);

  useEffect(() => {
    if (user) {
      setPatientName(user.name || '');
      setPhone(user.phone || profile?.phone || '');
      setPickupLocation(profile?.address || '');
    }
  }, [user, profile]);

  // Fetch active requests on mount
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const data = await api.get('/ambulance');
        if (data.success && data.requests?.length > 0) {
          const active = data.requests.find(r => r.status === 'Dispatching' || r.status === 'En Route');
          if (active) setActiveRequest(active);
        }
      } catch (err) {
        // guest or non-fatal
      }
    };
    fetchLatest();
  }, []);

  const handleDispatch = async (e) => {
    if (e) e.preventDefault();
    if (!patientName || !phone || !pickupLocation) {
      toast.error('Please provide name, phone, and pickup location for dispatch.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.post('/ambulance', {
        patientName,
        phone,
        pickupLocation,
        emergencyType
      });

      if (data.success) {
        toast.success('Ambulance Dispatched! Medical responders en route.');
        setActiveRequest(data.ambulance);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to dispatch ambulance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 min-h-[80vh]">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Ambulance Services</h1>

      {activeRequest && activeRequest.status !== 'Completed' && (
        <div className="card p-6 mb-8 border-2 border-red-500 bg-red-50/60 animate-pulse-subtle">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg">
                <Siren className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-red-900">Active Dispatch: {activeRequest.status}</h3>
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-200 text-red-800">
                    ETA: {activeRequest.eta || '8-10 mins'}
                  </span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  Responding Unit: <span className="font-semibold">{activeRequest.driverName}</span> • Destination: {activeRequest.pickupLocation}
                </p>
              </div>
            </div>
            <a
              href="tel:911"
              className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-700 shadow-md"
            >
              <Phone className="w-4 h-4" />
              Direct Emergency Line (911)
            </a>
          </div>
        </div>
      )}

      <div className="card p-10 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Emergency Dispatch</h2>
        <p className="text-gray-600 mb-8 max-w-xl mx-auto">
          Request an ambulance immediately to your current location. Our 24/7 telemetry-equipped emergency response units are on standby.
        </p>

        <form onSubmit={handleDispatch} className="max-w-xl mx-auto text-left space-y-4 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Patient Name</label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="input-field"
                placeholder="Patient / Caller Name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Contact Phone</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
                placeholder="Phone number"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Pickup Address / Location</label>
            <input
              type="text"
              required
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className="input-field"
              placeholder="Full address, landmark, or current location"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Emergency Nature</label>
            <select
              value={emergencyType}
              onChange={(e) => setEmergencyType(e.target.value)}
              className="input-field"
            >
              <option value="Critical Medical Emergency">Critical Medical Emergency</option>
              <option value="Cardiac / Chest Pain">Cardiac / Severe Chest Pain</option>
              <option value="Severe Trauma / Accident">Severe Trauma / Accident</option>
              <option value="Respiratory Distress">Respiratory Distress / Breathing Difficulty</option>
              <option value="Maternity Emergency">Maternity Emergency</option>
            </select>
          </div>

          <div className="pt-4 text-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full shadow-lg text-xl transition-transform hover:scale-105 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Dispatching Emergency Unit...' : 'Call Ambulance Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}