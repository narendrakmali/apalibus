
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { BusOperator } from '@/lib/types';
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useFirestore } from "@/firebase";
import { doc, deleteDoc } from "firebase/firestore";

export function OperatorsTable({ operators, onOperatorDeleted }: { operators: BusOperator[], onOperatorDeleted: () => void }) {
    const firestore = useFirestore();
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [selectedOperator, setSelectedOperator] = useState<BusOperator | null>(null);

    const openDeleteDialog = (op: BusOperator) => {
        setSelectedOperator(op);
        setIsAlertOpen(true);
    };

    const handleDeleteOperator = async () => {
        if (!selectedOperator) return;
        try {
            await deleteDoc(doc(firestore, "busOperators", selectedOperator.id));
            console.log(`Operator ${selectedOperator.id} deleted successfully.`);
            onOperatorDeleted();
        } catch (error) {
            console.error("Error deleting operator:", error);
            alert(`Failed to delete operator: ${(error as Error).message}`);
        } finally {
            setIsAlertOpen(false);
            setSelectedOperator(null);
        }
    };

    if (operators.length === 0) {
        return <p className="text-muted-foreground text-center py-8">No bus operators found.</p>;
    }

    return (
        <>
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
                               <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => console.log(`Editing ${op.id}`)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive" onClick={() => openDeleteDialog(op)}>
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
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the operator account for <span className="font-semibold">{selectedOperator?.name}</span> and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteOperator} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
