
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { Button } from '@/components/ui/button';

interface BookingRequest {
  id: string;
  fromLocation: { address: string };
  toLocation: { address:string };
  journeyDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'quote_rejected';
  finalCost?: number;
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
  
  const handleUserResponse = async (requestId: string, response: 'accept' | 'decline') => {
      if (!firestore) return;

      const requestDocRef = doc(firestore, 'bookingRequests', requestId);

      if (response === 'decline') {
          await updateDoc(requestDocRef, { status: 'quote_rejected' });
      } else {
          // Placeholder for payment flow
          alert("Payment gateway integration is pending. For now, the request is marked as accepted.");
          // You might want to update status to 'payment_pending' or similar
      }
  };


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
                <Card key={request.id} className="p-4">
                  <div className="flex flex-col sm:flex-row justify-between">
                    <div className='mb-4 sm:mb-0'>
                      <p className="font-semibold">{request.fromLocation.address} to {request.toLocation.address}</p>
                      <p className="text-sm text-muted-foreground">
                        Journey Date: {new Date(request.journeyDate).toLocaleDateString()}
                      </p>
                       <p className="text-sm text-muted-foreground">
                        Status: <span className={`capitalize font-medium ${
                              request.status === 'pending' ? 'text-yellow-500' 
                            : request.status === 'approved' ? 'text-green-500' 
                            : request.status === 'quote_rejected' ? 'text-orange-500'
                            : 'text-red-500'}`}>{request.status.replace('_', ' ')}</span>
                      </p>
                    </div>
                     <div className="text-left sm:text-right">
                       {request.status === 'approved' && request.finalCost && (
                          <p className="font-semibold text-lg">Final Quote: ₹{request.finalCost.toLocaleString('en-IN')}</p>
                       )}
                     </div>
                  </div>
                   {request.status === 'approved' && (
                     <CardFooter className="px-0 pt-4 pb-0 flex gap-2 justify-end">
                        <Button variant="destructive" onClick={() => handleUserResponse(request.id, 'decline')}>Decline Quote</Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleUserResponse(request.id, 'accept')}>Accept & Pay</Button>
                     </CardFooter>
                   )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

