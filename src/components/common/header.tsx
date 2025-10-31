import Link from "next/link";
import { Bus, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 mr-6">
          <Bus className="h-6 w-6 text-primary" />
          <span className="font-headline font-bold text-lg">Traverse</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/admin/dashboard" className="transition-colors hover:text-foreground">
            Dashboard
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">
              <User className="mr-2 h-4 w-4" />
              Login
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/login">Sign Up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
