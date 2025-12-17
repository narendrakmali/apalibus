'use client';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useFirestore, useAuth } from '@/firebase';
import type { BookingRequest } from '@/hooks/use-admin-data';
import { Button } from "@/components/ui/button";
import { Link, useRouter } from '@/navigation';
import { ArrowLeft, User, Calendar, Clock, Bus, Users, MessageSquare, Tag, Check, X, Building, Car, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuthState } from 'react-firebase-hooks/auth';

function formatFirebaseTimestamp(timestamp: any) {
    if (!timestamp) return 'N/A';
    if (typeof timestamp.toDate === 'function') {
        const d = timestamp.toDate();
        return `${d.toLocaleDateString()} at ${d.toLocaleTimeString()}`;
    }
    const d = new Date(timestamp);
    return `${d.toLocaleDateString()} at ${d.toLocaleTimeString()}`;
}

export default function RequestDetailsPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const [request, setRequest] = useState<BookingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [user, userLoading] = useAuthState(auth);
  const [operator, setOperator] = useState<{ id: string, name: string } | null>(null);

  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
        router.push('/admin/login' as any);
        return;
    }
    
    const fetchOperator = async () => {
        const opDoc = await getDoc(doc(firestore, 'busOperators', user.uid));
        if (opDoc.exists()) {
            setOperator({ id: opDoc.id, name: opDoc.data().name });
        }
    };
    fetchOperator();

  }, [user, userLoading, firestore, router]);


  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);
        const docRef = doc(firestore, 'bookingRequests', params.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as BookingRequest;
          setRequest(data);
          if (data.operatorQuote) {
            setQuoteAmount(data.operatorQuote.finalCost.toString());
            setQuoteNotes(data.operatorQuote.notes);
          }
        } else {
          setError('Request not found.');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [params.id, firestore]);

  const handleUpdateStatus = async (status: 'approved' | 'rejected') => {
    if (!request || !operator) return;
    setIsSubmitting(true);
    const docRef = doc(firestore, 'bookingRequests', request.id);
    try {
      await updateDoc(docRef, {
        status: status,
        operatorQuote: {
            ...request.operatorQuote,
            finalCost: parseFloat(quoteAmount),
            notes: quoteNotes,
            operatorId: operator.id,
            operatorName: operator.name,
            timestamp: new Date(),
        }
      });
      router.push('/admin/requests' as any);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading || userLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-6 w-48 mb-8" />
        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-6">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-56 w-full" />
            </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-destructive">{error}</div>;
  }

  if (!request) {
    return <div className="p-8 text-center">Request not found.</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center mb-6">
        <Button asChild variant="outline" size="icon" className="mr-4">
            <Link href="/admin/requests"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
            <h1 className="text-2xl font-bold">Request Details</h1>
            <p className="text-muted-foreground">ID: <span className="font-mono">{params.id}</span></p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><User className="mr-2 h-5 w-5" /> Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div><strong>Name:</strong> {request.contact?.name}</div>
                    <div><strong>Mobile:</strong> {request.contact?.mobile}</div>
                    <div className="sm:col-span-2"><strong>Email:</strong> {request.contact?.email}</div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><Car className="mr-2 h-5 w-5" /> Trip Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div className="flex justify-between p-3 bg-slate-50 rounded-md">
                        <div>
                            <p className="font-semibold">{request.fromLocation.address}</p>
                            <p className="text-xs text-muted-foreground">Origin</p>
                        </div>
                        <ArrowLeft className="h-5 w-5 text-muted-foreground rotate-180" />
                         <div>
                            <p className="font-semibold">{request.toLocation.address}</p>
                            <p className="text-xs text-muted-foreground text-right">Destination</p>
                        </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div><Calendar className="inline-block mr-2 h-4 w-4" /><strong>Journey:</strong> {new Date(request.journeyDate).toLocaleDateString()} at {request.journeyTime}</div>
                        <div><Calendar className="inline-block mr-2 h-4 w-4" /><strong>Return:</strong> {new Date(request.returnDate).toLocaleDateString()} at {request.returnTime}</div>
                        <div><Bus className="inline-block mr-2 h-4 w-4" /><strong>Bus Type:</strong> {request.busType}</div>
                        <div><Users className="inline-block mr-2 h-4 w-4" /><strong>Passengers:</strong> {request.seats}</div>
                    </div>
                     {request.notes && (
                        <div className="pt-4 border-t">
                            <h4 className="font-semibold flex items-center"><MessageSquare className="mr-2 h-4 w-4" /> Customer Notes</h4>
                            <p className="text-muted-foreground mt-1 italic">"{request.notes}"</p>
                        </div>
                     )}
                </CardContent>
            </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                     <CardTitle className="flex items-center"><Tag className="mr-2 h-5 w-5" /> Provide Quote</CardTitle>
                     <CardDescription>
                         Current status: <Badge variant={request.status === 'pending' ? 'secondary' : (request.status === 'approved' ? 'default' : 'destructive')}>{request.status}</Badge>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div>
                        <label htmlFor="quoteAmount" className="text-sm font-medium">Final Quote Amount (INR)</label>
                        <Input 
                            id="quoteAmount" 
                            type="number"
                            placeholder="e.g., 50000"
                            value={quoteAmount}
                            onChange={(e) => setQuoteAmount(e.target.value)}
                            disabled={request.status !== 'pending' || isSubmitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="quoteNotes" className="text-sm font-medium">Notes for Customer</label>
                        <Textarea 
                             id="quoteNotes"
                             placeholder="e.g., Includes driver allowance and tolls."
                             value={quoteNotes}
                             onChange={(e) => setQuoteNotes(e.target.value)}
                             disabled={request.status !== 'pending' || isSubmitting}
                        />
                    </div>
                </CardContent>
            </Card>

             {request.status === 'pending' && operator && (
                 <div className="space-y-2">
                     <p className="text-xs text-center text-muted-foreground">As {operator.name}</p>
                    <Button onClick={() => handleUpdateStatus('approved')} className="w-full" disabled={isSubmitting || !quoteAmount}>
                        <Check className="mr-2 h-4 w-4" />
                        {isSubmitting ? 'Submitting...' : 'Approve & Send Quote'}
                    </Button>
                    <Button onClick={() => handleUpdateStatus('rejected')} variant="destructive" className="w-full" disabled={isSubmitting}>
                         <X className="mr-2 h-4 w-4" />
                        Reject Request
                    </Button>
                </div>
            )}
            
            {request.operatorQuote && (
                <Card className="bg-slate-50">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center">Quote Actioned</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p><Building className="inline-block mr-2 h-4 w-4"/> <strong>By:</strong> {request.operatorQuote.operatorName}</p>
                        <p><Clock className="inline-block mr-2 h-4 w-4"/> <strong>At:</strong> {formatFirebaseTimestamp(request.operatorQuote.timestamp)}</p>
                    </CardContent>
                </Card>
            )}

        </div>
      </div>
    </div>
  );
}
