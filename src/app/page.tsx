
import { BookingForm } from "@/components/booking/booking-form";
import Header from "@/components/common/header";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="relative w-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center text-center text-white py-20 md:py-32">
            <div className="container px-4">
                <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 drop-shadow-md">
                    Seamless Bus Ticket Booking
                </h1>
                <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-3xl mx-auto drop-shadow-md">
                    Find and book your bus tickets in minutes. Enter your journey details below to get started.
                </p>
                <div className="mt-8">
                     <BookingForm />
                </div>
            </div>
        </section>

        <section className="py-12 md:py-20 bg-secondary/50 border-t">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold font-headline text-primary">Are you a bus operator?</h2>
                <p className="text-muted-foreground mt-2 mb-6 max-w-xl mx-auto">Join our network and reach thousands of customers daily. Manage your fleet with our easy-to-use tools.</p>
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Link href="/signup/operator">Register Your Fleet Today <ArrowRight className="ml-2"/></Link>
                </Button>
            </div>
        </section>
      </main>
      <footer className="py-6 bg-foreground text-background">
        <div className="container mx-auto px-4 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Traverse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
