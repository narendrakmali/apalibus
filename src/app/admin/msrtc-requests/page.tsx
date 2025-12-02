
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAdminData } from '@/hooks/use-admin-data';
import { MsrtcRequestsTable } from '@/components/admin/msrtc-requests-table';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import type { MsrtcBooking } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


const RequestDetailsModal = ({ request, isOpen, onClose }: { request: MsrtcBooking | null, isOpen: boolean, onClose: () => void }) => {
    if (!request) return null;
    
    function formatFirebaseTimestamp(timestamp: any) {
        if (!timestamp) return 'N/A';
        if (typeof timestamp.toDate === 'function') {
            return timestamp.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        }
        return new Date(timestamp).toLocaleDateString('en-US');
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Request Details</DialogTitle>
                    <DialogDescription>
                        Full details for request ID: {request.id}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><span className="font-semibold">Organizer:</span> {request.organizerName}</div>
                        <div><span className="font-semibold">Contact:</span> {request.contactNumber}</div>
                        <div><span className="font-semibold">Email:</span> {request.email}</div>
                        <div><span className="font-semibold">Travel Date:</span> {formatFirebaseTimestamp(request.travelDate)}</div>
                        <div><span className="font-semibold">Origin:</span> {request.origin}</div>
                        <div><span className="font-semibold">Destination:</span> {request.destination}</div>
                        <div><span className="font-semibold">Bus Type:</span> {request.busType}</div>
                        <div><span className="font-semibold">Purpose:</span> {request.purpose || 'N/A'}</div>
                        <div><span className="font-semibold">Total Passengers:</span> {request.numPassengers}</div>
                        <div><span className="font-semibold">Concession Passengers:</span> {request.numConcession}</div>
                    </div>

                    {request.passengers && request.passengers.length > 0 && (
                        <div>
                            <h4 className="font-semibold mt-4 mb-2">Passenger List</h4>
                            <div className="border rounded-md max-h-60 overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Age</TableHead>
                                            <TableHead>Gender</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {request.passengers.map((p, i) => (
                                            <TableRow key={i}>
                                                <TableCell>{p.name}</TableCell>
                                                <TableCell>{p.age}</TableCell>
                                                <TableCell>{p.gender}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default function AdminMsrtcRequestsPage() {
  const auth = useAuth();
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  
  const [dataVersion, setDataVersion] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<MsrtcBooking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  const { msrtcBookings, loading: dataLoading } = useAdminData(dataVersion);
  
  const isLoading = authLoading || dataLoading;
  
  const handleDataChange = useCallback(() => {
    setDataVersion(v => v + 1);
  }, []);

  const handleViewDetails = (request: MsrtcBooking) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
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
        <h1 className="text-3xl font-bold font-display text-primary">Manage MSRTC Group Requests</h1>
        <p className="text-muted-foreground">Review and manage all MSRTC group booking requests.</p>
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle>All MSRTC Requests</CardTitle>
              {isLoading ? (
                <Skeleton className="h-5 w-48 mt-1" />
              ) : (
                <CardDescription>
                  A total of {msrtcBookings.length} MSRTC requests found.
                </CardDescription>
              )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : (
                <MsrtcRequestsTable requests={msrtcBookings} onStatusChange={handleDataChange} onViewDetails={handleViewDetails} />
            )}
          </CardContent>
      </Card>
      <RequestDetailsModal request={selectedRequest} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
