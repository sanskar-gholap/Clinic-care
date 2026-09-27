import { ArrowRight, Activity, HeartPulse, Clock, Shield, Calendar, MapPin, Search, User, Stethoscope, Pill, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="bg-white overflow-hidden pt-24">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-150 h-150 bg-primary-100/50 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-100 h-100 bg-blue-100/50 rounded-full blur-3xl opacity-50 pointer-events-none" />
        
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center py-12 lg:py-20 relative">
          <motion.div 
            className="lg:col-span-6 text-center lg:text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold tracking-wide mb-8">
              <span className="flex h-2 w-2 rounded-full bg-primary-500 mr-2 shadow-[0_0_8px_rgba(20,184,166,0.8)]"></span>
              REIMAGINING HEALTHCARE
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-5xl tracking-tight font-extrabold text-gray-900 sm:text-6xl md:text-7xl lg:leading-[1.1]">
              Care without <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-600 to-blue-600">compromise.</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="mt-6 text-lg text-gray-500 sm:max-w-xl sm:mx-auto lg:mx-0 leading-relaxed">
              CareConnect is the unified platform that brings patients, specialists, and facilities together. Experience seamless coordination, instant booking, and secure medical records all in one beautifully designed portal.
            </motion.p>
            <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/register" className="group relative inline-flex items-center justify-center bg-gray-900 text-white px-8 py-4 rounded-2xl font-semibold text-lg overflow-hidden transition-transform active:scale-95">
                <div className="absolute inset-0 w-full h-full bg-linear-to-r from-gray-800 to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative flex items-center gap-2">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link to="/facilities" className="inline-flex items-center justify-center bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 px-8 py-4 rounded-2xl font-semibold text-lg transition-all active:scale-95 shadow-sm hover:shadow">
                Find Facilities
              </Link>
            </motion.div>
            <motion.div variants={itemVariants} className="mt-10 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500 font-medium">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-gray-${200 + i*100} z-${50-i*10}`}></div>
                ))}
              </div>
              <p>Trusted by 10,000+ patients</p>
            </motion.div>
          </motion.div>

          <motion.div 
            className="mt-16 lg:mt-0 lg:col-span-6 relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Dashboard Mockup */}
            <div className="relative rounded-4xl border border-gray-100 bg-white/50 backdrop-blur-xl shadow-2xl p-2 pb-0 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="bg-white rounded-t-[1.75rem] border border-gray-100 border-b-0 p-6 pb-8 h-full">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="text-primary-600 w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Good morning, Sarah</h4>
                      <p className="text-xs text-gray-500">Your health overview</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                    <Activity className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-linear-to-br from-primary-50 to-primary-100 p-4 rounded-2xl">
                    <HeartPulse className="text-primary-600 w-6 h-6 mb-3" />
                    <p className="text-xs font-medium text-primary-800 opacity-80 mb-1">Heart Rate</p>
                    <p className="text-2xl font-bold text-primary-900">72 <span className="text-sm font-medium">bpm</span></p>
                  </div>
                  <div className="bg-linear-to-br from-blue-50 to-blue-100 p-4 rounded-2xl">
                    <Calendar className="text-blue-600 w-6 h-6 mb-3" />
                    <p className="text-xs font-medium text-blue-800 opacity-80 mb-1">Next Visit</p>
                    <p className="text-lg font-bold text-blue-900 leading-tight mt-1">Oct 12 <br/><span className="text-sm font-medium opacity-80">10:00 AM</span></p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <p className="font-semibold text-gray-900 text-sm">Recent Activity</p>
                    <span className="text-xs text-primary-600 font-medium">View all</span>
                  </div>
                  <div className="space-y-3">
                    {[1,2].map(i => (
                      <div key={i} className="flex gap-3 items-center bg-white p-3 rounded-xl shadow-sm border border-gray-50">
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Lab Results Uploaded</p>
                          <p className="text-xs text-gray-500">Complete Blood Count</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [-10, 10, -10] }} 
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute -right-6 top-1/4 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Blood Request Match</p>
                <p className="text-sm font-bold text-gray-900">O+ Available near you</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ClinicCare AI Doctor Feature Showcase */}
      <section className="py-16 bg-linear-to-b from-blue-900 via-slate-900 to-slate-950 text-white relative overflow-hidden">
        {/* Glow circles */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-4 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Advanced Clinical Intelligence • Doctor-Supervised
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
              ClinicCare AI Doctor
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed font-light">
              Your intelligent healthcare assistant for structured symptom triage, appointment coordination, verified medicine intelligence, and licensed doctor supervision.
            </p>
          </div>

          {/* 6 Core Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Card 1 */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 backdrop-blur-md hover:border-blue-400/60 transition group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
                🩺
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Symptom Assessment</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Structured clinical intake analyzing duration, severity, temperature, allergies, and risk factors with 4-tier urgency triage.
              </p>
              <div className="text-xs text-blue-400 font-semibold flex items-center gap-1">
                🟢 General • 🟡 Consult • 🟠 Same-Day • 🔴 Emergency
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 backdrop-blur-md hover:border-blue-400/60 transition group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
                📅
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Appointment Assistant</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Intelligently matches your clinical presentation to the right medical specialty and books verified Pune specialist slots.
              </p>
              <div className="text-xs text-purple-400 font-semibold">
                Ophthalmology, Cardiology, Ortho & 12+ specialties
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 backdrop-blur-md hover:border-blue-400/60 transition group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
                💊
              </div>
              <h3 className="text-lg font-bold text-white mb-2">105+ Medicine Database</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Comprehensive pharmacopeia detailing generic names, uses, side effects, contraindications, and drug interactions.
              </p>
              <div className="text-xs text-emerald-400 font-semibold">
                Doctor-supervised Rx protocol • No autonomous drugs
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 backdrop-blur-md hover:border-blue-400/60 transition group">
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
                👨‍⚕️
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Doctor Finder</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Connect with verified Pune doctors, review qualifications, registration numbers, clinic affiliations, and availability.
              </p>
              <div className="text-xs text-sky-400 font-semibold">
                MMC verified practitioners across Pune & PCMC
              </div>
            </div>

            {/* Card 5 */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 backdrop-blur-md hover:border-blue-400/60 transition group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
                🏥
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Hospital & Facility Directory</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Search 30+ verified hospitals, blood banks, eye hospitals, and clinics across Kothrud, Shivaji Nagar, Hadapsar, and PCMC.
              </p>
              <div className="text-xs text-indigo-400 font-semibold">
                Real-time directions & verified emergency desks
              </div>
            </div>

            {/* Card 6 */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 backdrop-blur-md hover:border-rose-400/60 transition group">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
                🚑
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Emergency Assistance</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Automated red-flag detection halts routine conversation and immediately surfaces 108/102/112 emergency routing.
              </p>
              <div className="text-xs text-rose-400 font-semibold">
                Immediate warning signs detection protocol
              </div>
            </div>
          </div>

          {/* CTA Banner with Safety Notice */}
          <div className="bg-linear-to-r from-blue-600/30 via-slate-800/80 to-emerald-600/30 border border-blue-400/30 rounded-3xl p-8 backdrop-blur-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-left max-w-xl">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold tracking-wide uppercase mb-1">
                <CheckCircle2 className="w-4 h-4" />
                Ethical & Safe Healthcare AI Protocol
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                Experience ClinicCare AI Doctor Today
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Treatment flow: AI Assessment ➔ Doctor Review ➔ Doctor Approval ➔ Prescription ➔ Patient.
                Your data is encrypted and evaluated under strict medical oversight.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/ai-doctor"
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/40 hover:shadow-blue-500/60 transition flex items-center gap-2"
              >
                <Stethoscope className="w-4 h-4" />
                Launch AI Doctor
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/doctor-dashboard"
                className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-2xl font-semibold text-sm transition flex items-center gap-2"
              >
                Doctor Review Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Healthcare Services Across Pune Section */}
      <section className="py-16 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100/80 text-blue-700 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase mb-3">
              <MapPin className="w-3.5 h-3.5" />
              Verified Pune Directory
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Healthcare Services Across Pune
            </h2>
            <p className="mt-3 text-base sm:text-lg text-slate-600">
              Find hospitals, clinics, blood banks, eye-care centres and emergency services in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Find Hospital */}
            <Link 
              to="/hospitals"
              className="group bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl mb-5 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs">
                  🏥
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Find Hospital
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    30+ Verified
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Browse top government, private, and multispeciality hospitals across Pune & PCMC with verified contact numbers and directions.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-blue-600">
                <span>Explore Hospitals</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>

            {/* Find Blood Bank */}
            <Link 
              to="/blood-banks"
              className="group bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-xl hover:border-rose-300 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-3xl mb-5 group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-xs">
                  🩸
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                    Find Blood Bank
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                    24/7 Availability
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Locate verified blood donation centres, filter by blood group (A+, B+, O+, AB-), and submit urgent requirement requests.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-rose-600">
                <span>View Blood Banks</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>

            {/* Find Eye Care */}
            <Link 
              to="/eye-care"
              className="group bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-xl hover:border-cyan-300 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-3xl mb-5 group-hover:scale-110 group-hover:bg-cyan-600 group-hover:text-white transition-all shadow-xs">
                  👁️
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
                    Find Eye Care
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-100">
                    Speciality Care
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Verified ophthalmology centres for Cataract, LASIK, Glaucoma, Retina, and emergency eye trauma testing across Pune.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-cyan-600">
                <span>Eye Clinics & Testing</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>

            {/* Find Clinic */}
            <Link 
              to="/facilities?category=clinic"
              className="group bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-xl hover:border-violet-300 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center text-3xl mb-5 group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition-all shadow-xs">
                  👨⚕️
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                    Find Clinic
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100">
                    Walk-in OPD
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Find general practitioners, specialized polyclinics, and family doctors in your neighborhood across Pune.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-violet-600">
                <span>Explore Clinics</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>

            {/* Find Diagnostic Centre */}
            <Link 
              to="/facilities?category=diagnostic"
              className="group bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mb-5 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                  🧪
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    Find Diagnostic Centre
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    NABL Certified
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Locate pathology laboratories, MRI 3T, CT scans, ultrasound and X-ray imaging diagnostic facilities.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-emerald-600">
                <span>Diagnostic Labs</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>

            {/* Request Ambulance */}
            <Link 
              to="/ambulance"
              className="group bg-linear-to-br from-red-600 to-rose-700 text-white rounded-3xl p-7 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl mb-5 group-hover:scale-110 transition-transform">
                  🚑
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">
                    Request Ambulance
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white text-red-700">
                    24/7 Rapid
                  </span>
                </div>
                <p className="text-sm text-red-100 leading-relaxed mb-4">
                  Immediate emergency dispatch, Cardiac ICU transport, Basic Life Support, and real-time ambulance tracking in Pune.
                </p>
              </div>
              <div className="pt-4 border-t border-white/20 flex items-center justify-between text-sm font-bold text-white">
                <span>Request Ambulance Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/healthcare-directory"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 rounded-2xl text-slate-800 font-semibold hover:bg-slate-50 hover:border-slate-400 transition shadow-xs"
            >
              <span>View All 13 Healthcare Categories Across Pune</span>
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-gray-50 mt-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Everything you need, in one place.</h2>
            <p className="mt-4 text-lg text-gray-500">Comprehensive tools for patients to manage their health journey effortlessly.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: "Instant Booking",
                desc: "Schedule appointments with top specialists without the wait times.",
                color: "bg-blue-50 text-blue-600"
              },
              {
                icon: MapPin,
                title: "Facility Locator",
                desc: "Find hospitals, clinics, and pharmacies near your location instantly.",
                color: "bg-primary-50 text-primary-600"
              },
              {
                icon: Clock,
                title: "Emergency Dispatch",
                desc: "Request an ambulance with live tracking during critical moments.",
                color: "bg-red-50 text-red-600"
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 group">
                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}