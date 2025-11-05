
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

interface EstimateDetails {
  totalCost: number;
  baseFare: number;
  driverAllowance: number;
  permitCharges: number;
  numDays: number;
  totalKm: number;
}

interface BookingRequest {
  id: string;
  fromLocation: { address: string };
  toLocation: { address:string };
  journeyDate: string;
  returnDate: string;
  busType: string;
  seatType: string;
  seats: string;
  estimate: EstimateDetails;
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

      <div className="space-y-6">
           {isLoading && <p>Loading your requests...</p>}
          {!isLoading && (!bookingRequests || bookingRequests.length === 0) ? (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground py-20">
                        <p>You have not made any booking requests yet.</p>
                    </div>
                </CardContent>
            </Card>
          ) : (
            bookingRequests?.map((request) => (
                <Card key={request.id}>
                    <CardHeader>
                        <CardTitle className="text-xl">{request.fromLocation.address} to {request.toLocation.address}</CardTitle>
                        <CardDescription>
                            Journey: {new Date(request.journeyDate).toLocaleDateString()} - {new Date(request.returnDate).toLocaleDateString()} | Bus: {request.seats} Seater, {request.busType}, {request.seatType}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Original Estimate */}
                            <div>
                                <h3 className="font-semibold mb-2">Your Estimate</h3>
                                <div className="space-y-1 text-sm p-3 rounded-lg border">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Base Fare (~{request.estimate.totalKm} km)</span>
                                        <span>₹{request.estimate.baseFare.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Driver Allowance ({request.estimate.numDays} days)</span>
                                        <span>₹{request.estimate.driverAllowance.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Permit Charges ({request.estimate.numDays} days)</span>
                                        <span>₹{request.estimate.permitCharges.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between font-bold border-t pt-1 mt-1">
                                        <span>Total Estimate</span>
                                        <span>₹{request.estimate.totalCost.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Operator Quote */}
                            <div>
                                <h3 className="font-semibold mb-2">Operator Quote</h3>
                                <div className="p-3 rounded-lg border h-full flex flex-col justify-center items-center">
                                    <p className="text-lg font-bold capitalize mb-2">
                                        Status: <span className={`font-bold ${
                                            request.status === 'pending' ? 'text-yellow-500' 
                                            : request.status === 'approved' ? 'text-green-500' 
                                            : request.status === 'quote_rejected' ? 'text-orange-500'
                                            : 'text-red-500'}`}>{request.status.replace('_', ' ')}
                                        </span>
                                    </p>
                                    
                                    {request.status === 'approved' && request.finalCost ? (
                                        <p className="text-2xl font-bold text-green-600">
                                            Final Quote: ₹{request.finalCost.toLocaleString('en-IN')}
                                        </p>
                                    ) : request.status === 'pending' ? (
                                        <p className="text-muted-foreground text-center">Waiting for operator to review and provide a final quote.</p>
                                    ): (
                                        <p className="text-muted-foreground text-center">This request has been closed.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    {request.status === 'approved' && (
                        <CardFooter className="flex gap-2 justify-end bg-secondary/50 py-3">
                            <Button variant="destructive" onClick={() => handleUserResponse(request.id, 'decline')}>Decline Quote</Button>
                            <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleUserResponse(request.id, 'accept')}>Accept & Pay</Button>
                        </CardFooter>
                    )}
                </Card>
            ))
          )}
        </div>
    </div>
  );
}
