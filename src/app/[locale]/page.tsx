
'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { Bus, Car, FileText, Activity, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const t = useTranslations('Dashboard');

  const cards = [
    {
      title: t('privateBusRequest'),
      desc: t('privateBusDescription'),
      icon: <FileText className="w-8 h-8 text-orange-600" />,
      href: "/request-quote",
      color: "bg-orange-50 border-orange-200",
      btnColor: "text-orange-600",
      buttonText: t('requestQuoteButton')
    },
    {
      title: t('msrtcBusRequest'),
      desc: t('msrtcDescription'),
      icon: <Bus className="w-8 h-8 text-blue-600" />,
      href: "/msrtc-booking",
      color: "bg-blue-50 border-blue-200",
      btnColor: "text-blue-600",
      buttonText: t('newMsrtcRequestButton')
    },
    {
      title: t('informTransport'),
      desc: t('informTransportDescription'),
      icon: <Car className="w-8 h-8 text-emerald-600" />,
      href: "/inform-transport",
      color: "bg-emerald-50 border-emerald-200",
      btnColor: "text-emerald-600",
      buttonText: t('submitVehicleInfoButton')
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('sidebarTitle')}</h1>
          <p className="text-slate-500 mt-1">{t('coordinator')}: {t('sidebarSubtitle')}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/track-status" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 font-medium transition">
            <Activity className="w-4 h-4" />
            {t('trackStatus')}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500">Total Requests</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">24</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500">Pending Approval</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">12</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500">Confirmed Vehicles</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">8</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-slate-800 pt-4">Create New Request</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className={`h-full p-6 rounded-2xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-white hover:border-slate-300 flex flex-col`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${card.color}`}>
                {card.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{card.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">{card.desc}</p>
              <Link href={card.href} className="group">
                <div className={`flex items-center font-semibold text-sm ${card.btnColor}`}>
                  {card.buttonText} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
        ))}
      </div>
    </div>
  );
}
