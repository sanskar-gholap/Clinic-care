import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Calendar, Clock, User, AlertCircle } from 'lucide-react';

export default function Appointments() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const data = await api.get('/appointments');
      if (data.success) {
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast('Please log in to view your appointments.');
      navigate('/login');
      return;
    }
    if (isAuthenticated) {
      fetchAppointments();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const data = await api.patch(`/appointments/${id}/status`, { status: 'Cancelled' });
      if (data.success) {
        toast.success('Appointment cancelled successfully.');
        fetchAppointments();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to cancel appointment.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 min-h-[80vh]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and track your clinic visits</p>
        </div>
        <Link to="/book-appointment" className="btn-primary">
          Book New
        </Link>
      </div>

      {loading ? (
        <div className="card p-12 text-center text-gray-500">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="card">
          <div className="p-6 text-center py-16">
            <p className="text-gray-500 mb-4">You don't have any appointments scheduled.</p>
            <Link to="/book-appointment" className="btn-secondary">
              Schedule an Appointment
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {appointments.map((appt) => (
            <div key={appt._id} className="card p-6 flex flex-col justify-between hover:shadow-md transition-shadow border border-gray-100">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 bg-primary-50 px-2.5 py-1 rounded-md">
                      {appt.specialty}
                    </span>
                    <h3 className="font-bold text-lg text-gray-900 mt-2">{appt.doctorName}</h3>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(appt.status)}`}>
                    {appt.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{appt.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{appt.time}</span>
                  </div>
                  {appt.reason && (
                    <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg mt-2 italic">
                      "{appt.reason}"
                    </p>
                  )}
                </div>
              </div>

              {appt.status !== 'Cancelled' && appt.status !== 'Completed' && (
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => handleCancel(appt._id)}
                    className="text-xs font-medium text-red-600 hover:text-red-800 hover:underline cursor-pointer"
                  >
                    Cancel Appointment
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}