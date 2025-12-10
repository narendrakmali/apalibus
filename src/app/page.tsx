'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Bus, Train, Users, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import placeholderImages from '@/lib/placeholder-images.json';

const SamagamLoginPage = () => {
  const [branchCode, setBranchCode] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Attempting login for Branch: ${branchCode}`);
    // Firebase Auth logic would be added here
  };

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
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-md mx-auto w-full">
            <h3 className="text-2xl font-bold text-slate-800 mb-1">Coordinator Login</h3>
            <p className="text-slate-500 mb-6 text-sm">Enter your Branch details to continue</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Branch Code / User ID</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="e.g. SNM-MUM-01"
                  value={branchCode}
                  onChange={(e) => setBranchCode(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-blue-600" />
                  <span className="text-slate-600">Remember me</span>
                </label>
                <a href="#" className="text-blue-600 hover:underline font-medium">Need Help?</a>
              </div>

              <button 
                type="submit" 
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
              >
                Access Dashboard <ArrowRight size={18} />
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400">
                Authorized access only. All actions are monitored by the Central Transport Committee.
              </p>
            </div>
          </div>

        </div>
      </main>
  );
};

export default SamagamLoginPage;
