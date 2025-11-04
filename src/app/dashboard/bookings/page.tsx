'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';

interface BookingRequest {
  id: string;
  fromLocation: { address: string };
  toLocation: { address:string };
  journeyDate: string;
  status: 'pending' | 'approved' | 'rejected';
}


export default function UserBookingsPage() {
  const { user, isUserLoading, firestore } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/user-login');
    }
  }, [isUserLoading, user, router]);

  const userBookingRequestsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'bookingRequests'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: bookingRequests, isLoading } = useCollection<BookingRequest>(userBookingRequestsQuery);


  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <p>Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Booking Requests</h1>
        <p className="text-muted-foreground mt-1">
          View the status of your past and current booking requests.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Request History</CardTitle>
          <CardDescription>
            A list of all your submitted requests will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {isLoading && <p>Loading your requests...</p>}
          {!isLoading && (!bookingRequests || bookingRequests.length === 0) ? (
            <div className="text-center text-muted-foreground py-20">
                <p>You have not made any booking requests yet.</p>
            </div>
          ) : (
             <div className="space-y-4">
              {bookingRequests?.map((request) => (
                <div key={request.id} className="border p-4 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center">
                  <div>
                    <p className="font-semibold">{request.fromLocation.address} to {request.toLocation.address}</p>
                    <p className="text-sm text-muted-foreground">
                      Journey Date: {new Date(request.journeyDate).toLocaleDateString()}
                    </p>
                  </div>
                   <div className="mt-2 sm:mt-0">
                     <p className="text-sm text-right">
                        Status: <span className={`capitalize font-medium ${
                            request.status === 'pending' ? 'text-yellow-500' 
                          : request.status === 'approved' ? 'text-green-500' 
                          : 'text-red-500'}`}>{request.status}</span>
                      </p>
                   </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
