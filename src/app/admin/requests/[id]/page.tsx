
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth, useFirestore } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter, useParams } from 'next/navigation';
import type { BookingRequest } from '@/lib/types';
import { ArrowLeft, Calendar, Users, Bus, MapPin, DollarSign, Edit } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useOperatorData } from '@/hooks/use-operator-data';
import { useAuthState } from 'react-firebase-hooks/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

function formatFirebaseTimestamp(timestamp: any) {
    if (!timestamp) return 'N/A';
    if (typeof timestamp.toDate === 'function') return timestamp.toDate().toLocaleDateString('en-US');
    return new Date(timestamp).toLocaleDateString('en-US');
}


export default function ProvideQuotePage() {
  const params = useParams();
  const id = params.id as string;
  const [request, setRequest] = useState<BookingRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [finalCost, setFinalCost] = useState('');
  const [availableBus, setAvailableBus] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const firestore = useFirestore();
  const auth = useAuth();
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();

  // The operatorId should be the current logged-in user's UID.
  // Assuming the admin might be logged in, we'll fetch all buses for a relevant operator.
  // In a multi-operator system, you'd scope this better.
  const { buses, loading: busesLoading } = useOperatorData(user?.uid);

  useEffect(() => {
    if (!id) {
      setError("No request ID provided.");
      setIsLoading(false);
      return;
    }
    const fetchRequest = async () => {
      try {
        const docRef = doc(firestore, "bookingRequests", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as BookingRequest;
          setRequest(data);
          if (data.estimate) {
            setFinalCost(data.estimate.totalCost.toString());
          }
        } else {
          setError("No such request found.");
        }
      } catch (err: any) {
        setError("Failed to fetch request details.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequest();
  }, [id, firestore]);

  const handleSubmitQuote = async () => {
    if (!finalCost || !availableBus) {
        alert("Please provide a final cost and select an available bus.");
        return;
    }
    if (!user) {
        alert("You must be logged in to submit a quote.");
        return;
    }

    setIsSubmitting(true);
    const requestRef = doc(firestore, 'bookingRequests', id);
    const quoteData = {
        status: 'approved',
        operatorQuote: {
            finalCost: parseFloat(finalCost),
            availableBus: availableBus,
            notes: notes,
            operatorId: user.uid, 
            operatorName: user.displayName || user.email,
            quotedAt: new Date(),
        }
    };

    updateDoc(requestRef, quoteData)
        .then(() => {
            router.push('/admin/requests');
        })
        .catch((serverError) => {
            const permissionError = new FirestorePermissionError({
                path: requestRef.path,
                operation: 'update',
                requestResourceData: quoteData,
            });
            errorEmitter.emit('permission-error', permissionError);
        })
        .finally(() => {
            setIsSubmitting(false);
        });
  }

  if (isLoading || authLoading) {
    return (
        <div className="container mx-auto py-8 px-4 md:px-6 max-w-4xl">
             <Skeleton className="h-8 w-40 mb-8" />
             <div className="grid md:grid-cols-2 gap-8">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
    );
  }

  if (error) {
    return <p className="text-center text-destructive py-10">{error}</p>;
  }

  if (!request) {
    return <p className="text-center text-muted-foreground py-10">Request not found.</p>;
  }
  
  const costVariance = request.estimate ? parseFloat(finalCost) - request.estimate.totalCost : 0;

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8">
        <Button asChild variant="outline" size="sm" className="mb-4">
            <Link href="/admin/requests">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Requests
            </Link>
        </Button>
        <h1 className="text-3xl font-bold font-display text-primary">Provide Quote</h1>
        <p className="text-muted-foreground">Review the user's request and provide a final quotation.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Request Details */}
        <Card>
            <CardHeader>
                <CardTitle>Request Details</CardTitle>
                <CardDescription>ID: {request.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="font-semibold">Contact: {request.contact?.name} ({request.contact?.mobile})</div>
                <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 mt-1 text-muted-foreground" />
                    <div>
                        <p className="font-medium">Trip Route</p>
                        <p className="text-sm text-muted-foreground">{request.fromLocation.address} to {request.toLocation.address}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="font-medium">Dates</p>
                        <p className="text-sm text-muted-foreground">{formatFirebaseTimestamp(request.journeyDate)} - {formatFirebaseTimestamp(request.returnDate)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="font-medium">Passengers</p>
                        <p className="text-sm text-muted-foreground">{request.seats}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Bus className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="font-medium">Bus Preference</p>
                        <p className="text-sm text-muted-foreground">{request.busType} ({request.seatType || 'Any'})</p>
                    </div>
                </div>
                {request.estimate && (
                    <div className="flex items-center gap-3 border-t pt-4">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="font-medium">User's Estimated Cost</p>
                            <p className="text-sm text-muted-foreground">{request.estimate.totalCost.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>

        {/* Quote Form */}
        <Card className="bg-secondary/30">
             <CardHeader>
                <CardTitle>Create Quote</CardTitle>
                <CardDescription>Set the final price and assign a bus.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="space-y-2">
                    <Label htmlFor="final-cost">Final Cost (INR)</Label>
                    <Input id="final-cost" type="number" placeholder="e.g., 55000" value={finalCost} onChange={(e) => setFinalCost(e.target.value)} />
                    {request.estimate && (
                        <p className={`text-xs ${costVariance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                           Variance: {costVariance.toLocaleString('en-IN', { signDisplay: 'always' })}
                        </p>
                    )}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="available-bus">Assign Bus</Label>
                     <Select onValueChange={setAvailableBus} value={availableBus}>
                        <SelectTrigger id="available-bus">
                            <SelectValue placeholder={busesLoading ? "Loading buses..." : "Select an available bus"} />
                        </SelectTrigger>
                        <SelectContent>
                            {!busesLoading && buses.map(bus => (
                                <SelectItem key={bus.id} value={bus.id}>
                                    {bus.registrationNumber} ({bus.seatingCapacity} Seats, {bus.busType})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="notes">Notes for Customer (Optional)</Label>
                    <Textarea id="notes" placeholder="e.g., Mention any specific inclusions or terms." value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
                 <Button onClick={handleSubmitQuote} disabled={isSubmitting} className="w-full">
                    {isSubmitting ? 'Submitting...' : 'Submit Quote & Approve'}
                 </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
