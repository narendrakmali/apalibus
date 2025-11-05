
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Star, Target, Compass, Eye } from 'lucide-react';
import Link from 'next/link';

const offerings = [
  'Wide Fleet: AC & Non-AC buses with seating options from 15 to 50.',
  'Flexible Rentals: Daily, hourly, and outstation packages.',
  'Transparent Pricing: Fare estimation with no hidden charges.',
  'Safety First: GPS-enabled buses, trained drivers, and safety kits.',
  'Easy Booking: Online reservations, instant fare calculation, and secure payments.',
];

const whyChooseUs = [
  '24/7 customer support',
  'Experienced drivers',
  'Real-time bus tracking',
  'Customizable travel plans',
  'Affordable rates with GST-compliant billing',
];

export default function AboutUsPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight font-inter sm:text-5xl">
          Your Trusted Partner for Comfortable Bus Journeys
        </h1>
      </header>

      <section className="mb-12 max-w-4xl mx-auto">
        <p className="text-lg text-center text-muted-foreground">
          Sakpal Travels is a leading bus rental and booking service in Mumbai, dedicated to providing safe, reliable, and affordable travel solutions. Whether you need a luxury AC coach for corporate events or a spacious Non-AC bus for group trips, we make your journey smooth and hassle-free.
        </p>
      </section>

      <section className="mb-12">
        <Card className="max-w-3xl mx-auto bg-primary/5 border-primary/20">
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

      <div className="grid md:grid-cols-2 gap-10 mb-12">
        <section>
          <h2 className="text-3xl font-bold text-center mb-6 font-inter flex items-center justify-center gap-2"><Compass className="h-8 w-8 text-primary"/> What We Offer</h2>
          <ul className="space-y-3">
            {offerings.map((item, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-center mb-6 font-inter flex items-center justify-center gap-2"><Star className="h-8 w-8 text-primary"/> Why Choose Us?</h2>
          <ul className="space-y-3">
            {whyChooseUs.map((item, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

       <section className="mb-12">
        <Card className="max-w-3xl mx-auto bg-primary/5 border-primary/20">
            <CardHeader className="items-center">
                <Eye className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-2xl font-semibold">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center text-lg text-muted-foreground">
                To be the most trusted and innovative travel partner in India, offering seamless connectivity and superior comfort.
                </p>
            </CardContent>
        </Card>
      </section>


      <section className="text-center mt-16">
        <h3 className="text-2xl font-semibold mb-4">
          Plan your next journey with Sakpal Travels – Book Now and Travel Smart!
        </h3>
        <Button asChild size="lg">
          <Link href="/#search">Book Now</Link>
        </Button>
      </section>
    </div>
  );
}
