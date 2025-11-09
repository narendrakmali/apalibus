
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Search, Book, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {

  const features = [
    { text: "Advanced Seat Selection", icon: <CheckCircle className="w-5 h-5 text-green-500" /> },
    { text: "Verified Bus Operators", icon: <CheckCircle className="w-5 h-5 text-green-500" /> },
    { text: "Senior-Citizen Friendly", icon: <CheckCircle className="w-5 h-5 text-green-500" /> },
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Search Your Route",
      description: "Enter your destination, journey dates, and number of passengers.",
      icon: <Search className="w-8 h-8 text-primary" />,
    },
    {
      step: 2,
      title: "Select Your Bus",
      description: "Choose from a wide range of verified buses that suit your needs.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bus-front"><path d="M5 17h14"/><path d="M6 17H4.5a1.5 1.5 0 0 1 0-3H6"/><path d="M18 17h1.5a1.5 1.5 0 0 0 0-3H18"/><path d="M7 17V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v12"/><path d="M9 5h6"/><path d="M10 11h4"/><path d="m8 17 2 4"/><path d="m16 17-2 4"/></svg>,
    },
    {
      step: 3,
      title: "Book & Travel",
      description: "Confirm your booking with secure payment and enjoy a comfortable journey.",
      icon: <Book className="w-8 h-8 text-primary" />,
    },
  ];
  
  const testimonials = [
      {
          quote: "Booking a bus for our corporate outing was seamless. The bus was clean, and the driver was very professional. Highly recommended!",
          author: "Rohan Sharma",
          company: "Corporate Client"
      },
      {
          quote: "I used Sakpal Travels for a family trip, and it was a fantastic experience. The booking process is simple, and their operator network is reliable.",
          author: "Priya Desai",
          company: "Family Traveler"
      },
       {
          quote: "As an operator, Sakpal Travels has helped me reach more customers. The dashboard is easy to use and has improved my business.",
          author: "Mr. Shinde",
          company: "Bus Operator"
      }
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 lg:py-40 bg-background">
        <div className="container mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-8 items-center">
          <div className="max-w-xl text-center md:text-left">
            <h1 className="text-4xl font-bold tracking-tight font-display sm:text-5xl lg:text-6xl text-primary">
              Book Buses with Ease
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Reliable, Comfortable, and Verified Operators for all your travel needs. Get instant estimates and book your journey in minutes.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
               <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/register">Register Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="/search">Explore Routes</Link>
              </Button>
            </div>
            {/* Feature Highlights */}
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-start">
              {features.map(feature => (
                <div key={feature.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                  {feature.icon}
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center">
            <Image 
                src="https://picsum.photos/seed/bus-illustration/600/400" 
                alt="Bus themed illustration" 
                width={600} 
                height={400} 
                className="rounded-lg shadow-xl"
                data-ai-hint="bus illustration"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="w-full py-20 md:py-24 bg-secondary">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
             <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-display text-primary">How It Works</h2>
             <p className="mt-4 text-muted-foreground">
                Three simple steps to book your ideal bus.
             </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {howItWorks.map((step) => (
              <Card key={step.step} className="text-center bg-background shadow-md hover:shadow-xl transition-shadow">
                <CardHeader>
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mx-auto mb-4">
                        {step.icon}
                    </div>
                    <CardTitle className="text-lg font-semibold font-display">Step {step.step}: {step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mt-1 text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="w-full py-20 md:py-24 bg-background">
         <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-display text-primary">What Our Users Say</h2>
                <p className="mt-4 text-muted-foreground">
                    Trusted by travelers and operators across the country.
                </p>
            </div>
             <div className="grid gap-8 md:grid-cols-3">
                {testimonials.map((testimonial, index) => (
                    <Card key={index} className="bg-secondary/50 border-0">
                        <CardContent className="pt-6">
                            <div className="flex mb-2">
                                {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />)}
                            </div>
                            <p className="italic text-foreground/80">"{testimonial.quote}"</p>
                        </CardContent>
                        <CardHeader className="pt-2">
                           <CardTitle className="text-base font-semibold">{testimonial.author}</CardTitle>
                           <CardDescription>{testimonial.company}</CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>
         </div>
      </section>
    </div>
  );
}

    