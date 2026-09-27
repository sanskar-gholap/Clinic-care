import React, { useState, useEffect } from 'react';
import {
  Eye,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  Navigation,
  Search,
  Calendar,
  Star,
  ExternalLink,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const EYE_CATEGORIES = [
  'All',
  'Eye Testing',
  'Cataract',
  'Glaucoma',
  'Retina',
  'LASIK',
  'Cornea',
  'Pediatric Eye Care',
  'Diabetic Eye Care',
  'Emergency Eye Care',
  'Eye Donation'
];

const PUNE_AREAS = ['All', 'Hadapsar', 'Shivajinagar', 'Deccan', 'Kothrud', 'Aundh', 'Baner', 'Chinchwad'];

export default function EyeCare() {
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedArea, setSelectedArea] = useState('All');

  const navigate = useNavigate();

  const fetchCentres = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedArea !== 'All') params.append('area', selectedArea);

      const data = await api.get(`/eye-care?${params.toString()}`);
      if (data.success) {
        setCentres(data.eyeCentres || []);
      }
    } catch (err) {
      console.error('Fetch eye care error:', err);
      toast.error('Failed to load eye care directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCentres();
  }, [selectedCategory, selectedArea]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 min-h-[85vh]">
      {/* Header Banner */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                👁️ Vision & Ophthalmology
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Accredited Eye Institutes
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Pune Eye Care & Vision Directory
            </h1>
            <p className="text-gray-500 text-sm mt-1 max-w-2xl">
              Find verified eye hospitals, cataract clinics, LASIK surgery centres, and emergency eye trauma units across Pune.
            </p>
          </div>

          <div>
            <Link
              to="/book-appointment"
              className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Book Eye Consultation
            </Link>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="mb-6 overflow-x-auto pb-2 no-scrollbar">
        <div className="flex gap-2">
          {EYE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200'
              }`}
            >
              {cat === 'All' ? 'All Eye Specialities' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Area Filter */}
      <div className="card p-5 mb-8 bg-white border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search eye clinics, doctors, cataract, LASIK or cornea treatment..."
            className="input-field pl-10 text-xs sm:text-sm"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="input-field text-xs sm:text-sm py-2.5"
          >
            {PUNE_AREAS.map((a) => (
              <option key={a} value={a}>
                {a === 'All' ? 'All Pune Localities' : a}
              </option>
            ))}
          </select>
        </div>
        <button onClick={fetchCentres} className="btn-primary py-2.5 px-6 whitespace-nowrap cursor-pointer text-xs sm:text-sm">
          Filter
        </button>
      </div>

      {/* Eye Centres Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-6 border border-gray-100 animate-pulse space-y-3">
              <div className="h-40 bg-gray-200 rounded-xl"></div>
              <div className="h-6 bg-gray-200 rounded-md w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
            </div>
          ))}
        </div>
      ) : centres.length === 0 ? (
        <div className="card p-12 text-center border border-gray-100">
          <Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No eye clinics found</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
            Try choosing another eye care category or clear your search terms.
          </p>
          <button
            onClick={() => { setSearch(''); setSelectedCategory('All'); setSelectedArea('All'); }}
            className="btn-secondary text-sm"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {centres.map((item) => (
            <div
              key={item._id}
              className="card p-6 border border-gray-100 hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200 inline-block mb-1">
                      📍 {item.area}
                    </span>
                    <h3 className="font-bold text-xl text-gray-900 leading-snug group-hover:text-teal-700 transition-colors">
                      {item.name}
                    </h3>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-gray-800 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {item.rating || 4.8}
                  </span>
                </div>

                {item.isVerified && (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mb-3 border border-emerald-100">
                    <ShieldCheck className="w-3.5 h-3.5 inline text-emerald-600" />
                    ✓ Verified Eye Hospital
                  </div>
                )}

                {/* Address */}
                <p className="text-gray-600 text-xs mb-3 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                  <span>{item.address}</span>
                </p>

                {/* Opening Hours & Phone */}
                <div className="space-y-1 text-xs text-gray-700 mb-4 bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="font-medium text-gray-700">{item.openingHours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                    <a href={`tel:${item.phone}`} className="font-bold text-primary-700 hover:underline">
                      {item.phone}
                    </a>
                  </div>
                </div>

                {/* Services list */}
                <div className="mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
                    Procedures & Treatments:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {item.categories?.slice(0, 4).map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-100">
                        {c}
                      </span>
                    ))}
                    {item.categories?.length > 4 && (
                      <span className="px-1.5 py-0.5 rounded-md text-[11px] text-gray-500 bg-gray-100">
                        +{item.categories.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${item.phone}`}
                    className="btn-secondary text-xs py-2 px-3 flex-1 flex items-center justify-center gap-1.5 text-gray-700 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    Call Clinic
                  </a>
                  <a
                    href={item.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(`${item.name} ${item.address}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-xs py-2 px-3 flex-1 flex items-center justify-center gap-1.5 text-gray-700 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    Directions
                  </a>
                </div>
                <Link
                  to="/book-appointment"
                  className="btn-primary w-full text-xs py-2 text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Book Appointment
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
