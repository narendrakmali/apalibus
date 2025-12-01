
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MsrtcBooking } from '@/lib/types';
import { MoreHorizontal, Check, X, Hourglass, Trash2, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useFirestore } from "@/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

function formatFirebaseTimestamp(timestamp: any) {
    if (!timestamp) return 'N/A';
    if (typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    return new Date(timestamp).toLocaleDateString('en-US');
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
        case 'pending': return 'secondary';
        case 'confirmed': return 'default';
        case 'rejected': return 'destructive';
        default: return 'outline';
    }
}

export function MsrtcRequestsTable({ requests, onStatusChange, onViewDetails }: { requests: MsrtcBooking[], onStatusChange: () => void, onViewDetails?: (request: MsrtcBooking) => void }) {
    const firestore = useFirestore();
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const handleUpdateStatus = async (id: string, status: 'confirmed' | 'rejected') => {
        setUpdatingId(id);
        const requestRef = doc(firestore, 'msrtcBookings', id);
        const updateData = { status };

        updateDoc(requestRef, updateData)
            .then(() => {
                onStatusChange();
            })
            .catch((serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: requestRef.path,
                    operation: 'update',
                    requestResourceData: updateData,
                });
                errorEmitter.emit('permission-error', permissionError);
            })
            .finally(() => {
                setUpdatingId(null);
            });
    };

    const handleDelete = async (id: string) => {
        setUpdatingId(id);
        const requestRef = doc(firestore, 'msrtcBookings', id);
        deleteDoc(requestRef)
             .then(() => {
                onStatusChange();
            })
            .catch((serverError) => {
                 const permissionError = new FirestorePermissionError({
                    path: requestRef.path,
                    operation: 'delete',
                 });
                 errorEmitter.emit('permission-error', permissionError);
            })
            .finally(() => {
                setUpdatingId(null);
            });
    }

    if (requests.length === 0) {
        return <p className="text-muted-foreground text-center py-8">No MSRTC booking requests found.</p>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Organizer</TableHead>
                    <TableHead>Trip Details</TableHead>
                    <TableHead>Passengers</TableHead>
                    <TableHead>Bus Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {requests.map((req) => (
                    <TableRow key={req.id}>
                        <TableCell className="font-medium">{formatFirebaseTimestamp(req.createdAt)}</TableCell>
                        <TableCell>
                            <div>{req.organizerName}</div>
                            <div className="text-xs text-muted-foreground">{req.contactNumber}</div>
                        </TableCell>
                        <TableCell>
                            <div>{req.origin} to {req.destination}</div>
                            <div className="text-xs text-muted-foreground">{formatFirebaseTimestamp(req.travelDate)}</div>
                        </TableCell>
                         <TableCell>
                            <div>{req.numPassengers} Total</div>
                            <div className="text-xs text-muted-foreground">{req.numConcession} with concession</div>
                        </TableCell>
                        <TableCell>{req.busType}</TableCell>
                        <TableCell>
                            <Badge variant={getStatusVariant(req.status)}>{req.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" disabled={updatingId === req.id}>
                                        {updatingId === req.id ? <Hourglass className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    {onViewDetails && (
                                        <DropdownMenuItem onClick={() => onViewDetails(req)}>
                                            <FileText className="mr-2 h-4 w-4" />
                                            View Details
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(req.id, 'confirmed')}>
                                        <Check className="mr-2 h-4 w-4" />
                                        Confirm
                                    </DropdownMenuItem>
                                     <DropdownMenuItem onClick={() => handleUpdateStatus(req.id, 'rejected')}>
                                        <X className="mr-2 h-4 w-4" />
                                        Reject
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(req.id)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
