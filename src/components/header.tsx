'use client';

import Link from 'next/link';
import { Button } from "./ui/button";
import { Phone, Shield, LogOut, Bus, Calculator, Search } from "lucide-react";
import { useAuth, useFirestore } from '@/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export default function Header() {
  const auth = useAuth();
  const firestore = useFirestore();
  const [user, authLoading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().isAdmin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    checkAdminStatus();
  }, [user, firestore]);

  const handleLogout = async () => {
    await auth.signOut();
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left Side: Logo and Branding */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
            SNM
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Samagam Transport Seva</h1>
            <p className="text-xs text-slate-500">59th Annual Samagam, Sangli</p>
          </div>
        </div>

        {/* Right Side: Nav and Actions */}
        <div className="flex items-center gap-4">
          {authLoading ? null : user ? (
            <>
              <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
                  <Button variant="ghost" asChild>
                    <Link href="/msrtc-booking"><Bus className="mr-2 h-4 w-4"/>MSRTC Booking</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/stage-calculator"><Calculator className="mr-2 h-4 w-4"/>Stage Calculator</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/search"><Search className="mr-2 h-4 w-4"/>Private Bus Hire</Link>
                  </Button>
              </nav>
              {isAdmin && (
                  <Button asChild variant="outline" size="sm">
                      <Link href="/admin"><Shield className="mr-2 h-4 w-4" />Admin Panel</Link>
                  </Button>
              )}
              <Button onClick={handleLogout} variant="secondary" size="sm">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
             <div className="hidden md:flex items-center gap-2 text-blue-800 bg-blue-50 px-4 py-2 rounded-full">
              <Phone size={18} />
              <span className="font-semibold text-sm">Helpline: 18001232005</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
