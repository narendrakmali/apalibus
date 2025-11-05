
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6 flex flex-col items-center justify-center text-center min-h-[calc(100vh-10rem)]">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight font-inter sm:text-5xl">
          Your Trusted Partner for Comfortable Bus Journeys
        </h1>
      </header>

      <section className="mb-12 max-w-4xl mx-auto">
        <p className="text-lg text-muted-foreground">
          Sakpal Travels is a leading bus rental and booking service in Mumbai, dedicated to providing safe, reliable, and affordable travel solutions. Whether you need a luxury AC coach for corporate events or a spacious Non-AC bus for group trips, we make your journey smooth and hassle-free.
        </p>
      </section>

      <section className="mb-12 w-full max-w-2xl">
        <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="items-center">
                <Target className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-2xl font-semibold">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center text-lg text-muted-foreground">
                To deliver exceptional travel experiences with comfort, punctuality, and customer satisfaction at the heart of everything we do.
                </p>
            </CardContent>
        </Card>
      </section>
      
      <section className="mt-8">
        <h3 className="text-2xl font-semibold mb-4">
          Ready to plan your trip?
        </h3>
        <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/search">Book Now</Link>
        </Button>
      </section>
    </div>
  );
}
