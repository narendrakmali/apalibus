import Link from "next/link";
import { Button } from "./ui/button";
import { BusFront } from "lucide-react";

export default function Header() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-card shadow-md">
      <Link href="/" className="flex items-center justify-center">
        <BusFront className="h-6 w-6 text-accent" />
        <span className="ml-2 text-lg font-bold font-inter">Sakpal Travels</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
        <Link
          href="/#search"
          className="text-sm font-medium hover:underline underline-offset-4"
        >
          Book Now
        </Link>
        <Link
          href="/dashboard/bookings"
          className="text-sm font-medium hover:underline underline-offset-4"
        >
          My Bookings
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
          <Link href="/login">Login</Link>
        </Button>
        <Button size="sm" className="bg-accent hover:bg-accent/90" asChild>
           <Link href="/register">Register</Link>
        </Button>
      </nav>
    </header>
  );
}
