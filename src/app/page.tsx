
'use client';

import React, { useState } from 'react';
import { 
  Bus, Train, Home, FileText, Upload, Download, 
  Calendar, MapPin, Users, CheckCircle, Menu, X, FilePen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

// --- COMPONENT 1: SIDEBAR NAVIGATION ---
const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }: { activeTab: string, setActiveTab: (tab: string) => void, isOpen: boolean, setIsOpen: (isOpen: boolean) => void}) => {
  const menuItems = [
    { id: 'request-quote', label: 'Request a Quote', icon: <FilePen size={20} />, href: '/request-quote' },
    { id: 'msrtc', label: 'MSRTC Booking', icon: <Bus size={20} />, href: '/msrtc-booking' },
    { id: 'train', label: 'Train Arrivals', icon: <Train size={20} />, href: '#' },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
      <div className="flex items-center justify-between p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center font-bold">SNM</div>
          <span className="font-bold text-lg">Transport Seva</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400">
          <X size={24} />
        </button>
      </div>

      <nav className="mt-6 px-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
            <span className="font-bold text-sm">BC</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Branch Coordinator</p>
            <p className="text-xs text-slate-400">Branch: Chembur</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN LAYOUT CONTAINER ---
const DashboardLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('request-quote');

  const renderContent = () => {
    return (
        <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Private Bus Request</CardTitle>
                    <FilePen size={18} className="text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-slate-500 text-sm mb-4">The easiest way to book a bus. Just tell us your needs and we'll send you a quote.</p>
                    <Button asChild>
                        <Link href="/request-quote">Request a Quote</Link>
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">MSRTC(ST) Bus Request</CardTitle>
                    <Bus size={18} className="text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-slate-500 text-sm mb-4">Submit a formal request for group booking with MSRTC, including concessions.</p>
                    <Button asChild>
                        <Link href="/msrtc-booking">New MSRTC(ST) Request</Link>
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Track Requests</CardTitle>
                    <MapPin size={18} className="text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-slate-500 text-sm mb-4">Check the status of your submitted private and MSRTC booking requests.</p>
                    <Button asChild variant="outline">
                        <Link href="/track-status">Check Status</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
        </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        setIsOpen={setSidebarOpen} 
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Toggle */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-600">
            <Menu size={24} />
          </button>
          <span className="font-bold text-slate-800">Samagam Transport</span>
        </header>

        {/* Main Content Scroll Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};


export default DashboardLayout;
