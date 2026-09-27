const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const componentsDir = path.join(srcDir, 'components');
const pagesDir = path.join(srcDir, 'pages');

const files = {
  'components/Navbar.jsx': `import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Menu, X, User, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Appointments', path: '/appointments' },
    { name: 'Facilities', path: '/facilities' },
    { name: 'Emergency', path: '/emergency' }
  ];

  return (
    <nav className={\`fixed top-0 w-full z-50 transition-all duration-300 \${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}\`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-linear-to-tr from-primary-600 to-primary-400 p-2.5 rounded-xl shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-all duration-300">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-gray-900 tracking-tight">CareConnect</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={\`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 \${
                  location.pathname === link.path 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }\`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Log in</Link>
            <Link to="/register" className="group flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-800 transition-all shadow-md hover:shadow-xl">
              Get Started
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <button 
            className="md:hidden text-gray-600 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 md:hidden"
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-lg font-medium text-gray-700 hover:text-primary-600 px-4 py-2 rounded-lg hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="border-t border-gray-100 my-2 pt-4 px-4 flex flex-col gap-3">
                <Link to="/login" className="text-center py-3 rounded-xl border border-gray-200 font-medium text-gray-700" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                <Link to="/register" className="text-center py-3 rounded-xl bg-gray-900 text-white font-medium" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}`,
  'components/Footer.jsx': `import React from 'react';
import { Activity, MessageCircle, Briefcase, Code } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
          <div className="col-span-1 md:col-span-12 lg:col-span-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary-500 p-2 rounded-xl">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">CareConnect</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 pr-4">
              A unified healthcare coordination platform designed to empower patients, streamline clinical workflows, and deliver better health outcomes through modern technology.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                <Briefcase className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                <Code className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-4 lg:col-span-2 lg:col-start-7">
            <h3 className="font-semibold text-gray-900 mb-5">Product</h3>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="/appointments" className="hover:text-primary-600 transition-colors">Appointments</a></li>
              <li><a href="/facilities" className="hover:text-primary-600 transition-colors">Facilities Network</a></li>
              <li><a href="/dashboard" className="hover:text-primary-600 transition-colors">Patient Portal</a></li>
              <li><a href="/ambulance" className="hover:text-primary-600 transition-colors">Ambulance Tracking</a></li>
            </ul>
          </div>
          
          <div className="col-span-1 md:col-span-4 lg:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-5">Company</h3>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="/about" className="hover:text-primary-600 transition-colors">About Us</a></li>
              <li><a href="/contact" className="hover:text-primary-600 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Blog</a></li>
            </ul>
          </div>
          
          <div className="col-span-1 md:col-span-4 lg:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-5">Legal</h3>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">HIPAA Compliance</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} CareConnect Technologies Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}`,
  'pages/Home.jsx': `import React from 'react';
import { ArrowRight, Activity, HeartPulse, Clock, Shield, Calendar, MapPin, Search, User } from 'lucide-react';
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
                  <div key={i} className={\`w-8 h-8 rounded-full border-2 border-white bg-gray-\${200 + i*100} z-\${50-i*10}\`}></div>
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
                <div className={\`w-14 h-14 rounded-2xl \${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform\`}>
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
}`,
  'pages/PatientDashboard.jsx': `import React from 'react';
import { Calendar, FileText, Pill, Activity, ChevronRight, Clock, MapPin, User, FileSignature } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PatientDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 min-h-screen bg-gray-50/50">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, Sarah. Here's your health overview.</p>
        </div>
        <Link to="/book-appointment" className="btn-primary py-2.5 rounded-xl text-sm whitespace-nowrap">
          New Appointment
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Upcoming Visits', value: '2', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Lab Results', value: '1', icon: FileText, color: 'text-primary-600', bg: 'bg-primary-50' },
          { label: 'Prescriptions', value: '3', icon: Pill, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Health Score', value: '92', icon: Activity, color: 'text-green-600', bg: 'bg-green-50' }
        ].map((metric, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={\`w-12 h-12 rounded-xl \${metric.bg} flex items-center justify-center\`}>
              <metric.icon className={\`w-6 h-6 \${metric.color}\`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900 leading-tight">{metric.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Upcoming Appointment */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Next Appointment</h3>
              <button className="text-sm font-medium text-primary-600 hover:text-primary-700">Reschedule</button>
            </div>
            <div className="p-6 sm:p-8 bg-linear-to-br from-white to-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-700 flex flex-col items-center justify-center font-bold shadow-sm">
                  <span className="text-sm uppercase tracking-wider opacity-80">Oct</span>
                  <span className="text-xl leading-none mt-1">12</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-1">Dr. Eleanor Sterling</h4>
                  <p className="text-gray-500 text-sm font-medium">Cardiology • General Checkup</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 10:00 AM</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> City Med Center</span>
                  </div>
                </div>
              </div>
              <button className="w-full sm:w-auto bg-gray-900 text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors shadow-sm">
                View Details
              </button>
            </div>
          </div>

          {/* Recent Records */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Medical Records</h3>
              <button className="text-sm font-medium text-gray-500 hover:text-gray-900">View all</button>
            </div>
            <div className="divide-y divide-gray-50">
              {[
                { title: 'Complete Blood Count (CBC)', date: 'Sep 28, 2026', doctor: 'Dr. Sterling', type: 'Lab Result' },
                { title: 'Lipid Panel', date: 'Sep 28, 2026', doctor: 'Dr. Sterling', type: 'Lab Result' },
                { title: 'Prescription: Atorvastatin', date: 'Aug 15, 2026', doctor: 'Dr. Sterling', type: 'Prescription' }
              ].map((record, i) => (
                <div key={i} className="p-4 sm:px-6 hover:bg-gray-50 transition-colors flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <FileSignature className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm mb-0.5">{record.title}</p>
                      <p className="text-xs text-gray-500">{record.type} • {record.date}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/blood-search" className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-red-50 rounded-2xl border border-gray-100 hover:border-red-100 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm group-hover:bg-red-100 transition-colors">
                  <Activity className="w-5 h-5 text-red-500" />
                </div>
                <span className="text-xs font-semibold text-gray-700 text-center">Blood Search</span>
              </Link>
              <Link to="/ambulance" className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-red-50 rounded-2xl border border-gray-100 hover:border-red-100 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm group-hover:bg-red-100 transition-colors">
                  <Activity className="w-5 h-5 text-red-500" />
                </div>
                <span className="text-xs font-semibold text-gray-700 text-center">Ambulance</span>
              </Link>
              <Link to="/facilities" className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-primary-50 rounded-2xl border border-gray-100 hover:border-primary-100 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm group-hover:bg-primary-100 transition-colors">
                  <MapPin className="w-5 h-5 text-primary-500" />
                </div>
                <span className="text-xs font-semibold text-gray-700 text-center">Find Clinic</span>
              </Link>
              <Link to="/profile" className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-blue-50 rounded-2xl border border-gray-100 hover:border-blue-100 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm group-hover:bg-blue-100 transition-colors">
                  <User className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-xs font-semibold text-gray-700 text-center">Profile</span>
              </Link>
            </div>
          </div>

          {/* Vitals */}
          <div className="bg-linear-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-gray-300">Latest Vitals</h3>
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-end border-b border-gray-700 pb-3">
                <span className="text-sm text-gray-400 font-medium">Blood Pressure</span>
                <span className="text-xl font-bold">120/80</span>
              </div>
              <div className="flex justify-between items-end border-b border-gray-700 pb-3">
                <span className="text-sm text-gray-400 font-medium">Weight</span>
                <span className="text-xl font-bold">68 <span className="text-sm font-normal text-gray-400">kg</span></span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-sm text-gray-400 font-medium">Height</span>
                <span className="text-xl font-bold">175 <span className="text-sm font-normal text-gray-400">cm</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`
};

Object.entries(files).forEach(([file, content]) => {
  fs.writeFileSync(path.join(srcDir, file), content);
});

// Write a general css file with font settings
const indexCssPath = path.join(srcDir, 'index.css');
const existingCss = fs.readFileSync(indexCssPath, 'utf8');
if(!existingCss.includes('h1, h2, h3, h4')) {
    fs.appendFileSync(indexCssPath, `\n
@layer base {
  h1, h2, h3, h4, h5, h6 {
    @apply tracking-tight;
  }
}
@layer components {
  .btn-primary {
    @apply inline-flex items-center justify-center px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl shadow-sm transition-all duration-200 active:scale-95;
  }
  .btn-secondary {
    @apply inline-flex items-center justify-center px-5 py-2.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-medium rounded-xl shadow-sm transition-all duration-200 hover:bg-gray-50 active:scale-95;
  }
  .input-field {
    @apply w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white;
  }
}
`);
}

console.log('Successfully enhanced components and pages.');
