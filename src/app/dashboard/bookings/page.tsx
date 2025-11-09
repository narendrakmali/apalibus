
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
import { collection, query, where, doc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface EstimateDetails {
  totalCost: number;
  baseFare: number;
  driverAllowance: number;
  permitCharges: number;
  numDays: number;
  totalKm: number;
}

interface OperatorQuote {
    finalCost?: number;
    availableBus?: string;
    costVariance?: number;
    discount?: number;
    notes?: string;
    interiorImageUrl?: string;
    exteriorImageUrl?: string;
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
  operatorQuote?: OperatorQuote;
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
          updateDocumentNonBlocking(requestDocRef, { status: 'quote_rejected' });
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
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-xl">{request.fromLocation.address} to {request.toLocation.address}</CardTitle>
                                <CardDescription>
                                    Journey: {new Date(request.journeyDate).toLocaleDateString()} - {new Date(request.returnDate).toLocaleDateString()} | Bus: {request.seats} Seater, {request.busType}, {request.seatType}
                                </CardDescription>
                            </div>
                            <p className="text-lg font-bold capitalize shrink-0 pl-4">
                                Status: <span className={`font-bold ${
                                    request.status === 'pending' ? 'text-yellow-500' 
                                    : request.status === 'approved' ? 'text-green-500' 
                                    : request.status === 'quote_rejected' ? 'text-orange-500'
                                    : 'text-red-500'}`}>{request.status.replace('_', ' ')}
                                </span>
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold mb-2">Your Estimate</h3>
                                <div className="space-y-1 text-sm p-3 rounded-lg border">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Base Fare (~{request.estimate.totalKm} km)</span>
                                        <span>{request.estimate.baseFare.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Driver Allowance ({request.estimate.numDays} days)</span>
                                        <span>{request.estimate.driverAllowance.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Permit Charges ({request.estimate.numDays} days)</span>
                                        <span>{request.estimate.permitCharges.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between font-bold border-t pt-1 mt-1">
                                        <span>Total Estimate</span>
                                        <span>{request.estimate.totalCost.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="font-semibold mb-2">Operator Quote</h3>
                                <div className="p-3 rounded-lg border h-full">
                                    {request.status === 'approved' && request.operatorQuote ? (
                                        <div className="space-y-1 text-sm">
                                            {request.operatorQuote.availableBus && <p><strong>Available Bus:</strong> {request.operatorQuote.availableBus}</p>}
                                            {request.operatorQuote.costVariance ? <div className="flex justify-between"><span className="text-muted-foreground">Cost Variance</span><span>{request.operatorQuote.costVariance.toLocaleString('en-IN')}</span></div> : null}
                                            {request.operatorQuote.discount ? <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className='text-green-600'>- {request.operatorQuote.discount.toLocaleString('en-IN')}</span></div> : null}
                                            {request.operatorQuote.notes && <p className="text-xs text-muted-foreground pt-2 italic"><strong>Note:</strong> {request.operatorQuote.notes}</p>}
                                            <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                                                <span>Final Quote</span>
                                                <span className="text-green-600">{request.operatorQuote.finalCost?.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <div>
                                                    <h4 className="font-medium text-xs mb-1">Exterior</h4>
                                                    <Image src={request.operatorQuote.exteriorImageUrl || 'https://picsum.photos/seed/bus-ext/600/400'} alt="Bus Exterior" width={600} height={400} className="rounded-md" data-ai-hint="bus exterior" />
                                                </div>
                                                <div>
                                                     <h4 className="font-medium text-xs mb-1">Interior</h4>
                                                    <Image src={request.operatorQuote.interiorImageUrl || 'https://picsum.photos/seed/bus-int/600/400'} alt="Bus Interior" width={600} height={400} className="rounded-md" data-ai-hint="bus interior" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : request.status === 'pending' ? (
                                        <div className="flex items-center justify-center h-full text-muted-foreground text-center">Waiting for operator to review and provide a final quote.</div>
                                    ): (
                                        <div className="flex items-center justify-center h-full text-muted-foreground text-center">This request has been closed.</div>
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
