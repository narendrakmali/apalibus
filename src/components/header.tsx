
'use client';

import Link from 'next-intl/link';
import { Button } from "./ui/button";
import { BusFront } from "lucide-react";
import { useFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next-intl/navigation";
import { Skeleton } from "./ui/skeleton";
import { useUserRole } from "@/hooks/use-user-role";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./language-switcher";

export default function Header() {
  const { user, auth, isUserLoading } = useFirebase();
  const { role, isLoading: isRoleLoading } = useUserRole();
  const router = useRouter();
  const t = useTranslations('Header');

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-card shadow-sm border-b">
      <Link href="/" className="flex items-center justify-center">
        <BusFront className="h-6 w-6 text-primary" />
        <span className="ml-2 text-lg font-bold font-inter">{t('title')}</span>
      </Link>
      <nav className="ml-auto flex gap-2 sm:gap-4 items-center">
        {isUserLoading || isRoleLoading ? (
           <div className="flex gap-4 sm:gap-6 items-center">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
        ) : user ? (
          <>
            {role === 'operator' && (
              <Link
                href="/operator/dashboard"
                className="text-sm font-medium hover:underline underline-offset-4"
              >
                {t('operatorDashboard')}
              </Link>
            )}
             {role === 'user' && (
              <Link
                href="/dashboard/bookings"
                className="text-sm font-medium hover:underline underline-offset-4"
              >
                {t('myBookings')}
              </Link>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} aria-label={t('logout')}>
                {t('logout')}
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/user-login">{t('userLogin')}</Link>
            </Button>
             <Button variant="outline" size="sm" asChild>
              <Link href="/operator-login">{t('operatorLogin')}</Link>
            </Button>
          </>
        )}
        <LanguageSwitcher />
      </nav>
    </header>
  );
}
