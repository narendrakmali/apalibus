
'use client';

import Link from 'next/link';
import { Button } from "./ui/button";
import { BusFront, Menu, LogOut, UserCircle, Shield, Building, Star, Phone, Mail } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useAuth, useFirestore } from '@/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function Header() {
  const auth = useAuth();
  const firestore = useFirestore();
  const [user, authLoading] = useAuthState(auth);
  const [isOperator, setIsOperator] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (user) {
        setLoadingRoles(true);
        try {
          // Check for admin
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() && userDoc.data().isAdmin) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }

          // Check for operator
          const operatorDocRef = doc(firestore, 'busOperators', user.uid);
          const operatorDoc = await getDoc(operatorDocRef);
          if (operatorDoc.exists()) {
            setIsOperator(true);
          } else {
            setIsOperator(false);
          }
        } catch (serverError) {
            const permissionError = new FirestorePermissionError({
              path: `/users/${user.uid} or /busOperators/${user.uid}`,
              operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
        } finally {
            setLoadingRoles(false);
        }
      } else {
        setIsAdmin(false);
        setIsOperator(false);
        setLoadingRoles(false);
      }
    };
    checkUserRole();
  }, [user, firestore]);

  const handleLogout = () => {
    auth.signOut();
  };

  const guestLinks = [
    { href: "/operator-login", label: "Operator Login" },
    { href: "/admin/login", label: "Admin Login" },
  ];

  const baseLinks = [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/search", label: "Group Booking" },
      { href: "/explore-routes", label: "Explore Routes" },
      { href: "/msrtc-booking", label: "MSRTC Booking" },
      { href: "/stage-calculator", label: "Stage Calculator" },
      { href: "/track-status", label: "Track Request" },
  ];

   const userNav = (
    <div className="flex items-center gap-2">
      {isAdmin && (
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin"><Shield className="mr-2 h-4 w-4" />Admin Dashboard</Link>
        </Button>
      )}
      {isOperator && (
         <Button asChild variant="ghost" size="sm">
          <Link href="/operator-dashboard"><Building className="mr-2 h-4 w-4" />Operator Dashboard</Link>
        </Button>
      )}
      <Button onClick={handleLogout} variant="outline" size="sm">
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  );
  
  const guestNav = (
     <div className="flex items-center gap-2">
    </div>
  );

  const MobileNav = () => (
    <Sheet>
        <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
        </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
        <SheetHeader className="text-left">
            <SheetClose asChild>
                <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                <BusFront className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold font-inter">Sakpal Travels</span>
                </Link>
            </SheetClose>
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">
            A list of links to navigate the Sakpal Travels website.
            </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
            <nav className="grid gap-4 text-base font-medium py-4">
                 <SheetClose asChild>
                    <Link href="/special-offer" className="flex items-center gap-2 text-yellow-500 font-bold hover:text-yellow-400">
                        <Star className="h-5 w-5" /> Special Offer
                    </Link>
                </SheetClose>
                {baseLinks.map(link => (
                    <SheetClose asChild key={link.href}>
                        <Link href={link.href} className="text-muted-foreground hover:text-foreground">
                        {link.label}
                        </Link>
                    </SheetClose>
                ))}

                <div className="border-t pt-4 mt-2 space-y-4">
                 {(authLoading || loadingRoles) ? <Skeleton className="h-8 w-24" /> : user && (user.isAnonymous === false) ? (
                    <>
                        {isAdmin && <SheetClose asChild><Link href="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><Shield className="h-5 w-5" /> Admin</Link></SheetClose>}
                        {isOperator && <SheetClose asChild><Link href="/operator-dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><Building className="h-5 w-5" /> Operator</Link></SheetClose>}
                        <SheetClose asChild>
                            <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                                <LogOut className="mr-2 h-5 w-5" /> Logout
                            </Button>
                        </SheetClose>
                    </>
                 ) : (
                    guestLinks.map(link => (
                        <SheetClose asChild key={link.href}>
                            <Link href={link.href} className="text-muted-foreground hover:text-foreground">
                            {link.label}
                            </Link>
                        </SheetClose>
                    ))
                 )}
                </div>
            </nav>
        </div>
        </SheetContent>
    </Sheet>
  );

  return (
    <header className="bg-card shadow-sm border-b sticky top-0 z-50">
        <div className="bg-secondary/30 text-secondary-foreground text-xs py-1">
            <div className="container mx-auto flex justify-between items-center px-4 lg:px-6">
                <span>Dive Fams Aliarterfor Free. Sakpal Travels</span>
                <div className="flex items-center gap-4">
                    <a href="tel:+91691106343" className="flex items-center gap-1 hover:text-primary">
                        <Phone className="h-3 w-3" />
                        +91 69 110 6343
                    </a>
                     <a href="/contact" className="flex items-center gap-1 hover:text-primary">
                        <Mail className="h-3 w-3" />
                        Contact Us
                    </a>
                </div>
            </div>
        </div>
        <div className="px-4 lg:px-6 h-16 flex items-center">
            <Link href="/" className="flex items-center justify-center mr-6">
                <BusFront className="h-6 w-6 text-primary" />
                <span className="ml-2 text-lg font-bold font-inter">Sakpal Travels</span>
            </Link>
            
            <nav className="hidden lg:flex gap-4 sm:gap-6 items-center">
                {baseLinks.map(link => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>

            <div className="ml-auto flex gap-2 sm:gap-4 items-center">
                 <Button asChild className="hidden sm:inline-flex bg-accent hover:bg-accent/90 animate-pulse">
                    <Link
                        href="/special-offer"
                        className="flex items-center gap-1 text-sm font-bold"
                    >
                        <Star className="h-4 w-4" />
                        Special Offer
                    </Link>
                 </Button>
                <div className="hidden sm:flex">
                {(authLoading || loadingRoles) ? <Skeleton className="h-10 w-32" /> : user && (user.isAnonymous === false) ? userNav : guestNav}
                </div>
                <MobileNav />
            </div>
        </div>
    </header>
  );
}
