
'use client';

import Link from 'next/link';
import { Button } from "./ui/button";
import { BusFront } from "lucide-react";
import { useFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from 'next/navigation';
import { Skeleton } from "./ui/skeleton";
import { useUserRole } from "@/hooks/use-user-role";

export default function Header() {
  const { user, auth, isUserLoading } = useFirebase();
  const { role, isLoading: isRoleLoading } = useUserRole();
  const router = useRouter();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  const navLinks = [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/search", label: "Book Now" },
  ]

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-card shadow-sm border-b sticky top-0 z-50">
      <Link href="/" className="flex items-center justify-center mr-6">
        <BusFront className="h-6 w-6 text-primary" />
        <span className="ml-2 text-lg font-bold font-inter">Sakpal Travels</span>
      </Link>
      
      <nav className="hidden md:flex gap-4 sm:gap-6 items-center">
        {navLinks.map(link => (
             <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
        ))}
      </nav>

      <nav className="ml-auto flex gap-2 sm:gap-4 items-center">
        {isUserLoading || isRoleLoading ? (
           <div className="flex gap-4 sm:gap-6 items-center">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
        ) : user ? (
          <>
            {role === 'operator' && (
              <Button variant="ghost" size="sm" asChild>
                  <Link href="/operator/dashboard">Operator Dashboard</Link>
              </Button>
            )}
             {role === 'admin' && (
              <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/dashboard">Admin Dashboard</Link>
              </Button>
            )}
             {role === 'user' && (
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/bookings">My Bookings</Link>
                </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout} aria-label="Logout">
                Logout
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/user-login">Login</Link>
            </Button>
             <Button size="sm" asChild>
              <Link href="/register">Register</Link>
            </Button>
          </>
        )}
      </nav>
    </header>
  );
}

    