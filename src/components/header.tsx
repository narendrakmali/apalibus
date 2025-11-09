'use client';

import Link from 'next/link';
import { Button } from "./ui/button";
import { BusFront } from "lucide-react";

export default function Header() {
  const navLinks = [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/search", label: "Book Now" },
      { href: "/operator-register", label: "Operator Signup"},
      { href: "/operator-dashboard", label: "Operator Dashboard"},
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
        <Button size="sm" asChild>
          <Link href="/search">Get an Estimate</Link>
        </Button>
      </nav>
    </header>
  );
}
