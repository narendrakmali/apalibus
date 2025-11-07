
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Clock, ShieldCheck, Users } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {

  const services = [
    {
      icon: <Truck className="w-8 h-8 text-primary" />,
      title: "Corporate Rentals",
      description: "Reliable and professional bus services for corporate events and employee transport.",
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Group & Tourist Trips",
      description: "Comfortable and spacious buses for family trips, tours, and large group outings.",
    },
    {
      icon: <Clock className="w-8 h-8 text-primary" />,
      title: "Flexible Packages",
      description: "Hourly, daily, and custom rental packages to suit your specific travel needs.",
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-primary" />,
      title: "Safety Assured",
      description: "GPS-enabled fleet with trained drivers to ensure your journey is safe and secure.",
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="w-full py-20 md:py-32 lg:py-40 bg-background">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight font-display sm:text-5xl lg:text-6xl text-primary">
              Your Trusted Partner for Comfortable Bus Journeys
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Sakpal Travels is a leading bus rental service in Mumbai, dedicated to providing safe, reliable, and affordable travel solutions for all your needs.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg" variant="outline">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="w-full py-20 md:py-24 bg-secondary">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
             <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-display text-primary">Our Services</h2>
             <p className="mt-4 text-muted-foreground">
                From corporate travel to family vacations, we have a solution for every occasion.
             </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <Card key={service.title} className="text-center bg-background shadow-md hover:shadow-xl transition-shadow">
                <CardHeader>
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mx-auto mb-4">
                        {service.icon}
                    </div>
                    <CardTitle className="text-lg font-semibold font-display">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mt-1 text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-20 md:py-24 bg-background">
         <div className="container mx-auto px-4 md:px-6">
             <Card className="max-w-4xl mx-auto bg-primary text-primary-foreground border-0">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-display">Ready to plan your trip?</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-primary-foreground/80 mb-6">
                        Contact us today to get started with your booking.
                    </p>
                    <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        <Link href="/contact">Contact Us</Link>
                    </Button>
                </CardContent>
            </Card>
         </div>
      </section>
    </div>
  );
}
