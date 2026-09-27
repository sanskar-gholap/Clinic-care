import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Droplet, 
  Eye, 
  Smile, 
  FlaskConical, 
  Stethoscope, 
  Truck, 
  Pill, 
  Brain, 
  Baby, 
  HeartPulse, 
  Activity, 
  HeartHandshake,
  Search,
  MapPin,
  CheckCircle,
  ArrowRight,
  ShieldAlert,
  PhoneCall
} from 'lucide-react';

const CATEGORIES = [
  {
    id: 'hospitals',
    title: 'Hospitals',
    subtitle: '30+ Verified Hospitals in Pune & PCMC',
    icon: Building2,
    emoji: '🏥',
    color: 'from-blue-600 to-indigo-700',
    borderHover: 'hover:border-blue-400',
    link: '/hospitals',
    badge: '30 Listed',
    description: 'Government, Multispeciality, Private and Super-speciality hospitals with emergency ICU and OT facilities.'
  },
  {
    id: 'blood-banks',
    title: 'Blood Banks',
    subtitle: 'Verified Pune Donation Centres',
    icon: Droplet,
    emoji: '🩸',
    color: 'from-rose-600 to-red-700',
    borderHover: 'hover:border-rose-400',
    link: '/blood-banks',
    badge: '24/7 Available',
    description: 'Blood donation centres, voluntary drives, and emergency component availability across Pune & PCMC.'
  },
  {
    id: 'eye-care',
    title: 'Eye Care',
    subtitle: 'Specialised Eye Clinics & Hospitals',
    icon: Eye,
    emoji: '👁️',
    color: 'from-cyan-600 to-teal-700',
    borderHover: 'hover:border-cyan-400',
    link: '/eye-care',
    badge: 'Expert Surgeons',
    description: 'Cataract, LASIK, Glaucoma, Cornea, Retina, Pediatric Eye Care, and 24/7 Ocular Emergency services.'
  },
  {
    id: 'dental',
    title: 'Dental Clinics',
    subtitle: 'Orthodontics, Implants & Surgery',
    icon: Smile,
    emoji: '🦷',
    color: 'from-amber-600 to-orange-700',
    borderHover: 'hover:border-amber-400',
    link: '/hospitals?department=Dentistry',
    badge: 'Oral Care',
    description: 'Root canals, cosmetic dentistry, orthodontics, oral maxilla surgery, and pediatric dental solutions.'
  },
  {
    id: 'diagnostic',
    title: 'Diagnostic Centres',
    subtitle: 'Pathology Labs, MRI, CT & X-Ray',
    icon: FlaskConical,
    emoji: '🧪',
    color: 'from-emerald-600 to-green-700',
    borderHover: 'hover:border-emerald-400',
    link: '/facilities?category=diagnostic',
    badge: 'NABL Certified',
    description: 'Advanced pathology, blood tests, digital radiology, ultrasound, MRI 3T, and preventive health checks.'
  },
  {
    id: 'clinics',
    title: 'Clinics & Polyclinics',
    subtitle: 'Outpatient Consultations & Family Care',
    icon: Stethoscope,
    emoji: '👨⚕️',
    color: 'from-violet-600 to-purple-700',
    borderHover: 'hover:border-violet-400',
    link: '/facilities?category=clinic',
    badge: 'Walk-ins Welcome',
    description: 'General physicians, primary care, follow-up evaluations, and localized neighborhood healthcare clinics.'
  },
  {
    id: 'ambulance',
    title: 'Ambulance Services',
    subtitle: 'Emergency ICU & Basic Life Support',
    icon: Truck,
    emoji: '🚑',
    color: 'from-red-600 to-amber-700',
    borderHover: 'hover:border-red-400',
    link: '/ambulance',
    badge: 'Instant Dispatch',
    description: 'Rapid emergency ambulance fleet, cardiac support, oxygen-fitted units, and ventilator-equipped transport.'
  },
  {
    id: 'pharmacies',
    title: 'Pharmacies',
    subtitle: '24-Hour Medicine Stores',
    icon: Pill,
    emoji: '💊',
    color: 'from-lime-600 to-emerald-700',
    borderHover: 'hover:border-lime-400',
    link: '/facilities?category=pharmacy',
    badge: '24/7 Chemist',
    description: 'Licensed prescription dispensaries, emergency medicines, home delivery, and critical care drug stores.'
  },
  {
    id: 'mental-health',
    title: 'Mental Health',
    subtitle: 'Psychiatrists & Clinical Psychologists',
    icon: Brain,
    emoji: '🧠',
    color: 'from-indigo-600 to-fuchsia-700',
    borderHover: 'hover:border-indigo-400',
    link: '/hospitals?department=Psychiatry',
    badge: 'Confidential',
    description: 'Mental wellness consultations, depression/anxiety therapy, neuro-psychiatry, and counseling centers.'
  },
  {
    id: 'child-care',
    title: 'Child Care (Pediatrics)',
    subtitle: 'Pediatric Hospitals & Neonatal Care',
    icon: Baby,
    emoji: '👶',
    color: 'from-pink-600 to-rose-700',
    borderHover: 'hover:border-pink-400',
    link: "/hospitals?type=Children's Hospital",
    badge: 'NICU / PICU',
    description: 'Specialized infant care, vaccinations, pediatric surgery, developmental assessments, and child wellness.'
  },
  {
    id: 'cardiology',
    title: 'Cardiology',
    subtitle: 'Heart Care & Cardiac Cath Labs',
    icon: HeartPulse,
    emoji: '❤️',
    color: 'from-red-600 to-pink-700',
    borderHover: 'hover:border-red-400',
    link: '/hospitals?department=Cardiology',
    badge: 'Cath Lab Ready',
    description: '24/7 Chest pain triage, primary angioplasty, cardiac bypass, heart rhythm management, and recovery.'
  },
  {
    id: 'orthopedic',
    title: 'Orthopedic Care',
    subtitle: 'Bone, Joint & Trauma Care',
    icon: Activity,
    emoji: '🦴',
    color: 'from-amber-600 to-yellow-700',
    borderHover: 'hover:border-amber-400',
    link: '/hospitals?department=Orthopedics',
    badge: 'Joint Replacement',
    description: 'Robotic joint replacement, spine surgery, arthroscopy, sports injury rehabilitation, and trauma care.'
  },
  {
    id: 'womens-health',
    title: "Women's Health",
    subtitle: 'Maternity, Gynecology & Obstetrics',
    icon: HeartHandshake,
    emoji: '👩',
    color: 'from-rose-500 to-pink-600',
    borderHover: 'hover:border-rose-400',
    link: "/hospitals?type=Women's Hospital",
    badge: 'Maternity Suites',
    description: 'High-risk obstetrics, painless labor, IVF/fertility care, gynecological laparoscopy, and wellness.'
  }
];

