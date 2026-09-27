import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, isAuthenticated, loading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bloodGroup: 'O+',
    address: '',
    emergencyContact: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast('Please log in to view your profile.');
      navigate('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const data = await api.get('/profile');
        if (data.success && data.profile) {
          const p = data.profile;
          setFormData({
            firstName: p.firstName || (user?.name ? user.name.split(' ')[0] : ''),
            lastName: p.lastName || (user?.name ? user.name.split(' ').slice(1).join(' ') : ''),
            email: p.email || user?.email || '',
            phone: p.phone || user?.phone || '',
            bloodGroup: p.bloodGroup || 'O+',
            address: p.address || '',
            emergencyContact: p.emergencyContact || ''
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated, authLoading, navigate, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await api.put('/profile', formData);
      if (data.success) {
        toast.success('Profile updated successfully!');
        await refreshProfile();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const initials = `${(formData.firstName?.[0] || 'J')}${(formData.lastName?.[0] || 'D')}`.toUpperCase();
  const fullName = `${formData.firstName} ${formData.lastName}`.trim() || user?.name || 'Patient';
  const patientId = user?.id ? user.id.slice(-6).toUpperCase() : '847294';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Profile</h1>
      <div className="card p-8">
        <div className="flex items-center space-x-6 mb-8">
          <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-700 font-bold text-3xl">{initials}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{fullName}</h2>
            <p className="text-gray-500">Patient ID: #{patientId}</p>
          </div>
        </div>
        <hr className="mb-8" />
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
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
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="input-field"
              placeholder="Residential address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
            <input
              type="text"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              className="input-field"
              placeholder="Name & Contact number"
            />
          </div>
          <button
            type="submit"
            disabled={saving || loading}
            className="btn-primary cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}