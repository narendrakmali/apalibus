
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bus } from 'lucide-react';
import SeatSelection from '@/components/booking/seat-selection';

const routes = [
  {
    id: 'borivali-sangli',
    from: 'Borivali',
    to: 'Sangli',
    departureTime: '08:00 PM',
    arrivalTime: '07:00 AM',
    busType: '30-Seater Sleeper A/C',
    baseFare: 1200,
  },
  {
    id: 'vashi-sangli',
    from: 'Vashi',
    to: 'Sangli',
    departureTime: '09:00 PM',
    arrivalTime: '07:30 AM',
    busType: '30-Seater Sleeper A/C',
    baseFare: 1200,
  },
];

type Route = typeof routes[0];

export default function ExploreRoutesPage() {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [journeyDate, setJourneyDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  if (selectedRoute) {
    return (
      <SeatSelection
        route={selectedRoute}
        journeyDate={journeyDate}
        onBack={() => setSelectedRoute(null)}
      />
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight font-display sm:text-5xl text-primary">
          Explore Our Routes
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Book individual tickets for our scheduled bus services.
        </p>
      </header>

      <div className="flex justify-center mb-8">
        <div className="flex flex-col gap-2 w-full max-w-sm">
           <label htmlFor="journey-date" className="font-medium text-sm">Select Journey Date</label>
           <input
            id="journey-date"
            type="date"
            value={journeyDate}
            onChange={(e) => setJourneyDate(e.target.value)}
            className="w-full p-2 border rounded-md"
            min={new Date().toISOString().split('T')[0]}
           />
        </div>
      </div>

      <div className="max-w-3xl mx-auto grid gap-6">
        {routes.map((route) => (
          <Card key={route.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-4 text-2xl font-display">
                        <span>{route.from}</span>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        <span>{route.to}</span>
                    </CardTitle>
                    <CardDescription className="mt-2 flex items-center gap-2">
                        <Bus className="h-4 w-4" /> {route.busType}
                    </CardDescription>
                </div>
                 <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{route.baseFare}</p>
                    <p className="text-xs text-muted-foreground">per seat</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
              <div>
                <p><strong>Departs:</strong> {route.departureTime}</p>
                <p><strong>Arrives:</strong> {route.arrivalTime}</p>
              </div>
              <Button onClick={() => setSelectedRoute(route)}>Select Seats</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
