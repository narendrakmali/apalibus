

'use client';

import React from 'react';
import Image from 'next/image';
import { Bus, Train, Users, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import placeholderImages from '@/lib/placeholder-images.json';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
              Dhan Nirankar Ji. This portal assists in managing travel plans for the upcoming Samagam. 
              You can submit bus demands, train arrival data, and vehicle pass requests.
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

          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-md mx-auto w-full">
             <h3 className="text-2xl font-bold text-slate-800 mb-4">Get Started</h3>
             <p className="text-slate-500 mb-6">Proceed to the dashboard to access all transport-related tools and submit your requests.</p>
             <Button asChild className="w-full font-bold py-6 text-lg" size="lg">
                <Link href="/search">
                    Go to Dashboard <ArrowRight className="ml-2" size={20} />
                </Link>
             </Button>
             <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400">
                    For any questions, please contact your Zonal Pramukh or the central helpdesk.
                </p>
            </div>
          </div>

        </div>
      </main>
  );
};

export default SamagamLoginPage;
