"use client";

import Link from "next/link";
import { Bus, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/");
    }
  };

  return (
    <header className={cn(
        "sticky top-0 z-50 w-full transition-colors duration-300",
        isScrolled ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b" : "bg-transparent text-white"
      )}>
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2 mr-6">
          <Bus className={cn("h-7 w-7", isScrolled ? "text-primary" : "text-white")} />
          <span className={cn("font-headline font-bold text-xl", isScrolled ? "text-foreground" : "text-white")}>Traverse</span>
        </Link>
        <nav className={cn(
            "hidden md:flex items-center gap-6 text-sm font-medium",
            isScrolled ? "text-muted-foreground" : "text-slate-300"
            )}>
          {user && (
            <Link href="/dashboard" className="transition-colors hover:text-foreground">
              Dashboard
            </Link>
          )}
           <Link href="#popular-routes" className="transition-colors hover:text-foreground">
              Popular Routes
            </Link>
             <Link href="#contact" className="transition-colors hover:text-foreground">
              Contact
            </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end gap-2">
          {isUserLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-md bg-white/20" />
          ) : user ? (
            <>
              <span className={cn("text-sm hidden sm:inline", isScrolled ? "text-muted-foreground" : "text-slate-200")}>
                {user.displayName || user.email}
              </span>
              <Button variant={isScrolled ? "ghost" : "outline"} className={cn(!isScrolled && "text-white border-white/50 hover:bg-white/10 hover:text-white")} size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className={cn("hover:bg-white/10", isScrolled ? "text-foreground hover:text-foreground" : "text-white hover:text-white")}>
                <Link href="/login">
                  <User className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
              <Button size="sm" asChild variant="outline" className={cn("bg-transparent", isScrolled ? "text-primary border-primary hover:bg-primary hover:text-primary-foreground" : "text-white border-white/80 hover:bg-white hover:text-primary")}>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
