import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import Appointments from './pages/Appointments';
import BookAppointment from './pages/BookAppointment';
import Ambulance from './pages/Ambulance';
import BloodSearch from './pages/BloodSearch';
import Facilities from './pages/Facilities';
import Hospitals from './pages/Hospitals';
import BloodBanks from './pages/BloodBanks';
import EyeCare from './pages/EyeCare';
import HealthcareDirectory from './pages/HealthcareDirectory';
import Emergency from './pages/Emergency';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import About from './pages/About';
import AIDoctor from './pages/AIDoctor';
import DoctorDashboard from './pages/DoctorDashboard';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AIChatbot from './components/AIChatbot';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<PatientDashboard />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/ambulance" element={<Ambulance />} />
            <Route path="/blood-search" element={<BloodSearch />} />
            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="/blood-banks" element={<BloodBanks />} />
            <Route path="/eye-care" element={<EyeCare />} />
            <Route path="/healthcare-directory" element={<HealthcareDirectory />} />
            <Route path="/facilities" element={<Facilities />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/ai-doctor" element={<AIDoctor />} />
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <AIChatbot />
        <Footer />
        <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
