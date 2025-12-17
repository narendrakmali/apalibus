'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from '@/navigation';
import { MsrtcRequestsTable } from '@/components/admin/msrtc-requests-table';
import { useAdminData } from '@/hooks/use-admin-data';
import { Skeleton } from '@/components/ui/skeleton';
import { MsrtcBooking } from '@/lib/types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export default function TicketDispatchPage() {
    const [dataVersion, setDataVersion] = useState(0);
    const { msrtcBookings, loading, error } = useAdminData(dataVersion);
    const firestore = useFirestore();

    const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const refreshData = () => setDataVersion(v => v + 1);

    const confirmedRequests = msrtcBookings.filter(req => req.status === 'confirmed');

    const handleGenerateAndDispatch = async () => {
        setIsProcessing(true);
        const requestsToDispatch = confirmedRequests.filter(req => selectedRequests.includes(req.id));
        if (requestsToDispatch.length === 0) {
            alert("No confirmed requests selected for dispatch.");
            setIsProcessing(false);
            return;
        }

        // 1. Generate PDF
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("MSRTC Group Booking - Final Ticket", 14, 22);
        doc.setFontSize(11);
        doc.text(`Dispatch Date: ${new Date().toLocaleDateString()}`, 14, 30);
        
        const tableData = requestsToDispatch.map(req => [
            req.id,
            req.organizerName,
            req.contactNumber,
            `${req.origin} -> ${req.destination}`,
            new Date(req.travelDate.seconds * 1000).toLocaleDateString(),
            req.numPassengers.toString(),
            req.numConcession?.toString() || '0'
        ]);

        (doc as any).autoTable({
            startY: 40,
            head: [['Request ID', 'Organizer', 'Contact', 'Route', 'Travel Date', 'Passengers', 'Concession']],
            body: tableData,
        });

        doc.save('MSRTC_Group_Dispatch.pdf');
        
        // 2. Update status in Firestore
        const updatePromises = requestsToDispatch.map(req => {
            const docRef = doc(firestore, 'msrtcBookings', req.id);
            const updateData = { status: 'fulfilled' };
            return updateDoc(docRef, updateData).catch(err => {
                 const permissionError = new FirestorePermissionError({
                    path: docRef.path,
                    operation: 'update',
                    requestResourceData: updateData
                 });
                 errorEmitter.emit('permission-error', permissionError);
                 throw permissionError; // re-throw to be caught by Promise.all
            });
        });

        try {
            await Promise.all(updatePromises);
        } catch(err) {
            console.error("Failed to update all statuses:", err);
            // Even if some updates fail, we refresh the data to show what succeeded.
        } finally {
            refreshData();
            setSelectedRequests([]);
            setIsProcessing(false);
        }
    };
    
    // This is a placeholder since the MsrtcRequestsTable doesn't have selection yet
    // In a real app, you'd have checkboxes in the table to populate selectedRequests
    const handleSelectAllForDispatch = () => {
        setSelectedRequests(confirmedRequests.map(r => r.id));
    }


    return (
        <div className="container mx-auto py-8 px-4 md:px-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">MSRTC Ticket Dispatch</h1>
                <Button asChild>
                    <Link href="/admin">Back to Dashboard</Link>
                </Button>
            </div>

             <div className="border rounded-lg bg-white shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold mb-2">Dispatch Confirmed Bookings</h2>
                <p className="text-sm text-muted-foreground mb-4">
                    This will generate a consolidated PDF for all selected 'confirmed' requests and mark them as 'fulfilled'.
                    Currently, this action selects all confirmed requests.
                </p>
                <div className="flex gap-4">
                    <Button onClick={handleGenerateAndDispatch} disabled={isProcessing}>
                        {isProcessing ? 'Processing...' : `Generate & Dispatch (${selectedRequests.length})`}
                    </Button>
                     <Button onClick={handleSelectAllForDispatch} variant="secondary">
                        Select All Confirmed
                    </Button>
                </div>
            </div>
            
            <div className="border rounded-lg bg-white shadow-sm">
                <h2 className="text-lg font-semibold p-4 border-b">Confirmed Requests Ready for Dispatch</h2>
                {loading ? (
                    <div className="p-4 space-y-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : error ? (
                    <p className="text-destructive text-center p-8">Error loading data: {error.message}</p>
                ) : (
                    <MsrtcRequestsTable requests={confirmedRequests} onStatusChange={refreshData} />
                )}
            </div>
        </div>
    );
}
