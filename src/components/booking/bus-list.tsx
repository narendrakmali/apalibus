
'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import type { BookingRequest } from './booking-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { ArrowLeft, Bus, Users, Armchair, IndianRupee, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

type Bus = {
  id: string;
  registrationNumber: string;
  busType: string;
  seatingCapacity: string;
  coachType: string;
  operatorName: string;
  operatorId: string;
};

interface BusListProps {
  request: BookingRequest;
  onBack: () => void;
}

export function BusList({ request, onBack }: BusListProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [bookingBusId, setBookingBusId] = useState<string | null>(null);

  const busesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'buses'),
      where('busType', '==', request.busType),
      where('seatingCapacity', '==', request.seatingCapacity)
    );
  }, [firestore, request.busType, request.seatingCapacity]);

  const { data: buses, isLoading: areBusesLoading } = useCollection<Bus>(busesQuery);
  
  const handleBooking = async (bus: Bus) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Not Logged In', description: 'You need to be logged in to make a booking.'});
        router.push('/login');
        return;
    }
    setBookingBusId(bus.id);
    try {
        const bookingsCollection = collection(firestore, 'bookings');
        await addDoc(bookingsCollection, {
            userId: user.uid,
            busId: bus.id,
            operatorId: bus.operatorId,
            journeyDate: request.journeyDate,
            startLocation: request.startLocation,
            destination: request.destination,
            status: 'pending',
            createdAt: serverTimestamp(),
            userName: user.displayName,
            busDetails: {
                registrationNumber: bus.registrationNumber,
                operatorName: bus.operatorName,
            }
        });
        toast({ title: 'Booking Request Sent', description: 'The operator has been notified. You will be updated on your dashboard.'});
        router.push('/dashboard');
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Booking Failed', description: error.message || 'Could not send booking request.'});
    } finally {
        setBookingBusId(null);
    }
  }


  return (
    <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
        </Button>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Available Buses</CardTitle>
          <CardDescription>
            Select a bus from the list below to send a booking request to the operator.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {areBusesLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
          ) : buses && buses.length > 0 ? (
            buses.map((bus) => (
              <Card key={bus.id} className="flex flex-col sm:flex-row items-center justify-between p-4">
                <div className="grid gap-2 flex-1">
                    <p className="font-bold text-lg">{bus.operatorName}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Bus />
                            <span>{bus.busType}</span>
                        </div>
                         <div className="flex items-center gap-1.5">
                            <Users />
                            <span>{bus.seatingCapacity} Seater</span>
                        </div>
                         <div className="flex items-center gap-1.5">
                            <Armchair />
                            <span>{bus.coachType}</span>
                        </div>
                    </div>
                </div>
                <div className="mt-4 sm:mt-0">
                    <Button onClick={() => handleBooking(bus)} disabled={!!bookingBusId}>
                        {bookingBusId === bus.id ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : 'Send Request'}
                    </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 border rounded-lg">
              <p className="text-muted-foreground">No buses found matching your criteria.</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
