
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAdminData } from '@/hooks/use-admin-data';
import { ArrowLeft, Download, Upload, Send } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useAuth, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import type { MsrtcBooking } from '@/lib/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { doc, updateDoc } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


const TicketDispatchPage = () => {
  const auth = useAuth();
  const firestore = useFirestore();
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  const [dataVersion, setDataVersion] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  const { msrtcBookings, loading: dataLoading } = useAdminData(dataVersion);

  const confirmedBookings = useMemo(() => {
    return msrtcBookings.filter(b => b.status === 'confirmed');
  }, [msrtcBookings]);

  const groupedBookings = useMemo(() => {
    const groups: { [key: string]: MsrtcBooking[] } = {};
    confirmedBookings.forEach(booking => {
      const travelDate = booking.travelDate.toDate ? booking.travelDate.toDate().toISOString().split('T')[0] : new Date(booking.travelDate).toISOString().split('T')[0];
      const key = `${travelDate}_${booking.origin}_${booking.destination}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(booking);
    });
    return groups;
  }, [confirmedBookings]);
  
  const isLoading = authLoading || dataLoading;
  
  const handleDataChange = () => setDataVersion(v => v + 1);

  const handleDownloadPassengerList = (booking: MsrtcBooking) => {
    const doc = new jsPDF();
    autoTable(doc, {
        head: [['Passenger Name', 'Age', 'Gender']],
        body: booking.passengers.map(p => [p.name, p.age, p.gender]),
        didDrawPage: (data) => {
            doc.setFontSize(20);
            doc.text(`Passenger List for ${booking.organizerName}`, data.settings.margin.left, 15);
            doc.setFontSize(10);
            doc.text(`Booking ID: ${booking.id}`, data.settings.margin.left, 20);
            doc.text(`Travel Date: ${booking.travelDate.toDate ? booking.travelDate.toDate().toLocaleDateString() : new Date(booking.travelDate).toLocaleDateString()}`, data.settings.margin.left, 25);
        },
        startY: 30,
    });
    doc.save(`passenger-list-${booking.id}.pdf`);
  };

  const handleFulfillRequest = async (bookingId: string) => {
    const requestRef = doc(firestore, 'msrtcBookings', bookingId);
    const updateData = { status: 'fulfilled' };
    updateDoc(requestRef, updateData)
        .then(() => {
            handleDataChange();
        })
        .catch((serverError) => {
            const permissionError = new FirestorePermissionError({
                path: requestRef.path,
                operation: 'update',
                requestResourceData: updateData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  };

  const renderContent = () => {
     if (isLoading) {
        return <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
    }
    if (Object.keys(groupedBookings).length === 0) {
        return <p className="text-center text-muted-foreground py-10">No confirmed MSRTC bookings ready for dispatch.</p>;
    }
    return (
        <div className="space-y-8">
            {Object.entries(groupedBookings).map(([key, bookings]) => {
                const [date, origin, destination] = key.split('_');
                const totalPassengers = bookings.reduce((sum, b) => sum + b.numPassengers, 0);

                return (
                    <Card key={key} className="bg-secondary/30">
                        <CardHeader>
                            <CardTitle className="text-xl">
                                {origin} to {destination} on {new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </CardTitle>
                            <CardDescription>
                                Total of {totalPassengers} passengers across {bookings.length} request(s). These can likely be consolidated.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           {bookings.map(booking => (
                                <div key={booking.id} className="p-4 border rounded-lg bg-background flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                   <div>
                                       <p className="font-semibold">{booking.organizerName} ({booking.numPassengers} passengers)</p>
                                       <p className="text-sm text-muted-foreground">ID: {booking.id}</p>
                                   </div>
                                    <div className="flex flex-wrap gap-2 items-center">
                                       <Button variant="outline" size="sm" onClick={() => handleDownloadPassengerList(booking)}>
                                           <Download className="mr-2 h-4 w-4" />
                                           Passenger List
                                       </Button>
                                       <div className="flex items-center gap-2">
                                           <Input type="file" id={`ticket-upload-${booking.id}`} className="text-xs h-9 w-48" />
                                           <Button size="sm" onClick={() => handleFulfillRequest(booking.id)}>
                                               <Send className="mr-2 h-4 w-4" />
                                               Dispatch
                                           </Button>
                                       </div>
                                   </div>
                                </div>
                           ))}
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8">
        <Button asChild variant="outline" size="sm" className="mb-4">
            <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Link>
        </Button>
        <h1 className="text-3xl font-bold font-display text-primary">MSRTC Ticket Dispatch</h1>
        <p className="text-muted-foreground">Consolidate groups and upload final tickets for confirmed bookings.</p>
      </div>
      
      {renderContent()}

    </div>
  );
};

export default TicketDispatchPage;
