
'use client';

import Link from 'next/link';
import { Button } from "./ui/button";
import { BusFront, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function Header() {
  const navLinks = [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/search", label: "Book Now" },
      { href: "/register", label: "User Signup" },
      { href: "/login", label: "User Login" },
      { href: "/operator-register", label: "Operator Register"},
      { href: "/operator-login", label: "Operator Login"},
      { href: "/admin/login", label: "Admin Login"},
  ]

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-card shadow-sm border-b sticky top-0 z-50">
      <Link href="/" className="flex items-center justify-center mr-6">
        <BusFront className="h-6 w-6 text-primary" />
        <span className="ml-2 text-lg font-bold font-inter">Sakpal Travels</span>
      </Link>
      
      <nav className="hidden lg:flex gap-4 sm:gap-6 items-center">
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

      <div className="ml-auto flex gap-2 sm:gap-4 items-center">
        <Button size="sm" asChild className="hidden sm:inline-flex">
          <Link href="/search">Get an Estimate</Link>
        </Button>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">
                A list of links to navigate the Sakpal Travels website.
              </SheetDescription>
            </SheetHeader>
            <nav className="grid gap-6 text-lg font-medium">
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                <BusFront className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold font-inter">Sakpal Travels</span>
              </Link>
               {navLinks.map(link => (
                 <Link
                    key={link.href}
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
