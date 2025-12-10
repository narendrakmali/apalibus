
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Bus, Train, Users, Phone, ArrowRight, ShieldCheck, Mail, Lock, UserPlus, LogIn, MapPin } from 'lucide-react';
import placeholderImages from '@/lib/placeholder-images.json';

const AuthCard = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [authMethod, setAuthMethod] = useState('mobile'); // 'mobile' or 'email'
  
  // Form States
  const [identifier, setIdentifier] = useState(''); // Holds Phone or Email
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('');

  // Simulation Logic
  const handleSendOTP = () => {
    if (!identifier) return alert("Please enter your Mobile or Email");
    setOtpSent(true);
    alert(`OTP sent to ${identifier} (Simulated: 1234)`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
      // Registration Logic
      console.log("Registering:", { identifier, password, selectedBranch, otp });
      alert("Registration Successful! Welcome, Coordinator.");
    } else {
      // Login Logic
      console.log("Logging in:", { identifier, password });
      alert("Login Successful! Redirecting to Dashboard...");
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-md mx-auto w-full transition-all duration-300">
      
      {/* Header: Toggle between Login & Register */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-slate-800">
          {isRegistering ? 'Coordinator Sign Up' : 'Coordinator Login'}
        </h3>
        <button 
          onClick={() => { setIsRegistering(!isRegistering); setOtpSent(false); }}
          className="text-sm text-blue-600 font-medium hover:bg-blue-50 px-3 py-1 rounded-full transition"
        >
          {isRegistering ? 'Back to Login' : 'New User?'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Toggle: Mobile vs Email (Only visible during Registration) */}
        {isRegistering && (
          <div className="flex bg-slate-100 p-1 rounded-lg mb-2">
            <button
              type="button"
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition ${authMethod === 'mobile' ? 'bg-white shadow text-blue-700' : 'text-slate-500'}`}
              onClick={() => setAuthMethod('mobile')}
            >
              <Phone size={16} /> Mobile
            </button>
            <button
              type="button"
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition ${authMethod === 'email' ? 'bg-white shadow text-blue-700' : 'text-slate-500'}`}
              onClick={() => setAuthMethod('email')}
            >
              <Mail size={16} /> Email
            </button>
          </div>
        )}

        {/* Input: Branch Selection (Only for Registration) */}
        {isRegistering && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Your Branch</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
              <select 
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                <option value="">Select Branch...</option>
                <option value="mum-chembur">Mumbai - Chembur</option>
                <option value="pune-nigdi">Pune - Nigdi</option>
                <option value="th-thane">Thane - West</option>
                <option value="other">Other (Type Manually)</option>
              </select>
            </div>
          </div>
        )}

        {/* Input: Mobile or Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {authMethod === 'mobile' ? 'Mobile Number' : 'Email Address'}
          </label>
          <div className="relative">
            {authMethod === 'mobile' ? <Phone className="absolute left-3 top-3 text-slate-400" size={18} /> : <Mail className="absolute left-3 top-3 text-slate-400" size={18} />}
            <input 
              type={authMethod === 'mobile' ? 'tel' : 'email'}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder={authMethod === 'mobile' ? '+91 98765 43210' : 'coordinator@email.com'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
        </div>

        {/* OTP Logic (Only for Registration) */}
        {isRegistering && !otpSent && (
          <button 
            type="button"
            onClick={handleSendOTP}
            className="w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
          >
            Send Verification OTP
          </button>
        )}

        {isRegistering && otpSent && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Enter OTP</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-lg border border-green-300 focus:ring-2 focus:ring-green-500 outline-none bg-green-50 text-center tracking-widest font-bold text-lg"
              placeholder="1 2 3 4"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
               OTP sent to {identifier}
            </p>
          </div>
        )}

        {/* Password Input (For Login AND Registration) */}
        {(otpSent || !isRegistering) && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {isRegistering ? 'Set Password' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="password" 
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isRegistering && !otpSent}
          className={`w-full font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 shadow-lg ${
            isRegistering && !otpSent 
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' 
              : 'bg-blue-700 hover:bg-blue-800 text-white shadow-blue-200'
          }`}
        >
          {isRegistering ? <> <UserPlus size={18} /> Verify & Register</> : <> <LogIn size={18} /> Access Dashboard </>} 
          
        </button>

      </form>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-400">
          {isRegistering 
            ? "Your branch selection will be verified by the Zonal Admin."
            : "Trouble logging in? Contact your Zonal Pramukh."}
        </p>
      </div>
    </div>
  );
};


const SamagamLoginPage = () => {

  return (
      <main className="flex-grow flex items-center justify-center relative p-4">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
           <Image
            src={placeholderImages.samagamGround.src}
            alt={placeholderImages.samagamGround.alt}
            data-ai-hint={placeholderImages.samagamGround.hint}
            fill
            className="object-cover opacity-10"
            priority
           />
           <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 opacity-80"></div>
        </div>

        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 z-10 items-center">
          
          {/* Left Column: Welcome & Updates */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
              <ShieldCheck size={16} /> Official Transport Portal
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 leading-tight">
              Welcome to the <br />
              <span className="text-blue-700">Digital Sewa Platform</span>
            </h2>
            <p className="text-lg text-slate-600">
              Dhan Nirankar Ji. This portal assists Branch Mukhis in managing travel plans for the upcoming Samagam. 
              Please log in to submit bus demands, train arrival data, and vehicle pass requests.
            </p>
            
            {/* Quick Stats / Info Cards */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                <Bus className="mx-auto text-blue-600 mb-2" />
                <div className="font-bold text-slate-800">MSRTC</div>
                <div className="text-xs text-slate-500">Bus Booking</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                <Train className="mx-auto text-orange-600 mb-2" />
                <div className="font-bold text-slate-800">Train</div>
                <div className="text-xs text-slate-500">Arrivals</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                <Users className="mx-auto text-green-600 mb-2" />
                <div className="font-bold text-slate-800">3 Lakh+</div>
                <div className="text-xs text-slate-500">Devotees</div>
              </div>
            </div>
          </div>

          {/* Right Column: Login Form */}
          <AuthCard />

        </div>
      </main>
  );
};

export default SamagamLoginPage;

    