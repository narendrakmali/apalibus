
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="container mx-auto py-16 px-4 md:px-6">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight font-display sm:text-5xl text-primary">
          Contact Us
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          We're here to help with all your travel needs. Reach out to us by phone or visit one of our offices.
        </p>
      </header>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center gap-4">
            <Phone className="h-8 w-8 text-primary" />
            <CardTitle className="font-display">Contact Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              7774079221
            </p>
             <p className="text-sm text-muted-foreground mt-1">
              Call us for inquiries and bookings.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
             <MapPin className="h-8 w-8 text-primary" />
             <CardTitle className="font-display">Visit Us (Mahad)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Mumbai Goa Highway, Mahad, Raigad-Maharashtra - 402301
            </p>
          </CardContent>
        </Card>

        <Card>
           <CardHeader className="flex flex-row items-center gap-4">
             <MapPin className="h-8 w-8 text-primary" />
             <CardTitle className="font-display">Visit Us (Lonere)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              BATU Road, Lonere, Raigad-maharashtra - 402103
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
