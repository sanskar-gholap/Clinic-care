import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  ShieldCheck,
  Clock,
  ExternalLink,
  Navigation,
  Search,
  Filter,
  AlertCircle,
  Activity,
  Bed,
  Star,
  X
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const PUNE_AREAS = [
  'All',
  'Shivajinagar',
  'Kothrud',
  'Baner',
  'Aundh',
  'Hadapsar',
  'Kharadi',
  'Pimpri',
  'Chinchwad',
  'Nigdi',
  'Deccan',
  'Hinjewadi',
  'Sadashiv Peth',
  'Rasta Peth',
  'Wanowrie',
  'Katraj',
  'Warje'
];

const HOSPITAL_TYPES = [
  'All',
  'Multispeciality',
  'Government',
  'Speciality',
  'Eye Hospital',
  "Children's Hospital",
  "Women's Hospital",
  'Private'
];

const KEY_DEPARTMENTS = [
  'All',
  'Cardiology',
  'Orthopedics',
  'Neurology',
  'Oncology',
  'Pediatrics',
  'Trauma',
  'Obstetrics',
  'General Surgery'
];

export default function Hospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedArea, setSelectedArea] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [activeHospital, setActiveHospital] = useState(null);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (selectedArea !== 'All') params.append('area', selectedArea);
      if (selectedType !== 'All') params.append('type', selectedType);
      if (selectedDept !== 'All') params.append('department', selectedDept);
      if (emergencyOnly) params.append('emergency', 'true');

      const data = await api.get(`/hospitals?${params.toString()}`);
      if (data.success) {
        setHospitals(data.hospitals || []);
      }
    } catch (err) {
      console.error('Fetch hospitals error:', err);
      toast.error('Failed to load Pune hospitals directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [selectedArea, selectedType, selectedDept, emergencyOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHospitals();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedArea('All');
    setSelectedType('All');
    setSelectedDept('All');
    setEmergencyOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 min-h-[85vh]">
      {/* Header Banner */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-blue-50 text-blue-700 border border-blue-200">
                📍 Pune & Pimpri-Chinchwad
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Directory
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Pune Hospital Directory
            </h1>
            <p className="text-gray-500 text-sm mt-1 max-w-2xl">
              Access 30+ verified multi-speciality, tertiary, and emergency hospitals across Pune & PCMC with authentic contact details and departments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-2xs">
              Showing <span className="text-primary-600 font-bold">{hospitals.length}</span> Hospitals
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="card p-5 mb-8 bg-white border border-gray-100 shadow-sm space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hospitals, areas or departments (e.g. Kothrud, Ruby Hall, Cardiology)..."
              className="input-field pl-10"
            />
          </div>
          <button type="submit" className="btn-primary py-2.5 px-6 whitespace-nowrap cursor-pointer">
            Search Directory
          </button>
        </form>

        {/* Filter Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-gray-100 text-xs">
          {/* Location Area Filter */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Area / Locality</label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="input-field text-xs py-2"
            >
              {PUNE_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area === 'All' ? 'All Pune & PCMC Areas' : area}
                </option>
              ))}
            </select>
          </div>

          {/* Hospital Type Filter */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Hospital Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input-field text-xs py-2"
            >
              {HOSPITAL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === 'All' ? 'All Hospital Types' : t}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Specialty Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="input-field text-xs py-2"
            >
              {KEY_DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Departments' : d}
                </option>
              ))}
            </select>
          </div>

          {/* Emergency Toggle & Reset */}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => setEmergencyOnly(!emergencyOnly)}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                emergencyOnly
                  ? 'bg-red-500 text-white border-red-500 shadow-sm'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-700'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              24/7 Emergency
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="py-2 px-3 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50 text-xs font-medium cursor-pointer"
              title="Reset Filters"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Hospital Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-6 border border-gray-100 animate-pulse space-y-4">
              <div className="h-44 bg-gray-200 rounded-xl"></div>
              <div className="h-5 bg-gray-200 rounded-md w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded-md w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : hospitals.length === 0 ? (
        <div className="card p-12 text-center border border-gray-100">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No matching hospitals found</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
            We couldn't find any hospitals matching your current search or area filters in Pune.
          </p>
          <button onClick={handleResetFilters} className="btn-secondary text-sm">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map((hosp) => (
            <div
              key={hosp._id}
              className="card p-5 hover:shadow-lg transition-all border border-gray-100 flex flex-col justify-between group"
            >
              <div>
                {/* Hospital Image & Status Badges */}
                <div className="h-44 bg-gray-100 rounded-xl mb-4 overflow-hidden relative">
                  <img
                    src={hosp.image || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=800'}
                    alt={hosp.name}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {hosp.emergencyAvailable && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-600/90 text-white backdrop-blur-xs shadow-sm flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        24/7 Emergency
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-900/80 text-white backdrop-blur-xs">
                      {hosp.type}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-gray-800 flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {hosp.rating || 4.8}
                  </div>

                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-800 flex items-center gap-1 shadow-sm">
                    <MapPin className="w-3.5 h-3.5 text-primary-600" />
                    {hosp.area}
                  </div>
                </div>

                {/* Name & Verification Badge */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="font-bold text-lg text-gray-900 leading-snug group-hover:text-primary-600 transition-colors">
                    {hosp.name}
                  </h3>
                </div>

                {hosp.isVerified && (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mb-3 border border-emerald-100">
                    <ShieldCheck className="w-3.5 h-3.5 inline text-emerald-600" />
                    ✓ Verified by ClinicCare
                  </div>
                )}

                {/* Address */}
                <p className="text-gray-600 text-xs leading-relaxed mb-3 line-clamp-2">
                  {hosp.address}
                </p>

                {/* Phone & Hours */}
                <div className="space-y-1.5 text-xs text-gray-700 mb-4 bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                    <a href={`tel:${hosp.phone}`} className="font-semibold text-gray-800 hover:text-primary-600">
                      {hosp.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{hosp.openingHours}</span>
                  </div>
                </div>

                {/* Departments pills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {hosp.departments?.slice(0, 3).map((dept, idx) => (
                    <span key={idx} className="bg-blue-50 text-blue-700 text-[11px] font-medium px-2 py-0.5 rounded-md border border-blue-100">
                      {dept}
                    </span>
                  ))}
                  {hosp.departments?.length > 3 && (
                    <span className="bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-0.5 rounded-md">
                      +{hosp.departments.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                <a
                  href={hosp.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(`${hosp.name} ${hosp.address}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs py-2 px-3 flex-1 flex items-center justify-center gap-1.5 cursor-pointer text-gray-700"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  Google Maps
                </a>
                <button
                  onClick={() => setActiveHospital(hosp)}
                  className="btn-primary text-xs py-2 px-4 flex-1 text-center cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hospital Detail Modal */}
      {activeHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 max-h-[92vh] overflow-y-auto border border-gray-100">
            <button
              onClick={() => setActiveHospital(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Image */}
            <div className="h-56 rounded-2xl overflow-hidden mb-6 relative">
              <img
                src={activeHospital.image}
                alt={activeHospital.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-900/80 text-white backdrop-blur-xs">
                  {activeHospital.type}
                </span>
                {activeHospital.emergencyAvailable && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white">
                    🚨 24/7 Emergency
                  </span>
                )}
              </div>
            </div>

            {/* Modal Info */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{activeHospital.name}</h3>
                <p className="text-sm font-semibold text-primary-600 flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  {activeHospital.area}, Pune
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 block">Rating</span>
                <span className="text-lg font-bold text-gray-900 flex items-center gap-1 justify-end">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {activeHospital.rating}
                </span>
              </div>
            </div>

            {activeHospital.isVerified && (
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 mb-4">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {activeHospital.verificationNote || 'Verified by ClinicCare Healthcare Verification Team'}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div>
                <span className="text-xs text-gray-500 block">Primary Contact</span>
                <a href={`tel:${activeHospital.phone}`} className="text-sm font-bold text-primary-700">
                  {activeHospital.phone}
                </a>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Emergency Helpline</span>
                <span className="text-sm font-bold text-red-600">
                  {activeHospital.emergencyPhone || activeHospital.phone}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Bed Capacity</span>
                <span className="text-sm font-bold text-gray-800 flex items-center gap-1">
                  <Bed className="w-4 h-4 text-gray-500" />
                  {activeHospital.bedCount || 150} Beds
                </span>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Full Address</h4>
              <p className="text-sm text-gray-700">{activeHospital.address}</p>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Departments & Clinical Specialities</h4>
              <div className="flex flex-wrap gap-2">
                {activeHospital.departments?.map((dept, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-50 text-blue-800 rounded-lg text-xs font-semibold border border-blue-100">
                    {dept}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
              <a
                href={activeHospital.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(`${activeHospital.name} ${activeHospital.address}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex-1 text-center py-2.5 flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Get Directions on Google Maps
              </a>
              {activeHospital.website && (
                <a
                  href={activeHospital.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex-1 text-center py-2.5 flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit Official Website
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
