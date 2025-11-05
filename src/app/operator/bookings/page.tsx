
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, doc, query, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMemoFirebase } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EstimateDetails {
  totalCost: number;
}

interface BookingRequest {
  id: string;
  fromLocation: { address: string };
  toLocation: { address: string };
  journeyDate: string;
  returnDate: string;
  busType: string;
  seatType: string;
  seats: string;
  estimate: EstimateDetails;
  status: 'pending' | 'approved' | 'rejected' | 'quote_rejected';
  userId: string;
  finalCost?: number;
}

export default function OperatorBookingsPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const router = useRouter();
  const [finalCosts, setFinalCosts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/operator-login');
    }
  }, [isUserLoading, user, router]);

  const bookingRequestsQuery = useMemoFirebase(() => {
    // Only construct the query if firestore is available and the user is loaded and present.
    if (!firestore || isUserLoading || !user) return null;
    return query(collection(firestore, 'bookingRequests'));
  }, [firestore, isUserLoading, user]);

  const { data: bookingRequests, isLoading } = useCollection<BookingRequest>(bookingRequestsQuery);

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    if (!firestore) return;
    const requestDocRef = doc(firestore, 'bookingRequests', id);
    const updateData: { status: 'approved' | 'rejected'; finalCost?: number } = { status };

    if (status === 'approved') {
        const cost = parseFloat(finalCosts[id]);
        if (!cost || isNaN(cost)) {
            alert('Please enter a valid final cost before approving.');
            return;
        }
        updateData.finalCost = cost;
    }
    
    await updateDoc(requestDocRef, updateData);
  };
  
  const handleFinalCostChange = (id: string, value: string) => {
    setFinalCosts(prev => ({...prev, [id]: value}));
  };

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
       {isLoading && <p>Loading requests...</p>}
      {!isLoading && (!bookingRequests || bookingRequests.length === 0) ? (
        <Card>
            <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-20">
                    <p>There are no pending booking requests.</p>
                </div>
            </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookingRequests?.map((request) => (
            <Card key={request.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">{request.fromLocation.address} to {request.toLocation.address}</CardTitle>
                <CardDescription>
                  Status: <span className={`capitalize font-medium ${
                    request.status === 'pending' ? 'text-yellow-500' 
                    : request.status === 'approved' ? 'text-green-500' 
                    : request.status === 'quote_rejected' ? 'text-orange-500'
                    : 'text-red-500'}`}>{request.status.replace('_', ' ')}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                <p className="text-sm"><strong>Journey:</strong> {new Date(request.journeyDate).toLocaleDateString()} - {new Date(request.returnDate).toLocaleDateString()}</p>
                <p className="text-sm"><strong>Bus:</strong> {request.seats} Seater, {request.busType}, {request.seatType}</p>
                <p className="text-sm"><strong>User Estimate:</strong> ₹{request.estimate.totalCost.toLocaleString('en-IN')}</p>
                 {request.status === 'approved' && request.finalCost && (
                     <p className="text-sm font-semibold text-green-600"><strong>Final Cost:</strong> ₹{request.finalCost.toLocaleString('en-IN')}</p>
                 )}
              </CardContent>
              {request.status === 'pending' && (
                <CardFooter className="flex flex-col items-start gap-4">
                  <div className="w-full grid gap-2">
                    <Label htmlFor={`final-cost-${request.id}`}>Set Final Cost</Label>
                    <Input 
                        id={`final-cost-${request.id}`}
                        type="number"
                        placeholder="e.g., 25000"
                        value={finalCosts[request.id] || ''}
                        onChange={(e) => handleFinalCostChange(request.id, e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 w-full">
                    <Button variant="outline" className="w-full" onClick={() => handleStatusUpdate(request.id, 'reject')}>Reject</Button>
                    <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(request.id, 'approve')}>Approve</Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
