
'use client';

import Link from 'next/link';
import { Button } from "./ui/button";
import { Phone, Shield, LogOut, Bus, MapPin, Search, User } from "lucide-react";
import { useAuth, useFirestore } from '@/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const auth = useAuth();
  const firestore = useFirestore();
  const [user, authLoading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const [clientLoaded, setClientLoaded] = useState(false);

  useEffect(() => {
    setClientLoaded(true);
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
  
  // Hide header on the main page to avoid duplication with dashboard header
  if (pathname === '/') {
    return null;
  }


  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left Side: Logo and Branding */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
              SNM
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Transport Seva</h1>
              <p className="text-xs text-slate-500">59th Annual Samagam, Sangli</p>
            </div>
          </Link>
        </div>

        {/* Right Side: Nav and Actions */}
        <div className="flex items-center gap-4">
          
           <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Button variant="ghost" asChild>
                <Link href="/"><Search className="mr-2 h-4 w-4"/>Dashboard</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/request-quote"><Bus className="mr-2 h-4 w-4"/>Request Quote</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/track-status"><MapPin className="mr-2 h-4 w-4"/>Track Status</Link>
              </Button>
          </nav>
            
          <div className="flex items-center gap-2">
            {(authLoading || !clientLoaded) ? null : user ? (
                <>
                {isAdmin && (
                    <Button asChild variant="outline" size="sm">
                        <Link href="/admin"><Shield className="mr-2 h-4 w-4" />Admin</Link>
                    </Button>
                )}
                <Button onClick={handleLogout} variant="secondary" size="sm">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
                </>
            ) : (
                <Button asChild size="sm">
                  <Link href="/"><User className="mr-2 h-4 w-4"/> Branch-Coordinator Login</Link>
                </Button>
            )}
           </div>

        </div>
      </div>
    </header>
  );
}
