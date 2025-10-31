"use client";

import Link from "next/link";
import { Bus, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 mr-6">
          <Bus className="h-6 w-6 text-primary" />
          <span className="font-headline font-bold text-lg">Traverse</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          {user && (
            <Link href="/dashboard" className="transition-colors hover:text-foreground">
              Dashboard
            </Link>
          )}
        </nav>
        <div className="flex flex-1 items-center justify-end gap-2">
          {isUserLoading ? (
            <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.displayName || user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">
                  <User className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
