'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { BusOperator } from '@/lib/types';
import { MoreHorizontal } from "lucide-react";

export function OperatorsTable({ operators }: { operators: BusOperator[] }) {
    if (operators.length === 0) {
        return <p className="text-muted-foreground text-center py-8">No bus operators found.</p>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Operator Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Contact Number</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {operators.map((op) => (
                    <TableRow key={op.id}>
                        <TableCell className="font-medium">{op.name}</TableCell>
                        <TableCell>{op.email}</TableCell>
                        <TableCell>{op.contactNumber}</TableCell>
                        <TableCell className="text-right">
                           <Button variant="ghost" size="icon">
                               <MoreHorizontal className="h-4 w-4" />
                           </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
