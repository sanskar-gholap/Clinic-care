import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HeartPulse, 
  Bot, 
  AlertTriangle, 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  Clock, 
  ArrowUp, 
  CheckCircle2, 
  Send, 
  ShieldCheck, 
  Sparkles,
  ExternalLink,
  Calendar,
  Stethoscope,
  Droplets,
  Eye,
  Ambulance,
  PhoneCall,
  Activity
} from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');
  const navigate = useNavigate();

  const handleSubscribe = (e) => {
    e.preventDefault();
    setNewsletterError('');

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      setNewsletterError('Please enter a valid email address.');
      return;
    }

    try {
      const existing = JSON.parse(localStorage.getItem('cliniccare_subscribers') || '[]');
      if (existing.includes(trimmedEmail)) {
        setNewsletterError('This email is already subscribed to ClinicCare updates.');
        return;
      }
      existing.push(trimmedEmail);
      localStorage.setItem('cliniccare_subscribers', JSON.stringify(existing));
    } catch {
      // Fallback if localStorage is restricted
    }

    setSubscribed(true);
    setEmail('');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAIClick = () => {
    // Navigate to dedicated AI Doctor page and attempt to open chatbot
    navigate('/ai-doctor');
    const chatbotBtn = document.querySelector('button[title*="ClinicCare AI"]') || document.querySelector('button.group.relative.flex.items-center');
    if (chatbotBtn) {
      chatbotBtn.click();
    }
  };

  return (
    <footer className="relative bg-linear-to-b from-[#07111e] via-[#091629] to-[#040812] text-slate-300 pt-16 pb-10 border-t border-slate-800/80 overflow-hidden">
      
      {/* Background Ambient Glow Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* 10. FOOTER AI CTA BANNER */}
        <div className="mb-12 rounded-3xl p-6 sm:p-8 bg-linear-to-r from-blue-950/70 via-indigo-950/60 to-cyan-950/70 border border-blue-500/30 shadow-[0_10px_35px_-5px_rgba(37,99,235,0.2)] backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-full bg-linear-to-l from-cyan-500/10 to-transparent pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
                <span>24/7 Intelligent Clinical Assistant</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Need Healthcare Assistance?
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Ask ClinicCare AI for help finding doctors, hospitals, appointments and healthcare services across Pune.
              </p>
            </div>

            <button
              onClick={handleAIClick}
              className="shrink-0 flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <Bot className="w-5 h-5 text-cyan-200" />
              <span>🤖 Ask ClinicCare AI</span>
            </button>
          </div>
        </div>

        {/* 11. FOOTER EMERGENCY SECTION */}
        <div className="mb-14 rounded-2xl p-5 sm:p-6 bg-rose-950/25 border border-rose-500/30 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>🚨 Medical Emergency?</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/30 text-rose-300 border border-rose-400/30">
                  Pune Emergency Network
                </span>
              </h4>
              <p className="text-xs sm:text-sm text-rose-200/80 mt-0.5">
                Seek immediate medical attention or contact local emergency services.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              to="/hospitals"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all hover:scale-102 shrink-0"
            >
              <Building2 className="w-4 h-4" />
              <span>🏥 Find Emergency Hospital</span>
            </Link>
            <Link
              to="/emergency"
              className="hidden sm:flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-400/40 hover:bg-rose-900/30 text-rose-300 font-bold text-xs transition-colors shrink-0"
            >
              <Ambulance className="w-4 h-4" />
              <span>Ambulance 108</span>
            </Link>
          </div>
        </div>

        {/* 9. MAIN FOOTER CONTENT - 4 COLUMNS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-slate-800/80">
          
          {/* Column 1: Brand & Socials (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-5">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 via-cyan-500 to-teal-400 flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-white tracking-tight">
                  Clinic<span className="bg-linear-to-r from-blue-400 to-teal-300 bg-clip-text text-transparent">Care</span>
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Your intelligent healthcare companion.
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pr-2">
              Find doctors, hospitals, appointments, blood banks and healthcare services in one connected platform.
            </p>

            <div className="flex items-center gap-3 pt-1">
              {/* LinkedIn */}
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noreferrer"
                aria-label="ClinicCare on LinkedIn"
                className="w-9 h-9 rounded-xl bg-slate-800/70 border border-slate-700/80 flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all duration-200 hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer"
                aria-label="ClinicCare on Instagram"
                className="w-9 h-9 rounded-xl bg-slate-800/70 border border-slate-700/80 flex items-center justify-center text-slate-400 hover:text-white hover:bg-pink-600 hover:border-pink-500 transition-all duration-200 hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* Facebook */}
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer"
                aria-label="ClinicCare on Facebook"
                className="w-9 h-9 rounded-xl bg-slate-800/70 border border-slate-700/80 flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-700 hover:border-blue-600 transition-all duration-200 hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>

              {/* X (formerly Twitter) */}
              <a 
                href="https://x.com" 
                target="_blank" 
                rel="noreferrer"
                aria-label="ClinicCare on X"
                className="w-9 h-9 rounded-xl bg-slate-800/70 border border-slate-700/80 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 hover:border-slate-500 transition-all duration-200 hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              {/* YouTube */}
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer"
                aria-label="ClinicCare on YouTube"
                className="w-9 h-9 rounded-xl bg-slate-800/70 border border-slate-700/80 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-600 hover:border-red-500 transition-all duration-200 hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/ai-doctor" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5 text-cyan-300 font-semibold">
                  <span>🤖 AI Doctor</span>
                </Link>
              </li>
              <li>
                <Link to="/appointments" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <span>Appointments</span>
                </Link>
              </li>
              <li>
                <Link to="/ai-doctor?tab=doctors" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <span>Doctors</span>
                </Link>
              </li>
              <li>
                <Link to="/hospitals" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <span>Hospitals</span>
                </Link>
              </li>
              <li>
                <Link to="/facilities" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <span>Clinics</span>
                </Link>
              </li>
              <li>
                <Link to="/blood-banks" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <span>Blood Banks</span>
                </Link>
              </li>
              <li>
                <Link to="/eye-care" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <span>Eye Care</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Healthcare Services (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              Healthcare Services
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <Link to="/ai-doctor?tab=doctors" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
                  <span>Find a Doctor</span>
                </Link>
              </li>
              <li>
                <Link to="/hospitals" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Find a Hospital</span>
                </Link>
              </li>
              <li>
                <Link to="/book-appointment" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Book Appointment</span>
                </Link>
              </li>
              <li>
                <Link to="/blood-banks" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-rose-400" />
                  <span>Blood Bank</span>
                </Link>
              </li>
              <li>
                <Link to="/eye-care" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Eye Care</span>
                </Link>
              </li>
              <li>
                <Link to="/ambulance" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <Ambulance className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ambulance</span>
                </Link>
              </li>
              <li>
                <Link to="/healthcare-directory" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-purple-400" />
                  <span>Diagnostic Centres</span>
                </Link>
              </li>
              <li>
                <Link to="/healthcare-directory" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  <span>Healthcare Directory</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Newsletter (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
              Contact
            </h4>
            
            <div className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Pune, Maharashtra, India</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <a href="mailto:support@cliniccare.com" className="hover:text-cyan-300 transition-colors">
                  support@cliniccare.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <a href="tel:+912026127000" className="hover:text-cyan-300 transition-colors font-mono">
                  +91 20 2612 7000
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-400 font-medium">Support available 24/7</span>
              </div>
            </div>

            {/* 12. FOOTER NEWSLETTER */}
            <div className="pt-3">
              <h5 className="text-xs font-bold text-white mb-1.5">
                Stay Connected With ClinicCare
              </h5>
              <p className="text-[11px] text-slate-400 mb-2.5">
                Receive Pune medical directory alerts and seasonal health guidelines.
              </p>

              {subscribed ? (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-2 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Thank you for subscribing!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setNewsletterError('');
                      }}
                      placeholder="Enter your email"
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all pr-10"
                    />
                    <button
                      type="submit"
                      aria-label="Subscribe to newsletter"
                      className="absolute right-1 top-1 bottom-1 px-2.5 bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                  {newsletterError && (
                    <p className="text-[11px] text-rose-400">
                      {newsletterError}
                    </p>
                  )}
                </form>
              )}
            </div>

          </div>

        </div>

        {/* 13. FOOTER BOTTOM BAR */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          
          <div className="flex items-center gap-2">
            <span>© 2026 ClinicCare. All Rights Reserved.</span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <div className="hidden sm:flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>All systems operational</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-slate-400">
            <Link to="/about" className="hover:text-cyan-300 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/about" className="hover:text-cyan-300 transition-colors">
              Terms of Service
            </Link>
            <Link to="/about" className="hover:text-cyan-300 transition-colors">
              Medical Disclaimer
            </Link>
            <Link to="/contact" className="hover:text-cyan-300 transition-colors">
              Contact Us
            </Link>

            {/* Back-to-Top Button */}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-blue-600 border border-slate-700/80 hover:border-blue-500 text-slate-300 hover:text-white transition-all duration-200 ml-2 cursor-pointer"
              title="Back to Top"
              aria-label="Scroll back to top"
            >
              <span>Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </footer>
  );
}