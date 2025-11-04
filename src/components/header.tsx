
'use client';

import Link from "next/link";
import { Button } from "./ui/button";
import { BusFront, LogOut } from "lucide-react";
import { useFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, auth } = useFirebase();
  const router = useRouter();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-card shadow-md">
      <Link href="/" className="flex items-center justify-center">
        <BusFront className="h-6 w-6 text-accent" />
        <span className="ml-2 text-lg font-bold font-inter">Sakpal Travels</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
        {user ? (
          <>
             <Link
              href="/operator/dashboard"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/bookings"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              My Bookings
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </>
        ) : (
          <>
            <Link
              href="/#search"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Book Now
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Contact
            </Link>
            <Button variant="outline" size="sm" asChild>
              <Link href="/user-login">User Login</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/operator-login">Operator Login</Link>
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
