
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
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
import { Clock, CheckCircle, XCircle } from 'lucide-react';

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

export default function BookingHistoryPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'bookings'), where('operatorId', '==', user.uid), orderBy('journeyDate', 'desc'));
  }, [firestore, user?.uid]);

  const { data: bookings, isLoading: areBookingsLoading } = useCollection<Booking>(bookingsQuery);

  const isLoading = isUserLoading || areBookingsLoading;
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-600 hover:bg-green-700 text-white"><CheckCircle className="mr-1 h-3 w-3" />Confirmed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };


  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 flex h-14 items-center gap-4 border-b bg-background px-4 sm:h-16 sm:px-6 z-30">
          <SidebarTrigger />
          <h1 className="font-semibold text-lg md:text-xl">Booking History</h1>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 sm:gap-8 sm:p-6">
          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>
                A complete history of all booking requests for your buses.
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
                      <TableHead className="text-right">Status</TableHead>
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
                          {getStatusBadge(booking.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You have no booking history yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}
