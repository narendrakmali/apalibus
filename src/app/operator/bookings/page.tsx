'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useMemoFirebase } from '@/firebase/provider';

// Define the type for a booking request
interface BookingRequest {
  id: string;
  fromLocation: { address: string };
  toLocation: { address: string };
  journeyDate: string;
  returnDate: string;
  status: 'pending' | 'approved' | 'rejected';
  userId: string;
}

export default function OperatorBookingsPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/operator-login');
    }
  }, [isUserLoading, user, router]);

  const bookingRequestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // For now, operators see all requests. This could be filtered later.
    return query(collection(firestore, 'bookingRequests'));
  }, [firestore]);

  const { data: bookingRequests, isLoading } = useCollection<BookingRequest>(bookingRequestsQuery);

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Manage Bookings</h1>
        <p className="text-muted-foreground mt-1">
          Review and respond to incoming booking requests.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Incoming Requests</CardTitle>
          <CardDescription>
            A list of all booking requests from users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading requests...</p>}
          {!isLoading && (!bookingRequests || bookingRequests.length === 0) && (
            <div className="text-center text-muted-foreground py-20">
              <p>There are no pending booking requests.</p>
            </div>
          )}
          {!isLoading && bookingRequests && bookingRequests.length > 0 && (
            <div className="space-y-4">
              {bookingRequests.map((request) => (
                <div key={request.id} className="border p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{request.fromLocation.address} to {request.toLocation.address}</p>
                    <p className="text-sm text-muted-foreground">
                      Date: {request.journeyDate} | Status: <span className={`capitalize font-medium ${request.status === 'pending' ? 'text-yellow-500' : request.status === 'approved' ? 'text-green-500' : 'text-red-500'}`}>{request.status}</span>
                    </p>
                  </div>
                  {/* TODO: Add buttons to approve/reject */}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
