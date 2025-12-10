
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Bus, Train, Users, Phone, ArrowRight, ShieldCheck, Mail, Lock, UserPlus, LogIn, MapPin, User, Building, Globe } from 'lucide-react';
import placeholderImages from '@/lib/placeholder-images.json';
import { useAuth, useFirestore } from '@/firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    sendEmailVerification,
    signInWithPhoneNumber, 
    RecaptchaVerifier,
    ConfirmationResult
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useRouter } from 'next/navigation';

// Declare recaptchaVerifier and confirmationResult outside the component
// to persist them across re-renders.
let recaptchaVerifier: RecaptchaVerifier | null = null;
let confirmationResult: ConfirmationResult | null = null;

const AuthCard = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [authMethod, setAuthMethod] = useState('mobile'); 
  
  const [name, setName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [zone, setZone] = useState('');
  const [sewadalUnit, setSewadalUnit] = useState('');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();


  const handleSendOTP = async () => {
    setError('');
    setInfo('');
    if (!identifier) {
      setError("Please enter your Mobile Number or Email.");
      return;
    }
    setIsLoading(true);

    if (authMethod === 'mobile') {
      try {
        if (!recaptchaVerifier) {
            recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
              'size': 'invisible',
            });
        }
        
        confirmationResult = await signInWithPhoneNumber(auth, identifier, recaptchaVerifier);
        setOtpSent(true);
        setInfo(`OTP sent to ${identifier}.`);
      } catch (err: any) {
        console.error("SMS Error:", err);
        setError(`Failed to send OTP: ${err.message}`);
        // Reset verifier if it fails.
        if (recaptchaVerifier) {
            recaptchaVerifier.clear();
            recaptchaVerifier = null;
        }
      }
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setIsLoading(true);

    if (isRegistering) {
        try {
            if (authMethod === 'mobile') {
                if (!confirmationResult) throw new Error("OTP not verified yet.");
                const userCredential = await confirmationResult.confirm(otp);
                const user = userCredential.user;

                // Save user data to Firestore
                const userRef = doc(firestore, 'users', user.uid);
                const userData = {
                    id: user.uid,
                    name,
                    mobileNumber: user.phoneNumber,
                    email: '', // No email in phone auth
                    branchName,
                    zone,
                    sewadalUnit,
                    isAdmin: false
                };
                await setDoc(userRef, userData);
                
                router.push('/admin');

            } else { // Email registration
                const userCredential = await createUserWithEmailAndPassword(auth, identifier, password);
                const user = userCredential.user;
                await sendEmailVerification(user);

                const userRef = doc(firestore, 'users', user.uid);
                const userData = {
                    id: user.uid,
                    name,
                    email: user.email,
                    mobileNumber: '',
                    branchName,
                    zone,
                    sewadalUnit,
                    isAdmin: false
                };
                await setDoc(userRef, userData);

                setInfo("Registration successful! Please check your email for a verification link.");
                setIsRegistering(false);
            }
        } catch (err: any) {
            console.error("Registration Error:", err);
            let userMessage = `Registration failed: ${err.message}`;
            if (err.code === 'auth/email-already-in-use') {
                userMessage = "This email is already registered. Please log in.";
            } else if (err.code === 'auth/invalid-email') {
                userMessage = "Please enter a valid email address.";
            } else if (err.code === 'auth/weak-password') {
                userMessage = "Password is too weak. It must be at least 6 characters long.";
            } else if (err.code === 'auth/invalid-verification-code') {
                userMessage = "Invalid OTP. Please try again.";
            }
            setError(userMessage);
        }
    } else { // Login logic
      try {
        await signInWithEmailAndPassword(auth, identifier, password);
        router.push('/admin');
      } catch (err: any) {
        console.error("Login Error:", err);
        let userMessage = `Login failed: ${err.message}`;
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            userMessage = "Invalid credentials. Please check your login details.";
        }
        setError(userMessage);
      }
    }
    setIsLoading(false);
  };

  const handleToggleRegister = () => {
    setIsRegistering(!isRegistering);
    setOtpSent(false);
    setError('');
    setInfo('');
    setIdentifier('');
    setPassword('');
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-md mx-auto w-full transition-all duration-300">
      
      <div id="recaptcha-container"></div>

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-slate-800">
          {isRegistering ? 'Branch-Coordinator Sign Up' : 'Branch-Coordinator Login'}
        </h3>
        <button 
          onClick={handleToggleRegister}
          className="text-sm text-blue-600 font-medium hover:bg-blue-50 px-3 py-1 rounded-full transition"
        >
          {isRegistering ? 'Back to Login' : 'New User?'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {isRegistering && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Prem Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Branch Name</label>
              <div className="relative">
                <Building className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Chembur"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  required
                />
              </div>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Zone</label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Mumbai"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  required
                />
              </div>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sewadal Unit Number (Optional)</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. 836"
                  value={sewadalUnit}
                  onChange={(e) => setSewadalUnit(e.target.value)}
                />
              </div>
            </div>
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
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {isRegistering 
              ? `Verification ${authMethod === 'mobile' ? 'Mobile Number' : 'Email'}`
              : 'Branch-Coordinator Login ID (Email)'}
          </label>
          <div className="relative">
            {authMethod === 'mobile' && isRegistering ? <Phone className="absolute left-3 top-3 text-slate-400" size={18} /> : <Mail className="absolute left-3 top-3 text-slate-400" size={18} />}
            <input 
              type={authMethod === 'mobile' && isRegistering ? 'tel' : 'email'}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder={authMethod === 'mobile' && isRegistering ? '+91 98765 43210' : 'coordinator@email.com'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
        </div>

        {isRegistering && authMethod === 'mobile' && !otpSent && (
          <button 
            type="button"
            onClick={handleSendOTP}
            disabled={isLoading}
            className="w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Send Verification OTP'}
          </button>
        )}

        {isRegistering && authMethod === 'mobile' && otpSent && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Enter OTP</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-lg border border-green-300 focus:ring-2 focus:ring-green-500 outline-none bg-green-50 text-center tracking-widest font-bold text-lg"
              placeholder="1 2 3 4 5 6"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
        )}

        {( (isRegistering && authMethod === 'mobile' && otpSent) || (isRegistering && authMethod === 'email') || !isRegistering ) && (
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
                required
              />
            </div>
          </div>
        )}

        {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</p>}
        {info && <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">{info}</p>}

        <button 
          type="submit" 
          disabled={isLoading || (isRegistering && authMethod === 'mobile' && !otpSent)}
          className={`w-full font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 shadow-lg disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed disabled:shadow-none bg-blue-700 hover:bg-blue-800 text-white shadow-blue-200`}
        >
            {isLoading ? 'Processing...' : (
                isRegistering ? <><UserPlus size={18} /> Verify & Register</> : <><LogIn size={18} /> Access Dashboard</>
            )}
        </button>

      </form>

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

          <AuthCard />

        </div>
      </main>
  );
};

export default SamagamLoginPage;

    