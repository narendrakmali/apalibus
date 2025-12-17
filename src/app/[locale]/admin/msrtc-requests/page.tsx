'use client';
import { Link } from '@/navigation';
import { Button } from "@/components/ui/button";
import { useAdminData } from '@/hooks/use-admin-data';
import { MsrtcRequestsTable } from '@/components/admin/msrtc-requests-table';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import type { MsrtcBooking } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Bus, ArrowRight, User, Phone, Mail } from 'lucide-react';

function formatFirebaseTimestamp(timestamp: any) {
    if (!timestamp) return 'N/A';
    if (typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleDateString('en-US');
    }
    return new Date(timestamp).toLocaleDateString('en-US');
}

export default function MsrtcRequestsPage() {
    const [dataVersion, setDataVersion] = useState(0);
    const { msrtcBookings, loading, error } = useAdminData(dataVersion);
    const [selectedRequest, setSelectedRequest] = useState<MsrtcBooking | null>(null);

    const refreshData = () => setDataVersion(v => v + 1);

    return (
        <>
            <div className="container mx-auto py-8 px-4 md:px-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">MSRTC Group Requests</h1>
                    <Button asChild>
                        <Link href="/admin">Back to Dashboard</Link>
                    </Button>
                </div>
                
                <div className="border rounded-lg bg-white shadow-sm">
                    {loading ? (
                         <div className="p-4 space-y-2">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : error ? (
                        <p className="text-destructive text-center p-8">Error loading MSRTC requests: {error.message}</p>
                    ) : (
                        <MsrtcRequestsTable 
                            requests={msrtcBookings} 
                            onStatusChange={refreshData}
                            onViewDetails={setSelectedRequest}
                        />
                    )}
                </div>
            </div>

            <Dialog open={!!selectedRequest} onOpenChange={(isOpen) => !isOpen && setSelectedRequest(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>MSRTC Request Details</DialogTitle>
                        <DialogDescription>
                            Reviewing request from {selectedRequest?.organizerName}.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedRequest && (
                        <div className="py-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-muted-foreground">Request ID: {selectedRequest.id}</p>
                                <Badge variant={selectedRequest.status === 'pending' ? 'secondary' : (selectedRequest.status === 'confirmed' ? 'default' : 'destructive')} className="capitalize">
                                    {selectedRequest.status}
                                </Badge>
                            </div>
                             <div className="p-4 border rounded-lg space-y-2">
                                <h4 className="font-semibold text-sm">Organizer Info</h4>
                                <p className="text-sm flex items-center"><User className="h-4 w-4 mr-2"/> {selectedRequest.organizerName}</p>
                                <p className="text-sm flex items-center"><Phone className="h-4 w-4 mr-2"/> {selectedRequest.contactNumber}</p>
                                {selectedRequest.email && <p className="text-sm flex items-center"><Mail className="h-4 w-4 mr-2"/> {selectedRequest.email}</p>}
                            </div>
                            <div className="p-4 border rounded-lg space-y-2">
                                <h4 className="font-semibold text-sm">Trip Details</h4>
                                <div className="flex items-center text-sm">
                                    {selectedRequest.origin} <ArrowRight className="h-4 w-4 mx-2" /> {selectedRequest.destination}
                                </div>
                                <p className="text-sm flex items-center"><Calendar className="h-4 w-4 mr-2"/> Travel Date: {formatFirebaseTimestamp(selectedRequest.travelDate)}</p>
                                <p className="text-sm flex items-center"><Bus className="h-4 w-4 mr-2"/> Bus Type: {selectedRequest.busType}</p>
                            </div>
                            <div className="p-4 border rounded-lg space-y-2">
                                <h4 className="font-semibold text-sm">Passenger Info</h4>
                                <p className="text-sm flex items-center"><Users className="h-4 w-4 mr-2"/> Total Passengers: {selectedRequest.numPassengers}</p>
                                <div className="text-xs grid grid-cols-2 gap-1 text-muted-foreground">
                                    <span>Gents: {selectedRequest.numGents}</span>
                                    <span>Ladies: {selectedRequest.numLadies}</span>
                                    <span>Sr. Citizen: {selectedRequest.numSrCitizen}</span>
                                    <span>Amrit Citizen: {selectedRequest.numAmritCitizen}</span>
                                    <span>Children: {selectedRequest.numChildren}</span>
                                    <span className="font-bold">Concession Eligible: {selectedRequest.numConcession}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
