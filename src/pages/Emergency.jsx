import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Siren, Phone, AlertCircle, ShieldAlert, ArrowRight } from 'lucide-react';

export default function Emergency() {
  const { user, profile } = useAuth();
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchEmergencyStatus = async () => {
    try {
      const data = await api.get('/ambulance');
      if (data.success && data.requests?.length > 0) {
        const active = data.requests.find((r) => r.status === 'Dispatching' || r.status === 'En Route');
        setActiveEmergency(active || data.requests[0]);
      }
    } catch (err) {
      // not logged in or no records
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencyStatus();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 min-h-[80vh]">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Emergency Requests</h1>

      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-xl">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700 font-medium">
              If you are experiencing a life-threatening medical emergency, call 911 immediately.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 border border-red-100 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <Siren className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">Ambulance Dispatch</h3>
            <p className="text-gray-500 text-xs mb-4">Instant location telemetry dispatch</p>
          </div>
          <Link to="/ambulance" className="btn-primary bg-red-600 hover:bg-red-700 text-center py-2 text-sm">
            Request Dispatch
          </Link>
        </div>

        <div className="card p-6 border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mb-3">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">24/7 Helpline</h3>
            <p className="text-gray-500 text-xs mb-4">Direct medical triage hotline</p>
          </div>
          <a href="tel:18005550199" className="btn-secondary text-center py-2 text-sm">
            Call 1-800-555-0199
          </a>
        </div>

        <div className="card p-6 border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">Blood Requisition</h3>
            <p className="text-gray-500 text-xs mb-4">Find compatible emergency units</p>
          </div>
          <Link to="/blood-search" className="btn-secondary text-center py-2 text-sm">
            Check Blood Bank
          </Link>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-medium text-lg mb-4">Current Emergency Status</h3>
        {loading ? (
          <p className="text-gray-500 text-sm">Checking emergency logs...</p>
        ) : activeEmergency ? (
          <div className="bg-red-50/70 border border-red-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-red-900 text-base">Request #{activeEmergency._id.slice(-6).toUpperCase()}</span>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-200 text-red-800">
                  {activeEmergency.status}
                </span>
              </div>
              <p className="text-sm text-red-700">
                Responding Crew: <span className="font-semibold">{activeEmergency.driverName}</span> • ETA: {activeEmergency.eta}
              </p>
              <p className="text-xs text-red-600 mt-1">
                Location: {activeEmergency.pickupLocation}
              </p>
            </div>
            <Link
              to="/ambulance"
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-sm"
            >
              Track Live Dispatch
            </Link>
          </div>
        ) : (
          <p className="text-gray-500">No active emergency requests.</p>
        )}
      </div>
    </div>
  );
}