export default function HealthcareDirectory() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = CATEGORIES.filter(cat => 
    cat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase mb-4 border border-blue-100 shadow-xs">
            <MapPin className="w-3.5 h-3.5" />
            Pune & PCMC Comprehensive Medical Portal
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Pune Healthcare Directory
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Access verified hospitals, blood banks, eye care facilities, clinics, and emergency medical services across Pune with real contact details and directions.
          </p>

          {/* Quick Search */}
          <div className="mt-8 relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search services (e.g., Cardiology, Blood Banks, Eye Care, Maternity)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 text-sm sm:text-base placeholder-slate-400 transition"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded-md"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Emergency Fast Access Banner */}
        <div className="bg-linear-to-r from-red-600 via-rose-600 to-amber-600 text-white rounded-2xl p-4 sm:p-6 mb-12 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl shrink-0">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">24/7 Pune Emergency Helplines</h2>
              <p className="text-xs sm:text-sm text-red-100">National Ambulance: <strong className="text-white">108</strong> • Blood Helpline: <strong className="text-white">104</strong> • Emergency Police/Fire/Medical: <strong className="text-white">112</strong></p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a 
              href="tel:108"
              className="px-4 py-2 bg-white text-red-700 hover:bg-red-50 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition shadow-sm"
            >
              <PhoneCall className="w-4 h-4" />
              Call 108 Ambulance
            </a>
            <Link 
              to="/emergency"
              className="px-4 py-2 bg-red-800/80 hover:bg-red-800 text-white font-semibold rounded-xl text-xs sm:text-sm transition"
            >
              Emergency Guide
            </Link>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                to={category.link}
                className={`group relative bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between ${category.borderHover}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-linear-to-tr ${category.color} flex items-center justify-center text-white text-xl shadow-md group-hover:scale-105 transition-transform`}>
                        <span className="sr-only">{category.title}</span>
                        <span>{category.emoji}</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {category.title}
                        </h2>
                        <span className="text-xs text-slate-500 font-medium">
                          {category.subtitle}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {category.badge}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed mb-6">
                    {category.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                  <span className="flex items-center gap-1.5 text-slate-500 font-normal">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    Verified Listings
                  </span>
                  <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Explore Directory
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Verification Guarantee Footer Notice */}
        <div className="mt-14 bg-white rounded-2xl p-6 border border-slate-200 text-center max-w-3xl mx-auto shadow-xs">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mb-3">
            <CheckCircle className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-800">ClinicCare Pune Healthcare Guarantee</h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            All listed facilities are verified with actual municipal, state or corporate records. Phone numbers and locations are verified against current Pune & PCMC healthcare databases. Where real-time availability varies (e.g. ICU bed occupancy, specific rare blood units), please contact the facility directly.
          </p>
        </div>
      </div>
    </div>
  );
}
