
'use client';

import { Link, usePathname, useRouter } from '@/navigation';
import { Button } from "./ui/button";
import { LogOut, Bus, MapPin, Search, User, Globe, Shield } from "lucide-react";
import { useAuth, useFirestore } from '@/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const LanguageSwitcher = () => {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations('Header');

    const switchLocale = (nextLocale: string) => {
        router.replace(pathname, { locale: nextLocale });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                    <Globe className="h-4 w-4 mr-2" />
                    <span>{t('language')}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => switchLocale('en')}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchLocale('hi')}>हिंदी (Hindi)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchLocale('mr')}>मराठी (Marathi)</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};


export default function Header() {
  const auth = useAuth();
  const firestore = useFirestore();
  const [user, authLoading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const [clientLoaded, setClientLoaded] = useState(false);
  const t = useTranslations('Header');

  useEffect(() => {
    setClientLoaded(true);
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

  const handleLogout = async () => {
    await auth.signOut();
  };

  return (
    <header className="bg-card shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
              SNM
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{t('title')}</h1>
              <p className="text-xs text-muted-foreground">{t('subtitle')}</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
           <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
              <Button variant="ghost" asChild>
                <Link href="/"><Search className="mr-2 h-4 w-4"/>{t('dashboard')}</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/request-quote"><Bus className="mr-2 h-4 w-4"/>{t('requestQuote')}</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/track-status"><MapPin className="mr-2 h-4 w-4"/>{t('trackStatus')}</Link>
              </Button>
          </nav>

          <div className="flex items-center gap-2">
            {(authLoading || !clientLoaded) ? null : user ? (
                <>
                {isAdmin && (
                    <Button asChild variant="outline" size="sm">
                        <Link href="/admin"><Shield className="mr-2 h-4 w-4" />{t('admin')}</Link>
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
             <div className="h-6 border-l border-slate-200 mx-2"></div>
            <LanguageSwitcher />
           </div>

        </div>
      </div>
    </header>
  );
}
