
'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bus, Armchair } from 'lucide-react';
import SeatSelection from '@/components/booking/seat-selection';

// Seat generation logic moved here to be available for route cards
interface Seat {
  id: string;
  number: string;
  isBooked: boolean;
  type: 'lower' | 'upper';
  isLadySeat: boolean;
  isSeniorSeat: boolean;
}

const generateSeats = (): Seat[] => {
  const seats: Seat[] = [];
  // Lower Deck: 15 seats
  for (let i = 1; i <= 15; i++) {
    seats.push({ id: `L${i}`, number: `L${i}`, isBooked: Math.random() > 0.6, type: 'lower', isLadySeat: false, isSeniorSeat: false });
  }
  // Upper Deck: 15 seats
  for (let i = 1; i <= 15; i++) {
    seats.push({ id: `U${i}`, number: `U${i}`, isBooked: Math.random() > 0.5, type: 'upper', isLadySeat: false, isSeniorSeat: false });
  }
  // Pre-assign some special seats for demonstration
  const ladySeat = seats.find(s => s.id === 'L5' && !s.isBooked);
  if(ladySeat) ladySeat.isLadySeat = true;

  const seniorSeat = seats.find(s => s.id === 'L2' && !s.isBooked);
  if(seniorSeat) seniorSeat.isSeniorSeat = true;
  
  return seats;
};


const initialRoutes = [
  {
    id: 'borivali-sangli',
    from: 'Borivali',
    to: 'Sangli',
    departureTime: '08:00 PM',
    arrivalTime: '07:00 AM',
    busType: '30-Seater Sleeper A/C',
    baseFare: 750,
  },
  {
    id: 'vashi-sangli',
    from: 'Vashi',
    to: 'Sangli',
    departureTime: '09:00 PM',
    arrivalTime: '07:30 AM',
    busType: '30-Seater Sleeper A/C',
    baseFare: 750,
  },
];

type Route = typeof initialRoutes[0] & { seats: Seat[] };

export default function ExploreRoutesPage() {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [journeyDate, setJourneyDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Memoize routes with generated seats to avoid re-generating on every render
  const routes: Route[] = useMemo(() => {
    return initialRoutes.map(route => {
        const seats = generateSeats();
        return {
            ...route,
            seats,
        };
    });
  }, []);


  if (selectedRoute) {
    return (
      <SeatSelection
        route={selectedRoute}
        journeyDate={journeyDate}
        onBack={() => setSelectedRoute(null)}
        initialSeats={selectedRoute.seats}
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
        {routes.map((route) => {
            const bookedSeats = route.seats.filter(s => s.isBooked).length;
            const availableSeats = route.seats.length - bookedSeats;

            return (
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
                <CardContent className="flex items-center justify-between text-sm">
                    <div className="flex gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Armchair className="h-4 w-4 text-green-500" />
                            <span>{availableSeats} Available</span>
                        </div>
                        <div className="flex items-center gap-1">
                             <Armchair className="h-4 w-4 text-red-500" />
                            <span>{bookedSeats} Booked</span>
                        </div>
                    </div>
                  <Button onClick={() => setSelectedRoute(route)}>Select Seats</Button>
                </CardContent>
              </Card>
            )
        })}
      </div>
    </div>
  );
}
