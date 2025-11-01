
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, writeBatch } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Check, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Booking = {
  id: string;
  userId: string;
  userName: string;
  journeyDate: { toDate: () => Date };
  startLocation: string;
  destination: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  busDetails: {
    registrationNumber: string;
  }
};

function PendingBookingsCount() {
    const { user } = useUser();
    const firestore = useFirestore();

    const bookingsQuery = useMemoFirebase(() => {
        if (!firestore || !user?.uid) return null;
        return query(collection(firestore, 'bookings'), where('operatorId', '==', user.uid), where('status', '==', 'pending'));
    }, [firestore, user?.uid]);

    const { data: bookings } = useCollection(bookingsQuery);

    if (!bookings || bookings.length === 0) return null;

    return <Badge className="ml-2 bg-primary text-primary-foreground">{bookings.length}</Badge>;
}

export default function BookingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'bookings'), where('operatorId', '==', user.uid), where('status', '==', 'pending'));
  }, [firestore, user?.uid]);

  const { data: bookings, isLoading: areBookingsLoading } = useCollection<Booking>(bookingsQuery);

  const isLoading = isUserLoading || areBookingsLoading;

  const handleUpdateBooking = async (bookingId: string, newStatus: 'confirmed' | 'cancelled') => {
    if (!firestore) return;
    setUpdatingBookingId(bookingId);
    try {
        const bookingRef = doc(firestore, 'bookings', bookingId);
        const batch = writeBatch(firestore);
        batch.update(bookingRef, { status: newStatus });
        await batch.commit();
        toast({ title: 'Booking Updated', description: `Booking has been ${newStatus}.` });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Update Failed', description: error.message || 'Could not update booking.' });
    } finally {
        setUpdatingBookingId(null);
    }
  }

  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 flex h-14 items-center gap-4 border-b bg-background px-4 sm:h-16 sm:px-6 z-30">
          <SidebarTrigger />
          <h1 className="font-semibold text-lg md:text-xl flex items-center">
            Pending Bookings
            {!isLoading && <PendingBookingsCount />}
          </h1>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 sm:gap-8 sm:p-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Requests</CardTitle>
              <CardDescription>
                Review and respond to pending booking requests for your buses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
              ) : bookings && bookings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Journey Date</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Bus</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.userName}</TableCell>
                        <TableCell>{format(booking.journeyDate.toDate(), 'PPP')}</TableCell>
                        <TableCell>{booking.startLocation} to {booking.destination}</TableCell>
                        <TableCell>{booking.busDetails.registrationNumber}</TableCell>
                        <TableCell className="text-right">
                          {updatingBookingId === booking.id ? (
                            <div className="flex justify-end">
                                <Loader2 className="h-5 w-5 animate-spin" />
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                                <Button size="icon" variant="outline" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => handleUpdateBooking(booking.id, 'confirmed')}>
                                    <Check className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="destructive" onClick={() => handleUpdateBooking(booking.id, 'cancelled')}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You have no pending booking requests.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}
