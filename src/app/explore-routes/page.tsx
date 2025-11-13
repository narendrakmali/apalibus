
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bus, Clock, DollarSign, Users, Armchair } from 'lucide-react';
import { operatorData } from '@/lib/operator-data';
import SeatSelection from '@/components/booking/seat-selection';

interface Seat {
  id: string;
  number: string;
  isBooked: boolean;
  type: 'lower' | 'upper';
  isLadySeat: boolean;
  isSeniorSeat: boolean;
}

const generateSeats = () => {
    const seats: Seat[] = [];
    // Lower Deck: 3 rows of 5
    for (let i = 1; i <= 15; i++) {
        seats.push({
            id: `L${i}`,
            number: `L${i}`,
            isBooked: Math.random() > 0.6,
            type: 'lower',
            isLadySeat: false,
            isSeniorSeat: false,
        });
    }
     // Upper Deck: 3 rows of 5
    for (let i = 1; i <= 15; i++) {
        seats.push({
            id: `U${i}`,
            number: `U${i}`,
            isBooked: Math.random() > 0.5,
            type: 'upper',
            isLadySeat: false,
            isSeniorSeat: false,
        });
    }

    // Mark some as lady seats
    seats[2].isLadySeat = true;
    seats[3].isLadySeat = true;
    seats[20].isLadySeat = true;
    
    // Mark some as senior seats
    seats[5].isSeniorSeat = true;

    // Mark some booked lady/senior seats
    if(seats[2].isBooked) seats[2].isLadySeat = true;


    return seats;
};


const routes = operatorData.map(op => {
    const totalSeats = 45;
    const initialSeats = generateSeats();
    const seatsBooked = initialSeats.filter(s => s.isBooked).length;
    const seatsAvailable = totalSeats - seatsBooked;
    return {
      ...op,
      from: 'Mumbai',
      to: 'Sangli',
      totalSeats,
      seatsAvailable,
      seatsBooked,
      baseFare: 800,
      departureTime: op.departure_times[0],
      arrivalTime: '06:00',
      duration: '9h 30m',
      rating: (Math.random() * (5 - 4) + 4).toFixed(1),
      initialSeats,
    }
});


export default function ExploreRoutesPage() {
  const [journeyDate, setJourneyDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedRoute, setSelectedRoute] = useState<any | null>(null);

  if (selectedRoute) {
    return (
        <SeatSelection
            route={selectedRoute}
            journeyDate={journeyDate}
            onBack={() => setSelectedRoute(null)}
            initialSeats={selectedRoute.initialSeats}
        />
    )
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight font-display sm:text-5xl text-primary">
          Select Your Bus
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose from our trusted partners for your journey from Mumbai to Sangli.
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

      <div className="max-w-5xl mx-auto grid gap-6">
        {routes.map((route) => (
            <Card key={route.operator} className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className="grid md:grid-cols-4">
                    <div className="md:col-span-3 p-6">
                        <CardHeader className="p-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <CardTitle className="text-2xl font-display text-primary">{route.operator}</CardTitle>
                                <div className="flex items-center gap-1 text-sm font-bold text-white bg-green-600 px-2 py-1 rounded">
                                    {route.rating} <span className="text-xs font-normal">★</span>
                                </div>
                            </div>
                            <CardDescription className="flex items-center gap-2 pt-2">
                                <Bus className="h-4 w-4" /> {route.bus_types.join(' / ')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 pt-4">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex flex-col">
                                    <span className="font-bold text-lg">{route.departureTime}</span>
                                    <span className="text-muted-foreground">{route.from}</span>
                                </div>
                                <div className="flex-grow text-center px-4">
                                    <div className="text-xs text-muted-foreground">{route.duration}</div>
                                    <div className="w-full h-px bg-border my-1"></div>
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="font-bold text-lg">{route.arrivalTime}</span>
                                    <span className="text-muted-foreground">{route.to}</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground pt-4">
                                <div className="flex items-center gap-1">
                                    <Armchair className="h-4 w-4" />
                                    <span>{route.seatsAvailable} seats left</span>
                                </div>
                                 <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    <span>{route.totalSeats} capacity</span>
                                </div>
                            </div>
                        </CardContent>
                    </div>
                    <div className="bg-secondary/30 p-6 flex flex-col justify-center items-center md:items-end text-center md:text-right">
                       <div className="text-sm text-muted-foreground">Fare starting from</div>
                       <div className="text-2xl font-bold mb-4">{route.fare_range}</div>
                       <Button onClick={() => setSelectedRoute(route)} className="w-full md:w-auto">
                            Book Now
                        </Button>
                    </div>
                </div>
            </Card>
        ))}
      </div>
    </div>
  );
}
