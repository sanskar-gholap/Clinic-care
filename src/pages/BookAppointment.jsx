import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function BookAppointment() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [specialty, setSpecialty] = useState('General Practice');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in to book an appointment.');
      navigate('/login');
      return;
    }

    if (!date || !time) {
      toast.error('Please select an appointment date and time.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.post('/appointments', {
        specialty,
        date,
        time,
        reason
      });

      if (data.success) {
        toast.success('Appointment booked successfully! Status: Pending confirmation.');
        navigate('/appointments');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to book appointment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Book an Appointment</h1>
      <div className="card p-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="input-field"
            >
              <option value="General Practice">General Practice</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Neurology">Neurology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Orthopedics">Orthopedics</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for visit</label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-field"
              placeholder="Describe symptoms or reasons for visit..."
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}