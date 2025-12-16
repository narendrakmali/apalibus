'use client';

import { useState, useEffect } from 'react';
import { Link, usePathname } from '@/navigation';
import { useAuth, useFirestore } from '@/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Menu, X, Bus, LogOut, User, Shield, MapPin, Search } from 'lucide-react';
import { Button } from './ui/button';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './language-switcher';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const auth = useAuth();
  const firestore = useFirestore();
  const [user, authLoading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const t = useTranslations('Header');

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() && userDoc.data().isAdmin) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
            console.error("Failed to check admin status:", error);
            setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    checkAdminStatus();
  }, [user, firestore]);

  const navLinks = [
    { name: t('dashboard'), href: '/', icon: Search },
    { name: t('requestQuote'), href: '/request-quote', icon: Bus },
    { name: t('trackStatus'), href: '/track-status', icon: MapPin },
  ];

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    await auth.signOut();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 header-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
               <div className="w-10 h-10 bg-white border-2 border-primary/50 rounded-full flex items-center justify-center text-primary font-bold">
                SNM
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 hidden sm:block">{t('title')}</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">{t('subtitle')}</p>
                 <span className="font-bold text-xl text-slate-900 sm:hidden">
                    {t('title')}
                 </span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Button variant="ghost" asChild key={link.href}>
                <Link
                  href={link.href as any}
                  className={isActive(link.href) ? 'text-primary font-semibold' : 'text-slate-600'}
                >
                  <link.icon className="mr-2 h-4 w-4" />
                  {link.name}
                </Link>
              </Button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
             {(authLoading) ? null : user ? (
                <>
                {isAdmin && (
                    <Button asChild variant="outline" size="sm">
                        <Link href={"/admin" as any}><Shield className="mr-2 h-4 w-4" />{t('admin')}</Link>
                    </Button>
                )}
                <Button onClick={handleLogout} variant="secondary" size="sm">
                    <LogOut className="mr-2 h-4 w-4" /> {t('logout')}
                </Button>
                </>
            ) : (
                <Button asChild size="sm">
                  <Link href="/"><User className="mr-2 h-4 w-4"/>{t('login')}</Link>
                </Button>
            )}
             <div className="border-l border-slate-200 h-6"></div>
            <LanguageSwitcher />
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-3 py-3 rounded-md text-base font-medium ${
                  isActive(link.href)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <link.icon className="mr-3 h-5 w-5" />
                {link.name}
              </Link>
            ))}
            <div className="border-t border-slate-100 mt-2 pt-2">
             {(authLoading) ? null : user ? (
                <>
                {isAdmin && (
                  <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center w-full text-left px-3 py-3 text-base font-medium text-slate-600 hover:bg-slate-50 rounded-md">
                    <Shield className="mr-3 h-5 w-5" />
                    {t('admin')}
                  </Link>
                )}
                 <button 
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    {t('logout')}
                  </button>
                </>
            ) : (
                 <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center w-full text-left px-3 py-3 text-base font-medium text-slate-600 hover:bg-slate-50 rounded-md">
                    <User className="mr-3 h-5 w-5" />
                    {t('login')}
                  </Link>
            )}
             <div className="border-t border-slate-100 my-2"></div>
             <div className="px-2 py-2">
                <LanguageSwitcher />
             </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
