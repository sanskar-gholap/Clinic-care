const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const componentsDir = path.join(srcDir, 'components');
const pagesDir = path.join(srcDir, 'pages');

[componentsDir, pagesDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const files = {
  'components/Navbar.jsx': `import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Menu, Bell, User } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary-500 p-2 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">CareConnect</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Home</Link>
            <Link to="/appointments" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Appointments</Link>
            <Link to="/facilities" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Facilities</Link>
            <Link to="/contact" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Contact</Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Log in</Link>
            <Link to="/register" className="btn-primary">Get Started</Link>
          </div>
          <div className="flex items-center md:hidden">
            <button className="text-gray-500 hover:text-gray-700">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}`,
  'components/Footer.jsx': `import React from 'react';
import { Activity } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary-500 p-2 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">CareConnect</span>
            </div>
            <p className="text-sm text-gray-400">
              Transforming healthcare coordination with modern technology and seamless experiences.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/appointments" className="hover:text-primary-400 transition-colors">Appointments</a></li>
              <li><a href="/ambulance" className="hover:text-primary-400 transition-colors">Ambulance</a></li>
              <li><a href="/blood-search" className="hover:text-primary-400 transition-colors">Blood Search</a></li>
              <li><a href="/emergency" className="hover:text-primary-400 transition-colors">Emergency</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="hover:text-primary-400 transition-colors">About Us</a></li>
              <li><a href="/contact" className="hover:text-primary-400 transition-colors">Contact</a></li>
              <li><a href="/faq" className="hover:text-primary-400 transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 text-sm text-center text-gray-500">
          © {new Date().getFullYear()} CareConnect. All rights reserved.
        </div>
      </div>
    </footer>
  );
}`,
  'pages/Home.jsx': `import React from 'react';
import { ArrowRight, Activity, HeartPulse, Clock, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white pt-20 pb-32">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-primary-50 rounded-l-[100px] opacity-50 hidden lg:block"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold mb-6">
                <span className="flex h-2 w-2 rounded-full bg-primary-600 mr-2"></span>
                Modern Healthcare Platform
              </div>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                <span className="block xl:inline">Healthcare coordination,</span>{' '}
                <span className="block text-primary-600 xl:inline">simplified for you.</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                CareConnect brings patients, doctors, and facilities together in one seamless platform. Experience healthcare that revolves around you.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0 flex gap-4">
                <Link to="/register" className="btn-primary px-8 py-3 text-lg">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link to="/book-appointment" className="btn-secondary px-8 py-3 text-lg">
                  Book Appointment
                </Link>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-2xl shadow-xl lg:max-w-md overflow-hidden bg-white">
                <div className="h-64 bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-center">
                  <Activity className="h-24 w-24 text-white opacity-90" />
                </div>
                <div className="p-6 bg-white">
                  <h3 className="text-lg font-medium text-gray-900">Premium Care Features</h3>
                  <div className="mt-4 space-y-3">
                    {[
                      { icon: HeartPulse, text: 'Instant Blood Search & Matching' },
                      { icon: Clock, text: '24/7 Ambulance Dispatch' },
                      { icon: Shield, text: 'Secure Patient Records' }
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center text-gray-600">
                        <feature.icon className="h-5 w-5 text-primary-500 mr-3" />
                        <span>{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}`,
  'pages/PatientDashboard.jsx': `import React from 'react';

export default function PatientDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Patient Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-500 mb-2">Upcoming Appointments</h3>
          <p className="text-3xl font-bold text-gray-900">2</p>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-500 mb-2">Recent Test Results</h3>
          <p className="text-3xl font-bold text-gray-900">1</p>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-500 mb-2">Active Prescriptions</h3>
          <p className="text-3xl font-bold text-gray-900">3</p>
        </div>
      </div>
      
      <div className="card">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-10">
            <p className="text-gray-500">No recent activity found.</p>
          </div>
        </div>
      </div>
    </div>
  );
}`,
  'pages/Appointments.jsx': `import React from 'react';

export default function Appointments() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
        <a href="/book-appointment" className="btn-primary">Book New</a>
      </div>
      <div className="card">
        <div className="p-6 text-center py-16">
          <p className="text-gray-500 mb-4">You don't have any appointments scheduled.</p>
          <a href="/book-appointment" className="btn-secondary">Schedule an Appointment</a>
        </div>
      </div>
    </div>
  );
}`,
  'pages/BookAppointment.jsx': `import React from 'react';

export default function BookAppointment() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Book an Appointment</h1>
      <div className="card p-8">
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
            <select className="input-field">
              <option>General Practice</option>
              <option>Cardiology</option>
              <option>Dermatology</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input type="time" className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for visit</label>
            <textarea rows={4} className="input-field"></textarea>
          </div>
          <button type="button" className="btn-primary w-full">Confirm Booking</button>
        </form>
      </div>
    </div>
  );
}`,
  'pages/Login.jsx': `import React from 'react';

export default function Login() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 card p-10">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        </div>
        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input type="email" required className="input-field" placeholder="Email address" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" required className="input-field" placeholder="Password" />
            </div>
          </div>
          <button type="button" className="btn-primary w-full py-3">Sign in</button>
        </form>
      </div>
    </div>
  );
}`,
  'pages/Register.jsx': `import React from 'react';

export default function Register() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 card p-10">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
        </div>
        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" required className="input-field" placeholder="Full Name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input type="email" required className="input-field" placeholder="Email address" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" required className="input-field" placeholder="Password" />
            </div>
          </div>
          <button type="button" className="btn-primary w-full py-3">Register</button>
        </form>
      </div>
    </div>
  );
}`,
  'pages/Ambulance.jsx': `import React from 'react';

export default function Ambulance() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Ambulance Services</h1>
      <div className="card p-10 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Emergency Dispatch</h2>
        <p className="text-gray-600 mb-8 max-w-xl mx-auto">Request an ambulance immediately to your current location.</p>
        <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full shadow-lg text-xl transition-transform hover:scale-105">
          Call Ambulance Now
        </button>
      </div>
    </div>
  );
}`,
  'pages/BloodSearch.jsx': `import React from 'react';

export default function BloodSearch() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Blood Availability Search</h1>
      <div className="card p-6 mb-8 bg-gradient-to-r from-red-50 to-white">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
            <select className="input-field">
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>O+</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Location / Pincode</label>
            <input type="text" className="input-field" placeholder="Enter pincode" />
          </div>
          <div className="flex items-end">
            <button className="btn-primary">Search</button>
          </div>
        </div>
      </div>
    </div>
  );
}`,
  'pages/Facilities.jsx': `import React from 'react';

export default function Facilities() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Healthcare Facilities</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="card p-6 hover:shadow-md transition-shadow">
            <div className="h-40 bg-gray-100 rounded-lg mb-4"></div>
            <h3 className="font-bold text-lg mb-2">City General Hospital</h3>
            <p className="text-gray-500 text-sm mb-4">123 Healthcare Ave, Medical District</p>
            <button className="btn-secondary w-full">View Details</button>
          </div>
        ))}
      </div>
    </div>
  );
}`,
  'pages/Emergency.jsx': `import React from 'react';

export default function Emergency() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Emergency Requests</h1>
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700 font-medium">
              If you are experiencing a life-threatening medical emergency, call 911 immediately.
            </p>
          </div>
        </div>
      </div>
      <div className="card p-6">
        <h3 className="font-medium text-lg mb-4">Current Emergency Status</h3>
        <p className="text-gray-500">No active emergency requests.</p>
      </div>
    </div>
  );
}`,
  'pages/Profile.jsx': `import React from 'react';

export default function Profile() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Profile</h1>
      <div className="card p-8">
        <div className="flex items-center space-x-6 mb-8">
          <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-700 font-bold text-3xl">JD</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">John Doe</h2>
            <p className="text-gray-500">Patient ID: #847294</p>
          </div>
        </div>
        <hr className="mb-8" />
        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input type="text" defaultValue="John" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" defaultValue="Doe" className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" defaultValue="john.doe@example.com" className="input-field" />
          </div>
          <button type="button" className="btn-primary">Save Changes</button>
        </form>
      </div>
    </div>
  );
}`,
  'pages/AdminDashboard.jsx': `import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6 bg-gradient-to-br from-primary-500 to-primary-700 text-white">
          <h3 className="text-primary-100 mb-1">Total Patients</h3>
          <p className="text-3xl font-bold">12,450</p>
        </div>
        <div className="card p-6 bg-white">
          <h3 className="text-gray-500 mb-1">Appointments Today</h3>
          <p className="text-3xl font-bold text-gray-900">142</p>
        </div>
        <div className="card p-6 bg-white">
          <h3 className="text-gray-500 mb-1">Active Staff</h3>
          <p className="text-3xl font-bold text-gray-900">48</p>
        </div>
        <div className="card p-6 bg-white">
          <h3 className="text-gray-500 mb-1">System Health</h3>
          <p className="text-3xl font-bold text-green-600">99.9%</p>
        </div>
      </div>
      <div className="card p-6">
        <h3 className="font-medium text-lg mb-4">Recent Appointments</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Sarah Smith</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Dr. Johnson</td>
              <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Completed</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}`,
  'pages/FAQ.jsx': `import React from 'react';

export default function FAQ() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h1>
      <div className="space-y-6">
        {[1,2,3,4].map(i => (
          <div key={i} className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">How do I book an appointment?</h3>
            <p className="text-gray-600">You can easily book an appointment by navigating to the Appointments section in your dashboard and clicking on "Book New". Select your preferred specialty, date, and time.</p>
          </div>
        ))}
      </div>
    </div>
  );
}`,
  'pages/Contact.jsx': `import React from 'react';

export default function Contact() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Contact Us</h1>
      <div className="card p-8">
        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea rows={5} className="input-field"></textarea>
          </div>
          <button type="button" className="btn-primary">Send Message</button>
        </form>
      </div>
    </div>
  );
}`,
  'pages/About.jsx': `import React from 'react';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About CareConnect</h1>
        <p className="text-xl text-gray-500">We are on a mission to simplify healthcare coordination and make quality care accessible to everyone.</p>
      </div>
      <div className="card p-10 bg-gradient-to-r from-primary-500 to-primary-700 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">To create a seamless healthcare ecosystem where patients, providers, and facilities can coordinate effectively to deliver the best possible care outcomes.</p>
      </div>
    </div>
  );
}`
};

Object.entries(files).forEach(([file, content]) => {
  fs.writeFileSync(path.join(srcDir, file), content);
});

console.log('Successfully generated all components and pages.');
