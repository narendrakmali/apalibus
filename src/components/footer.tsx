
import Link from "next/link";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-secondary">
            <div className="container mx-auto flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6">
              <p className="text-xs text-secondary-foreground/60">
                © {currentYear} Bus Booking. All rights reserved.
              </p>
              <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                <Link href="/terms" className="text-xs hover:underline underline-offset-4 text-secondary-foreground/80">
                  Terms of Service
                </Link>
                <Link href="/privacy" className="text-xs hover:underline underline-offset-4 text-secondary-foreground/80">
                  Privacy Policy
                </Link>
              </nav>
            </div>
        </footer>
    )
}
