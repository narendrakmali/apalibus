
'use client';

import { useState } from 'react';
import type { BookingRequest } from './booking-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, Check, Ticket, IndianRupee, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { BusList } from './bus-list';

interface BookingResultProps {
  request: BookingRequest;
  result: {
    fareBreakdown: string;
    estimatedFare: number;
  };
  onBack: () => void;
}

export function BookingResult({ request, result, onBack }: BookingResultProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [showBuses, setShowBuses] = useState(false);

  if (showBuses) {
      return <BusList request={request} onBack={() => setShowBuses(false)} />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Search
      </Button>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <IndianRupee className="mr-2 text-primary" />
            Fare Estimate
          </CardTitle>
          <CardDescription>
            Here is the estimated cost for your trip. This is not a final bill.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Card className="bg-secondary/50">
            <CardContent className="p-4">
                 <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">
                    {result.fareBreakdown}
                </pre>
            </CardContent>
          </Card>
            <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Estimated Fare</p>
                <p className="text-3xl font-bold font-headline">
                    ₹{result.estimatedFare.toLocaleString('en-IN')}
                </p>
            </div>
        </CardContent>
        <CardFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" className="w-full sm:w-auto" onClick={onBack}>
                Modify Search
            </Button>
            <Button className="w-full sm:w-auto" onClick={() => setShowBuses(true)}>
                <Check className="mr-2" />
                Proceed to Find Buses
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
