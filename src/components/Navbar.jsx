import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  Bot, 
  Search, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Shield, 
  HeartPulse, 
  ChevronRight, 
  Calendar, 
  Building2, 
  Droplets, 
  Eye, 
  Activity, 
  Sparkles, 
  MapPin, 
  ArrowRight,
  Ambulance,
  PhoneCall,
  CheckCircle2,
  Clock,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const isDoctor = user?.role === 'doctor';

  const searchInputRef = useRef(null);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K to open search & Esc to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setProfileDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
    }
  }, [searchOpen]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setNotificationsOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname, location.search]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'AI Doctor', path: '/ai-doctor', isAIDoctor: true },
    { name: 'Appointments', path: '/appointments' },
    { name: 'Doctors', path: '/ai-doctor?tab=doctors' },
    { name: 'Hospitals', path: '/hospitals' },
    { name: 'Blood Banks', path: '/blood-banks' },
    { name: 'Eye Care', path: '/eye-care' },
    { name: 'Healthcare Services', path: '/healthcare-directory' }
  ];

  // Search catalog with verified Pune healthcare entities
  const searchDatabase = [
    { title: 'Ruby Hall Clinic', category: 'Hospitals', area: 'Sassoon Road, Pune', path: '/hospitals?search=Ruby+Hall' },
    { title: 'Jehangir Hospital', category: 'Hospitals', area: 'Bund Garden, Pune', path: '/hospitals?search=Jehangir' },
    { title: 'Deenanath Mangeshkar Hospital', category: 'Hospitals', area: 'Erandwane, Pune', path: '/hospitals?search=Deenanath' },
    { title: 'Sahyadri Super Speciality Hospital', category: 'Hospitals', area: 'Deccan Gymkhana, Pune', path: '/hospitals?search=Sahyadri' },
    { title: 'KEM Hospital & Research Centre', category: 'Hospitals', area: 'Rasta Peth, Pune', path: '/hospitals?search=KEM' },
    { title: 'Sancheti Orthopedic Hospital', category: 'Hospitals', area: 'Shivajinagar, Pune', path: '/hospitals?search=Sancheti' },
    { title: 'Manipal Hospital Kharadi', category: 'Hospitals', area: 'Kharadi, Pune', path: '/hospitals?search=Manipal' },
    { title: 'Dr. Rajesh Sharma (Cardiologist)', category: 'Doctors', area: 'Deccan / KEM Pune', path: '/ai-doctor?tab=doctors' },
    { title: 'Dr. Priya Patel (Pediatrician)', category: 'Doctors', area: 'Kothrud, Pune', path: '/ai-doctor?tab=doctors' },
    { title: 'Dr. Sunita Kulkarni (Gynecologist)', category: 'Doctors', area: 'Aundh, Pune', path: '/ai-doctor?tab=doctors' },
    { title: 'Dr. Amit Joshi (Orthopedic)', category: 'Doctors', area: 'Shivajinagar, Pune', path: '/ai-doctor?tab=doctors' },
    { title: 'Poona Club Blood Centre', category: 'Blood Banks', area: 'Camp, Pune', path: '/blood-banks?search=Poona' },
    { title: 'Jankalyan Blood Centre', category: 'Blood Banks', area: 'Sarasbaug, Pune', path: '/blood-banks?search=Jankalyan' },
    { title: 'HV Desai Eye Hospital', category: 'Eye Care', area: 'Hadapsar, Pune', path: '/eye-care?search=Desai' },
    { title: 'Asian Eye Institute & Laser Centre', category: 'Eye Care', area: 'Kothrud, Pune', path: '/eye-care?search=Asian' },
    { title: 'National Institute of Ophthalmology', category: 'Eye Care', area: 'Ghole Road, Pune', path: '/eye-care?search=National' },
    { title: 'Emergency Ambulance 108 Network', category: 'Healthcare Services', area: 'City-wide Pune & PCMC', path: '/emergency' },
    { title: 'Book Doctor Appointment', category: 'Healthcare Services', area: 'Online Scheduling', path: '/book-appointment' },
    { title: 'Diagnostic & Pathology Labs', category: 'Healthcare Services', area: 'Pune Directory', path: '/healthcare-directory' },
    { title: 'ClinicCare AI Symptom Assessment', category: 'AI Doctor', area: 'Instant Clinical Triaging', path: '/ai-doctor?tab=symptoms' }
  ];

  const filteredSearchResults = searchQuery.trim() === ''
    ? searchDatabase.slice(0, 6)
    : searchDatabase.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.area.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const notificationsList = [
    {
      id: 1,
      title: '30 Verified Pune Hospitals Active',
      desc: 'Complete directory updated with ICU bed status and emergency contact numbers.',
      time: '10m ago',
      unread: true,
      link: '/hospitals'
    },
    {
      id: 2,
      title: 'ClinicCare AI Doctor Live 24/7',
      desc: 'Supervised symptom assessment & verified medicine lookup available.',
      time: '1h ago',
      unread: true,
      link: '/ai-doctor'
    },
    {
      id: 3,
      title: 'Emergency Response Network Connected',
      desc: 'Pune & PCMC emergency services and ambulance routing operational.',
      time: '3h ago',
      unread: true,
      link: '/emergency'
    }
  ];

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  const isLinkActive = (path) => {
    if (path.includes('?')) {
      const [base, query] = path.split('?');
      return location.pathname === base && location.search.includes(query);
    }
    if (path === '/') {
      return location.pathname === '/' && location.search === '';
    }
    return location.pathname === path && !location.search;
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full transition-all duration-300">
        {/* Main Navbar Bar */}
        <nav 
          className={`w-full transition-all duration-300 ${
            isScrolled 
              ? 'bg-white/90 backdrop-blur-xl shadow-[0_4px_25px_-5px_rgba(15,23,42,0.08)] py-2.5' 
              : 'bg-white/80 backdrop-blur-md py-3.5 border-b border-slate-100'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-2 lg:gap-4">
              
              {/* Brand Logo */}
              <Link 
                to="/" 
                className="flex items-center gap-2.5 group shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl py-1"
                aria-label="ClinicCare Home"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 via-cyan-500 to-teal-400 flex items-center justify-center shadow-md shadow-cyan-500/25 group-hover:shadow-cyan-500/40 group-hover:scale-105 transition-all duration-300">
                    <HeartPulse className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
                  </span>
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">
                      Clinic<span className="bg-linear-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Care</span>
                    </span>
                    <span className="text-xs">🩺</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest -mt-1 hidden sm:block">
                    Pune Healthcare Hub
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation Links */}
              <div className="hidden xl:flex items-center space-x-1">
                {navLinks.map((link) => {
                  const active = isLinkActive(link.path);

                  if (link.isAIDoctor) {
                    return (
                      <Link
                        key={link.name}
                        to={link.path}
                        className={`relative group px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95 ${
                          active
                            ? 'bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-blue-500/30 ring-2 ring-blue-400/50'
                            : 'bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-blue-500/20 hover:shadow-cyan-500/30'
                        }`}
                      >
                        <Bot className="w-3.5 h-3.5 text-cyan-200 group-hover:rotate-12 transition-transform duration-300" />
                        <span>🤖 AI Doctor</span>
                        <span className="flex h-1.5 w-1.5 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-200"></span>
                        </span>
                      </Link>
                    );
                  }

                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`relative px-3 py-1.5 rounded-xl text-xs font-semibold tracking-normal transition-all duration-200 hover:-translate-y-0.5 group ${
                        active
                          ? 'bg-linear-to-r from-blue-50 to-cyan-50/80 text-blue-700 font-bold shadow-xs border border-blue-200/60'
                          : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50/80'
                      }`}
                    >
                      <span>{link.name}</span>
                      {/* Gradient Underline on Hover */}
                      <span 
                        className={`absolute bottom-0 left-2 right-2 h-0.5 bg-linear-to-r from-blue-500 via-cyan-400 to-teal-400 rounded-full transition-transform duration-200 origin-left ${
                          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                        }`} 
                      />
                    </Link>
                  );
                })}

                {/* Doctor Portal Link */}
                {(isDoctor || isAdmin) && (
                  <Link
                    to="/doctor-dashboard"
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-normal transition-all duration-200 flex items-center gap-1.5 hover:-translate-y-0.5 ${
                      location.pathname === '/doctor-dashboard'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200/50'
                    }`}
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    Doctor Review
                  </Link>
                )}

                {/* Admin Link */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-normal transition-all duration-200 flex items-center gap-1.5 hover:-translate-y-0.5 ${
                      location.pathname === '/admin'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-purple-700 bg-purple-50/80 hover:bg-purple-100/80 border border-purple-200/50'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Admin
                  </Link>
                )}
              </div>

              {/* Right Side: Search, Notifications, Profile / Login */}
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                
                {/* Search Button */}
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-blue-700 bg-slate-100/80 hover:bg-blue-50/80 rounded-xl transition-all duration-200 border border-slate-200/70 hover:border-blue-200 hover:-translate-y-0.5"
                  title="Search Pune healthcare (Ctrl+K)"
                  aria-label="Open search dialog"
                >
                  <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600" />
                  <span className="hidden sm:inline">Search</span>
                  <kbd className="hidden md:inline-block text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded-md border border-slate-200 font-mono">
                    ⌘K
                  </kbd>
                </button>

                {/* Notifications Bell */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative p-2 text-slate-600 hover:text-blue-700 hover:bg-blue-50/70 rounded-xl transition-all duration-200 hover:-translate-y-0.5 focus:outline-none"
                    title="Healthcare Alerts"
                    aria-label="Toggle notifications"
                  >
                    <Bell className="w-4 h-4 text-slate-600" />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border border-white"></span>
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  <AnimatePresence>
                    {notificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 sm:w-88 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 p-4 z-50 overflow-hidden"
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                              <Bell className="w-4 h-4" />
                            </span>
                            <h4 className="text-sm font-bold text-slate-900">Healthcare Updates</h4>
                          </div>
                          {unreadNotifications > 0 && (
                            <button
                              onClick={() => setUnreadNotifications(0)}
                              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                            >
                              Mark read
                            </button>
                          )}
                        </div>

                        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto my-2 pr-1">
                          {notificationsList.map((notif) => (
                            <Link
                              key={notif.id}
                              to={notif.link}
                              onClick={() => setNotificationsOpen(false)}
                              className="block py-2.5 px-2 hover:bg-slate-50/80 rounded-xl transition-colors group"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                  {notif.title}
                                </span>
                                <span className="text-[10px] text-slate-600 shrink-0 flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" />
                                  {notif.time}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                                {notif.desc}
                              </p>
                            </Link>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-emerald-700 font-medium flex items-center gap-1 text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Pune network live
                          </span>
                          <Link 
                            to="/healthcare-directory" 
                            onClick={() => setNotificationsOpen(false)}
                            className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 text-[11px]"
                          >
                            All services
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile / Auth Section */}
                {isAuthenticated ? (
                  <div className="relative" ref={profileRef}>
                    <button
                      type="button"
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200/80 hover:border-blue-300 bg-white/70 hover:bg-blue-50/50 transition-all duration-200 hover:-translate-y-0.5 focus:outline-none"
                    >
                      <div className="w-7 h-7 rounded-lg bg-linear-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="hidden md:flex flex-col text-left">
                        <span className="text-xs font-bold text-slate-800 leading-tight">
                          {user?.name?.split(' ')[0] || 'User'}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-600 capitalize">
                          {user?.role || 'Patient'}
                        </span>
                      </div>
                    </button>

                    {/* Profile Dropdown */}
                    <AnimatePresence>
                      {profileDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 py-2 z-50 overflow-hidden"
                        >
                          <div className="px-4 py-2 border-b border-slate-100">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {user?.name || 'ClinicCare Patient'}
                            </p>
                            <p className="text-[11px] text-slate-600 truncate mt-0.5">
                              {user?.email || 'patient@cliniccare.com'}
                            </p>
                          </div>

                          <div className="py-1">
                            <Link
                              to="/dashboard"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50/60 transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4 text-blue-500" />
                              Dashboard
                            </Link>
                            <Link
                              to="/profile"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50/60 transition-colors"
                            >
                              <User className="w-4 h-4 text-cyan-600" />
                              My Profile
                            </Link>
                            <Link
                              to="/appointments"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50/60 transition-colors"
                            >
                              <Calendar className="w-4 h-4 text-indigo-500" />
                              Appointments
                            </Link>
                            {(isDoctor || isAdmin) && (
                              <Link
                                to="/doctor-dashboard"
                                onClick={() => setProfileDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50/60 transition-colors"
                              >
                                <Stethoscope className="w-4 h-4 text-emerald-600" />
                                Doctor Review Portal
                              </Link>
                            )}
                            {isAdmin && (
                              <Link
                                to="/admin"
                                onClick={() => setProfileDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-purple-700 hover:bg-purple-50/60 transition-colors"
                              >
                                <Shield className="w-4 h-4 text-purple-600" />
                                Admin Panel
                              </Link>
                            )}
                          </div>

                          <div className="pt-1 border-t border-slate-100">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              Logout
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {/* Login: Transparent/outlined button */}
                    <Link
                      to="/login"
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 border border-slate-200/80 hover:border-blue-400 bg-white/60 hover:bg-blue-50/40 transition-all duration-200 hover:-translate-y-0.5 shadow-xs"
                    >
                      Login
                    </Link>

                    {/* Register: Gradient filled button */}
                    <Link
                      to="/register"
                      className="group flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-linear-to-r from-blue-600 via-cyan-600 to-teal-500 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-600 shadow-sm shadow-blue-500/25 hover:shadow-cyan-500/35 transition-all duration-200 hover:scale-102 active:scale-95"
                    >
                      <span>Get Started</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                )}

                {/* Mobile Menu Toggle Button */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="xl:hidden p-2 text-slate-700 hover:text-blue-600 hover:bg-slate-100/80 rounded-xl transition-colors focus:outline-none"
                  aria-label="Toggle mobile menu"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>

            </div>
          </div>
        </nav>

        {/* Animated Gradient Line Underneath Navbar */}
        <div 
          className="h-[2.5px] w-full bg-linear-to-r from-blue-600 via-cyan-400 via-teal-400 to-indigo-600 animate-gradient-flow shadow-[0_1px_4px_rgba(37,99,235,0.2)]" 
        />

        {/* Mobile Slide-down Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="xl:hidden bg-white/95 backdrop-blur-2xl border-b border-slate-200/80 shadow-2xl overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
                
                {/* Mobile Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search hospitals, doctors, blood banks..."
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  {searchQuery && (
                    <div className="mt-2 bg-white rounded-xl border border-slate-200 p-2 shadow-lg max-h-48 overflow-y-auto">
                      {filteredSearchResults.map((res, idx) => (
                        <Link
                          key={idx}
                          to={res.path}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center justify-between p-2 hover:bg-blue-50 rounded-lg text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-800 block">{res.title}</span>
                            <span className="text-[10px] text-slate-600">{res.category} • {res.area}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile Navigation Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                  {navLinks.map((link) => {
                    const active = isLinkActive(link.path);
                    return (
                      <Link
                        key={link.name}
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          link.isAIDoctor
                            ? 'bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-bold shadow-md shadow-blue-500/20'
                            : active
                              ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {link.name === 'Home' && <Activity className="w-4 h-4 text-blue-500" />}
                          {link.name === 'AI Doctor' && <Bot className="w-4 h-4 text-cyan-200 animate-pulse" />}
                          {link.name === 'Appointments' && <Calendar className="w-4 h-4 text-indigo-500" />}
                          {link.name === 'Doctors' && <Stethoscope className="w-4 h-4 text-teal-600" />}
                          {link.name === 'Hospitals' && <Building2 className="w-4 h-4 text-blue-600" />}
                          {link.name === 'Blood Banks' && <Droplets className="w-4 h-4 text-rose-500" />}
                          {link.name === 'Eye Care' && <Eye className="w-4 h-4 text-emerald-600" />}
                          {link.name === 'Healthcare Services' && <Sparkles className="w-4 h-4 text-amber-500" />}
                          <span>{link.isAIDoctor ? '🤖 AI Doctor' : link.name}</span>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 ${link.isAIDoctor ? 'text-white' : 'text-slate-400'}`} />
                      </Link>
                    );
                  })}

                  {(isDoctor || isAdmin) && (
                    <Link
                      to="/doctor-dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Stethoscope className="w-4 h-4 text-emerald-600" />
                        <span>Doctor Review Portal</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                    </Link>
                  )}

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Shield className="w-4 h-4 text-purple-600" />
                        <span>Admin Dashboard</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-purple-500" />
                    </Link>
                  )}
                </div>

                {/* Mobile Auth Bottom Bar */}
                <div className="pt-3 border-t border-slate-100">
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-2 py-1">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{user?.name}</p>
                            <p className="text-[10px] text-slate-600">{user?.email}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 capitalize">
                          {user?.role || 'Patient'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Link
                          to="/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
                        >
                          <User className="w-3.5 h-3.5" />
                          Profile
                        </Link>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Log out
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-center py-2.5 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-center py-2.5 rounded-xl text-xs font-bold bg-linear-to-r from-blue-600 via-cyan-600 to-teal-500 text-white shadow-sm"
                      >
                        Get Started
                      </Link>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Global Interactive Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="relative mx-auto max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden"
            >
              {/* Search Header */}
              <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
                <Search className="w-5 h-5 text-blue-600 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search hospitals, doctors, clinics, services, blood banks..."
                  className="w-full text-sm text-slate-900 placeholder:text-slate-400 bg-transparent outline-none border-none font-medium"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category Filter Pills */}
              <div className="px-4 py-2 bg-slate-50/70 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                <span className="text-slate-600 font-bold shrink-0">Filter:</span>
                {['All', 'Hospitals', 'Doctors', 'Blood Banks', 'Eye Care', 'Healthcare Services'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSearchQuery(cat === 'All' ? '' : cat)}
                    className="px-2.5 py-1 rounded-lg font-semibold bg-white border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-colors shrink-0"
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Results List */}
              <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-50">
                {filteredSearchResults.length > 0 ? (
                  filteredSearchResults.map((item, idx) => (
                    <Link
                      key={idx}
                      to={item.path}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50/70 transition-all duration-150 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 p-2 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                          {item.category === 'Hospitals' && <Building2 className="w-4 h-4" />}
                          {item.category === 'Doctors' && <Stethoscope className="w-4 h-4" />}
                          {item.category === 'Blood Banks' && <Droplets className="w-4 h-4" />}
                          {item.category === 'Eye Care' && <Eye className="w-4 h-4" />}
                          {item.category === 'Healthcare Services' && <Sparkles className="w-4 h-4" />}
                          {item.category === 'AI Doctor' && <Bot className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {item.title}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {item.category}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {item.area}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-sm font-bold text-slate-700">No healthcare records found</p>
                    <p className="text-xs text-slate-400 mt-1">Try searching for hospital names, areas (e.g., Kothrud, Deccan) or doctor specialties.</p>
                  </div>
                )}
              </div>

              {/* Search Footer */}
              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Pune Healthcare Realtime Directory
                </span>
                <span>Press <kbd className="font-mono bg-white px-1 border rounded text-[10px]">Esc</kbd> to close</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}