'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BookingRequest } from '@/hooks/use-admin-data';
import { ArrowRight, FileText } from "lucide-react";
import { Link } from '@/navigation';


function formatFirebaseTimestamp(timestamp: any) {
    if (!timestamp) return 'N/A';
    // Firebase timestamps have toDate() method
    if (typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }
    // For ISO strings
    return new Date(timestamp).toLocaleDateString('en-US');
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
        case 'pending': return 'secondary';
        case 'approved': return 'default';
        case 'rejected':
        case 'quote_rejected':
             return 'destructive';
        default: return 'outline';
    }
}

export function RequestsTable({ requests }: { requests: BookingRequest[] }) {
    if (requests.length === 0) {
        return <p className="text-muted-foreground text-center py-8">No booking requests found.</p>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Trip Details</TableHead>
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
                            <div>{req.contact?.name}</div>
                            <div className="text-xs text-muted-foreground">{req.contact?.mobile}</div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <span>{req.fromLocation.address}</span>
                                <ArrowRight className="h-3 w-3" />
                                <span>{req.toLocation.address}</span>
                            </div>
                             <div className="text-xs text-muted-foreground">
                                {new Date(req.journeyDate).toLocaleDateString()} - {new Date(req.returnDate).toLocaleDateString()}
                            </div>
                        </TableCell>
                        <TableCell>
                            <div>{req.busType}</div>
                            <div className="text-xs text-muted-foreground">{req.seatType || 'Any'}</div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={getStatusVariant(req.status)}>{req.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           <Button asChild size="sm">
                               <Link href={`/admin/requests/${req.id}`}>
                                   Provide Quote
                                </Link>
                           </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

    