
'use client';

import React, { useState } from 'react';
import {
  Bus, Train, Home, FileText, Upload, Download,
  Calendar, MapPin, Users, CheckCircle, Menu, X, FilePen, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';

// --- COMPONENT 1: SIDEBAR NAVIGATION ---
const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }: { activeTab: string, setActiveTab: (tab: string) => void, isOpen: boolean, setIsOpen: (isOpen: boolean) => void}) => {
  const t = useTranslations('Dashboard');
  const menuItems = [
    { id: 'request-quote', label: t('privateBusRequest'), icon: <FilePen size={20} />, href: '/request-quote' },
    { id: 'msrtc', label: t('msrtcBusRequest'), icon: <Bus size={20} />, href: '/msrtc-booking' },
    { id: 'inform-transport', label: t('informTransport'), icon: <Info size={20} />, href: '/inform-transport' },
    { id: 'track-status', label: t('trackStatus'), icon: <MapPin size={20} />, href: '/track-status' },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-60 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
      <div className="flex items-center justify-between p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center font-bold">SNM</div>
          <span className="font-bold text-lg">{t('sidebarTitle')}</span>
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
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === item.id
                ? 'bg-primary text-white shadow-lg'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {React.cloneElement(item.icon, { className: `transition-colors ${activeTab === item.id ? 'text-white' : 'text-slate-400'}` })}
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
            <p className="text-sm font-medium text-white">{t('coordinator')}</p>
            <p className="text-xs text-slate-400">{t('sidebarSubtitle')}</p>
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
  const t = useTranslations('Dashboard');

  const renderContent = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-semibold">{t('privateBusRequest')}</CardTitle>
                    <FilePen size={18} className="text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">{t('privateBusDescription')}</p>
                    <Button asChild>
                        <Link href="/request-quote">{t('requestQuoteButton')}</Link>
                    </Button>
                </CardContent>
            </Card>
            <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-semibold">{t('msrtcBusRequest')}</CardTitle>
                    <Bus size={18} className="text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">{t('msrtcDescription')}</p>
                    <Button asChild>
                        <Link href="/msrtc-booking">{t('newMsrtcRequestButton')}</Link>
                    </Button>
                </CardContent>
            </Card>
             <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-semibold">{t('informTransport')}</CardTitle>
                    <Info size={18} className="text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">{t('informTransportDescription')}</p>
                    <Button asChild>
                        <Link href="/inform-transport">{t('submitVehicleInfoButton')}</Link>
                    </Button>
                </CardContent>
            </Card>
            <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-semibold">{t('trackStatus')}</CardTitle>
                    <MapPin size={18} className="text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">{t('trackStatusDescription')}</p>
                    <Button asChild variant="outline">
                        <Link href="/track-status">{t('checkStatusButton')}</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Toggle */}
        <header className="md:hidden bg-card border-b p-4 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-foreground/80">
            <Menu size={24} />
          </button>
          <span className="font-bold text-foreground">Samagam Transport</span>
        </header>

        {/* Main Content Scroll Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};


export default DashboardLayout;
