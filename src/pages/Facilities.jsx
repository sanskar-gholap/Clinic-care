import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Building2, MapPin, Phone, Star, Bed, Activity, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Facilities() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [activeFacility, setActiveFacility] = useState(null);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      let query = '';
      const params = new URLSearchParams();
      if (selectedType !== 'All') params.append('type', selectedType);
      if (search) params.append('search', search);
      if (params.toString()) query = `?${params.toString()}`;

      const data = await api.get(`/facilities${query}`);
      if (data.success) {
        setFacilities(data.facilities || []);
      }
    } catch (err) {
      toast.error('Failed to load healthcare facilities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [selectedType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFacilities();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 min-h-[80vh]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Healthcare Facilities</h1>
          <p className="text-gray-500 text-sm mt-1">Accredited clinics, general hospitals, and specialized trauma centers</p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2">
          {['All', 'Hospital', 'Clinic', 'Diagnostics', 'Specialty Center'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedType === type
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="mb-8 flex gap-3 max-w-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search facility name, address, or specialty..."
            className="input-field pl-9"
          />
        </div>
        <button type="submit" className="btn-primary py-2 px-4 text-sm">
          Search
        </button>
      </form>

      {/* Facilities Grid */}
      {loading ? (
        <div className="card p-12 text-center text-gray-500">Loading facilities...</div>
      ) : facilities.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">No healthcare facilities found matching your criteria.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((fac) => (
            <div key={fac._id} className="card p-6 hover:shadow-md transition-shadow flex flex-col justify-between border border-gray-100">
              <div>
                <div className="h-44 bg-gray-100 rounded-xl mb-4 overflow-hidden relative">
                  <img
                    src={fac.image || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=800'}
                    alt={fac.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-gray-800 flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {fac.rating || 4.8}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-gray-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-md text-xs font-medium">
                    {fac.type}
                  </div>
                </div>

                <h3 className="font-bold text-lg text-gray-900 mb-1">{fac.name}</h3>
                <p className="text-gray-500 text-xs flex items-center gap-1.5 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{fac.address}, {fac.city}</span>
                </p>
                <p className="text-gray-500 text-xs flex items-center gap-1.5 mb-4">
                  <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>{fac.phone}</span>
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {fac.specialties?.slice(0, 3).map((s, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-700 text-[11px] px-2 py-0.5 rounded">
                      {s}
                    </span>
                  ))}
                  {fac.specialties?.length > 3 && (
                    <span className="bg-gray-100 text-gray-500 text-[11px] px-1.5 py-0.5 rounded">
                      +{fac.specialties.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-gray-500 py-2 border-t border-gray-100 mb-3">
                  <span className="flex items-center gap-1">
                    <Bed className="w-3.5 h-3.5 text-primary-600" />
                    {fac.availableBeds} beds free
                  </span>
                  <span className="font-medium text-emerald-600">{fac.openHours}</span>
                </div>
                <button
                  onClick={() => setActiveFacility(fac)}
                  className="btn-secondary w-full cursor-pointer text-sm"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {activeFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveFacility(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="h-48 rounded-2xl overflow-hidden mb-4">
              <img
                src={activeFacility.image}
                alt={activeFacility.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 bg-primary-50 text-primary-700 font-semibold rounded-full text-xs">
                {activeFacility.type}
              </span>
              <span className="flex items-center gap-1 font-bold text-sm text-gray-800">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {activeFacility.rating}
              </span>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">{activeFacility.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{activeFacility.address}, {activeFacility.city} ({activeFacility.pincode})</p>

            <div className="grid grid-cols-2 gap-3 mb-6 bg-gray-50 p-4 rounded-2xl">
              <div>
                <span className="text-xs text-gray-500 block">Contact Phone</span>
                <span className="text-sm font-semibold text-gray-900">{activeFacility.phone}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Operating Hours</span>
                <span className="text-sm font-semibold text-gray-900">{activeFacility.openHours}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Bed Capacity</span>
                <span className="text-sm font-semibold text-emerald-700">{activeFacility.availableBeds} Ready Beds</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Departments & Specialties</h4>
              <div className="flex flex-wrap gap-2">
                {activeFacility.specialties?.map((s, i) => (
                  <span key={i} className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                to="/book-appointment"
                className="btn-primary flex-1 text-center py-2.5"
                onClick={() => setActiveFacility(null)}
              >
                Book Appointment
              </Link>
              <Link
                to="/blood-search"
                className="btn-secondary flex-1 text-center py-2.5"
                onClick={() => setActiveFacility(null)}
              >
                Check Blood Stock
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}