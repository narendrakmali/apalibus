
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface Bus {
    id: string;
    registrationNumber: string;
    seatingCapacity: number;
    busType: string;
    seatType: string;
    interiorImageUrl?: string;
    exteriorImageUrl?: string;
}
interface EstimateDetails {
  totalCost: number;
}

interface OperatorQuote {
    finalCost?: number;
    availableBus?: string;
    costVariance?: number;
    discount?: number;
    notes?: string;
    interiorImageUrl?: string;
    exteriorImageUrl?: string;
    operatorId?: string;
    operatorName?: string;
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
  operatorQuote?: OperatorQuote;
}

interface QuoteFormState {
    finalCost: string;
    availableBusId: string;
    costVariance: string;
    discount: string;
    notes: string;
}

export default function OperatorBookingsPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const router = useRouter();
  const [quoteForms, setQuoteForms] = useState<Record<string, QuoteFormState>>({});

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/operator-login');
    }
  }, [isUserLoading, user, router]);

  const bookingRequestsQuery = useMemoFirebase(() => {
    if (!firestore || isUserLoading || !user) return null;
    return query(collection(firestore, 'bookingRequests'));
  }, [firestore, isUserLoading, user]);

  const operatorBusesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `busOperators/${user.uid}/buses`);
  }, [firestore, user]);

  const { data: bookingRequests, isLoading } = useCollection<BookingRequest>(bookingRequestsQuery);
  const { data: operatorBuses, isLoading: isLoadingBuses } = useCollection<Bus>(operatorBusesQuery);
  
  const handleFormChange = (id: string, field: keyof QuoteFormState, value: string) => {
    setQuoteForms(prev => ({
        ...prev,
        [id]: {
            ...prev[id],
            [field]: value,
        }
    }));
  };

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    if (!firestore || !operatorBuses || !user) return;
    const requestDocRef = doc(firestore, 'bookingRequests', id);
    
    const formState = quoteForms[id] || {};

    let operatorQuoteUpdate: OperatorQuote = {
        operatorId: user.uid,
        operatorName: user.displayName || 'N/A'
    };

    if (status === 'approved') {
        const finalCost = parseFloat(formState.finalCost);
        if (!finalCost || isNaN(finalCost)) {
            alert('Please enter a valid final cost before approving.');
            return;
        }

        const selectedBus = operatorBuses.find(bus => bus.id === formState.availableBusId);

        operatorQuoteUpdate = {
            ...operatorQuoteUpdate,
            finalCost,
            availableBus: selectedBus ? `${selectedBus.seatingCapacity} Seater ${selectedBus.busType} (${selectedBus.registrationNumber})` : 'Details not available',
            costVariance: parseFloat(formState.costVariance) || 0,
            discount: parseFloat(formState.discount) || 0,
            notes: formState.notes || '',
            interiorImageUrl: selectedBus?.interiorImageUrl,
            exteriorImageUrl: selectedBus?.exteriorImageUrl,
        };
    }
    
    const updateData = {
        status,
        operatorQuote: operatorQuoteUpdate
    };
    
    updateDocumentNonBlocking(requestDocRef, updateData);
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
                    {request.operatorQuote?.operatorName && request.status !== 'pending' && (
                        <span className="text-xs text-muted-foreground"> by {request.operatorQuote.operatorName}</span>
                    )}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                <p className="text-sm"><strong>Journey:</strong> {new Date(request.journeyDate).toLocaleDateString()} - {new Date(request.returnDate).toLocaleDateString()}</p>
                <p className="text-sm"><strong>Requested Bus:</strong> {request.seats} Seater, {request.busType}, {request.seatType}</p>
                <p className="text-sm"><strong>User Estimate:</strong> {request.estimate.totalCost.toLocaleString('en-IN')}</p>
                 {request.status === 'approved' && request.operatorQuote?.finalCost && (
                     <p className="text-sm font-semibold text-green-600"><strong>Final Quote:</strong> {request.operatorQuote.finalCost.toLocaleString('en-IN')}</p>
                 )}
              </CardContent>
              {request.status === 'pending' && (
                <CardFooter className="flex flex-col items-start gap-4 bg-secondary/30 p-4">
                  <div className="w-full grid grid-cols-2 gap-4">
                    <div className="grid gap-2 col-span-2">
                        <Label htmlFor={`final-cost-${request.id}`}>Final Cost (Required)</Label>
                        <Input 
                            id={`final-cost-${request.id}`}
                            type="number"
                            placeholder="e.g., 25000"
                            value={quoteForms[request.id]?.finalCost || ''}
                            onChange={(e) => handleFormChange(request.id, 'finalCost', e.target.value)}
                        />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor={`cost-variance-${request.id}`}>Cost Variance</Label>
                        <Input 
                            id={`cost-variance-${request.id}`}
                            type="number"
                            placeholder="e.g., 500 or -200"
                            value={quoteForms[request.id]?.costVariance || ''}
                            onChange={(e) => handleFormChange(request.id, 'costVariance', e.target.value)}
                        />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor={`discount-${request.id}`}>Discount</Label>
                        <Input 
                            id={`discount-${request.id}`}
                            type="number"
                            placeholder="e.g., 1000"
                            value={quoteForms[request.id]?.discount || ''}
                            onChange={(e) => handleFormChange(request.id, 'discount', e.target.value)}
                        />
                    </div>
                     <div className="grid gap-2 col-span-2">
                        <Label htmlFor={`available-bus-${request.id}`}>Available Bus</Label>
                        <Select onValueChange={(value) => handleFormChange(request.id, 'availableBusId', value)} value={quoteForms[request.id]?.availableBusId || ''}>
                          <SelectTrigger id={`available-bus-${request.id}`}>
                            <SelectValue placeholder="Select a bus from your fleet" />
                          </SelectTrigger>
                          <SelectContent>
                            {isLoadingBuses ? <SelectItem value="loading" disabled>Loading buses...</SelectItem> 
                            : operatorBuses?.map(bus => (
                                <SelectItem key={bus.id} value={bus.id}>{bus.registrationNumber} ({bus.seatingCapacity} Seater {bus.busType})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </div>
                     <div className="grid gap-2 col-span-2">
                        <Label htmlFor={`notes-${request.id}`}>Notes for Customer</Label>
                        <Textarea 
                            id={`notes-${request.id}`}
                            placeholder="e.g., Toll and parking charges borne by customer."
                            value={quoteForms[request.id]?.notes || ''}
                            onChange={(e) => handleFormChange(request.id, 'notes', e.target.value)}
                        />
                    </div>
                  </div>
                  <div className="flex gap-2 w-full mt-2">
                    <Button variant="outline" className="w-full" onClick={() => handleStatusUpdate(request.id, 'rejected')}>Reject</Button>
                    <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(request.id, 'approved')}>Approve Quote</Button>
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
