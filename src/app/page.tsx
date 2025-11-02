
import { BookingForm } from "@/components/booking/booking-form";
import Header from "@/components/common/header";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const heroImage = PlaceHolderImages.find(img => img.id === 'hero-road');

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center text-center text-white">
             {heroImage && (
                <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    fill
                    className="object-cover -z-10"
                    data-ai-hint={heroImage.imageHint}
                />
            )}
            <div className="absolute inset-0 bg-black/50 -z-10" />
            <div className="container px-4">
                <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 drop-shadow-md">
                    Seamless Journeys, Unforgettable Trips
                </h1>
                <p className="text-lg md:text-xl text-slate-200 mb-8 max-w-3xl mx-auto drop-shadow-md">
                    Find and book a bus for your journey. Enter your details below to get started and travel with confidence.
                </p>
                <div className="hidden md:block">
                     <BookingForm />
                </div>
            </div>
        </section>

        <div className="block md:hidden -mt-24 relative z-10 p-4">
             <BookingForm />
        </div>
        
        <section className="py-12 md:py-20">
            <div className="container mx-auto px-4 text-center">
                 <div className="max-w-2xl mx-auto">
                     <div className="flex justify-center mb-2">
                        {[...Array(5)].map((_, i) => <Star key={i} className="text-yellow-400 fill-current" />)}
                     </div>
                    <h2 className="text-2xl font-semibold italic text-foreground">
                        "The booking was incredibly easy and the journey was comfortable. Traverse is my go-to for bus travel now!"
                    </h2>
                    <p className="text-muted-foreground mt-4">- A Happy Traveler</p>
                </div>
            </div>
        </section>

        <section className="py-12 md:py-20 bg-secondary/50 border-t">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold font-headline text-primary">Are you a bus operator?</h2>
                <p className="text-muted-foreground mt-2 mb-6 max-w-xl mx-auto">Join our network and reach thousands of customers daily. Manage your fleet with our easy-to-use tools.</p>
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
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
