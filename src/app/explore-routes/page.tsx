
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bus, Clock, DollarSign, ExternalLink, Phone } from 'lucide-react';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { operatorData } from '@/lib/operator-data';


export default function ExploreRoutesPage() {
  const [journeyDate, setJourneyDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight font-display sm:text-5xl text-primary">
          Mumbai to Sangli Operators
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Find and book your tickets with our trusted travel partners.
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

      <div className="max-w-4xl mx-auto grid gap-6">
        {operatorData.map((operator) => (
            <Card key={operator.operator} className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl font-display text-primary">{operator.operator}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                           <Bus className="h-4 w-4" /> {operator.bus_types.join(' / ')}
                        </CardDescription>
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm"><Phone className="h-4 w-4 mr-2" /> Contact</Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="space-y-2">
                                <h4 className="font-semibold">{operator.operator}</h4>
                                <p className="text-sm text-muted-foreground">{operator.address}</p>
                                <div className="border-t pt-2">
                                    <p className="text-sm">
                                        <strong>Phone:</strong> {operator.contact.join(', ')}
                                    </p>
                                    {operator.email && (
                                        <p className="text-sm">
                                            <strong>Email:</strong> {operator.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
                 <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <span className="font-semibold">Departures: </span>
                        <span>{operator.departure_times.join(', ')}</span>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                     <div>
                        <span className="font-semibold">Fare: </span>
                        <span>{operator.fare_range}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-secondary/30 p-4 flex justify-end">
                 <Button asChild>
                    <Link href={operator.booking_url} target="_blank" rel="noopener noreferrer">
                        Book Now <ExternalLink className="h-4 w-4 ml-2" />
                    </Link>
                </Button>
            </CardFooter>
            </Card>
        ))}
      </div>
    </div>
  );
}
