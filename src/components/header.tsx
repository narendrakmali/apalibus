'use client';

import Link from 'next/link';
import { Button } from "./ui/button";
import { Phone, Shield } from "lucide-react";
import { useAuth } from '@/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function Header() {
  const auth = useAuth();
  const [user, authLoading] = useAuthState(auth);

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          {/* Placeholder for SNM Logo */}
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
            SNM
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Samagam Transport Seva</h1>
            <p className="text-xs text-slate-500">59th Annual Nirankari Sant Samagam, Sangli</p>
          </div>
        </div>

        {/* Center - Title for larger screens */}
        <div className="hidden lg:block absolute left-1/2 -translate-x-1/2">
            <h2 className="text-lg font-semibold text-slate-700">59th Annual Nirankari Sant Samagam</h2>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
           <div className="hidden md:flex items-center gap-2 text-blue-800 bg-blue-50 px-4 py-2 rounded-full">
            <Phone size={18} />
            <span className="font-semibold text-sm">Helpline: +91 98765 43210</span>
          </div>

          {user && !user.isAnonymous && (
             <Button asChild variant="outline" size="sm">
                <Link href="/admin"><Shield className="mr-2 h-4 w-4" />Admin Dashboard</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

    