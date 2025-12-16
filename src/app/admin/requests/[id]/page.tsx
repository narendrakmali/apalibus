
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useFirestore, useAuth } from '@/firebase';
import { useParams, useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ArrowLeft, Car, Clock, Hash, Mail, MapPin, Phone, User, Users, Calendar, DollarSign, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import type { BookingRequest } from '@/hooks/use-admin-data';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useAdminData } from '@/hooks/use-admin-data';
import { Link } from '@/navigation';

export default function RequestDetailsPage() {
  const { id } = useParams() as { id: string };
  const firestore = useFirestore();
  const auth = useAuth();
  const [request, setRequest] = useState<BookingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth);
  const router = useRouter();

  const { operators, loading: operatorsLoading } = useAdminData();
  const [finalCost, setFinalCost] = useState<number | string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ title: '', description: '' });

  useEffect(() => {
    if (!id) return;
    const docRef = doc(firestore, 'bookingRequests', id);
    getDoc(docRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as BookingRequest;
          setRequest(data);
          setFinalCost(data.operatorQuote?.finalCost || '');
          setNotes(data.operatorQuote?.notes || '');
        } else {
          console.log('No such document!');
        }
      })
      .finally(() => setLoading(false));
  }, [id, firestore]);

  const handleUpdateQuote = async (status: 'approved' | 'rejected') => {
    if (!request || !user) return;

    if (status === 'approved' && (!finalCost || Number(finalCost) <= 0)) {
        setAlertInfo({ title: 'Invalid Cost', description: 'Please enter a valid final cost greater than zero.' });
        setShowAlert(true);
        return;
    }
    
    setIsSubmitting(true);
    const docRef = doc(firestore, 'bookingRequests', id);
    
    const operator = operators.find(op => op.id === user.uid);
    
    const quoteData = {
      status: status,
      operatorQuote: {
        finalCost: Number(finalCost),
        notes: notes,
        operatorId: user.uid,
        operatorName: operator?.name || user.email,
        timestamp: new Date(),
      },
    };

    try {
      await updateDoc(docRef, quoteData);
      setAlertInfo({ title: 'Success', description: `The quote has been successfully ${status}.` });
      setShowAlert(true);
      router.push('/admin/requests' as any);
    } catch (serverError) {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: quoteData,
      });
      errorEmitter.emit('permission-error', permissionError);
      setAlertInfo({ title: 'Error', description: 'Failed to update quote due to insufficient permissions.' });
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };


  if (loading || operatorsLoading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return <div className="text-center py-10">Request not found.</div>;
  }

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) { // Firebase Timestamp
      return timestamp.toDate().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    }
    return new Date(timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  };
  
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { dateStyle: 'medium' });

  return (
    <div className="container mx-auto p-4 md:p-6">
       <Link href={"/admin/requests" as any} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to All Requests
      </Link>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Request Details</span>
                <span className="text-sm font-mono text-muted-foreground bg-secondary px-2 py-1 rounded-md">{request.id}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground"/>
                    <div><span className="font-semibold">From:</span> {request.fromLocation.address}</div>
                </div>
                <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground"/>
                    <div><span className="font-semibold">To:</span> {request.toLocation.address}</div>
                </div>
                 <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 mt-1 text-muted-foreground"/>
                    <div><span className="font-semibold">Journey:</span> {formatDate(request.journeyDate)} at {request.journeyTime}</div>
                </div>
                 <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 mt-1 text-muted-foreground"/>
                    <div><span className="font-semibold">Return:</span> {formatDate(request.returnDate)} at {request.returnTime}</div>
                </div>
                 <div className="flex items-start gap-3">
                    <Car className="h-4 w-4 mt-1 text-muted-foreground"/>
                    <div><span className="font-semibold">Bus Type:</span> {request.busType}</div>
                </div>
                 <div className="flex items-start gap-3">
                    <Users className="h-4 w-4 mt-1 text-muted-foreground"/>
                    <div><span className="font-semibold">Passengers:</span> {request.seats}</div>
                </div>
                 <div className="col-span-2 flex items-start gap-3">
                    <StickyNote className="h-4 w-4 mt-1 text-muted-foreground"/>
                    <div><span className="font-semibold">Customer Notes:</span> {request.notes || 'N/A'}</div>
                </div>
            </CardContent>
          </Card>

           <Card>
            <CardHeader><CardTitle>Customer Contact</CardTitle></CardHeader>
             <CardContent className="grid grid-cols-2 gap-4 text-sm">
                 <div className="flex items-center gap-3"><User className="h-4 w-4 text-muted-foreground"/> <div>{request.contact?.name}</div></div>
                 <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground"/> <div>{request.contact?.mobile}</div></div>
                 <div className="col-span-2 flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground"/> <div>{request.contact?.email}</div></div>
             </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Provide Quote</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="finalCost">Final Cost (INR)</Label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <Input id="finalCost" type="number" placeholder="e.g., 55000" value={finalCost} onChange={e => setFinalCost(e.target.value)} className="pl-8"/>
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes for Customer</Label>
                <Textarea id="notes" placeholder="e.g., Includes driver allowance. Toll charges extra." value={notes} onChange={e => setNotes(e.target.value)}/>
              </div>
               <div className="flex gap-2">
                <Button className="w-full" onClick={() => handleUpdateQuote('approved')} disabled={isSubmitting || request.status === 'approved'}>
                    {request.status === 'approved' ? 'Approved' : 'Approve & Send Quote'}
                </Button>
                <Button variant="destructive" className="w-full" onClick={() => handleUpdateQuote('rejected')} disabled={isSubmitting || request.status === 'rejected'}>
                    {request.status === 'rejected' ? 'Rejected' : 'Reject Request'}
                </Button>
               </div>
            </CardContent>
          </Card>
           {request.operatorQuote && (
                <Card className="bg-secondary">
                    <CardHeader><CardTitle>Quote History</CardTitle></CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p><span className="font-semibold">Last Action By:</span> {request.operatorQuote.operatorName}</p>
                        <p><span className="font-semibold">Last Cost Quoted:</span> ₹{request.operatorQuote.finalCost.toLocaleString()}</p>
                        <p><span className="font-semibold">Last Status:</span> <span className="capitalize font-medium">{request.status.replace('_', ' ')}</span></p>
                        <p><span className="font-semibold">Timestamp:</span> {formatTimestamp(request.operatorQuote.timestamp)}</p>
                    </CardContent>
                </Card>
           )}
        </div>
      </div>
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{alertInfo.title}</AlertDialogTitle>
                <AlertDialogDescription>{alertInfo.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => setShowAlert(false)}>OK</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
