
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useFirestore } from "@/firebase";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export function OperatorsTable({ operators, onOperatorDeleted }: { operators: BusOperator[], onOperatorDeleted: () => void }) {
    const firestore = useFirestore();
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedOperator, setSelectedOperator] = useState<BusOperator | null>(null);
    const [editedOperator, setEditedOperator] = useState<Partial<BusOperator>>({});

    const openDeleteDialog = (op: BusOperator) => {
        setSelectedOperator(op);
        setIsDeleteAlertOpen(true);
    };
    
    const openEditDialog = (op: BusOperator) => {
        setSelectedOperator(op);
        setEditedOperator(op);
        setIsEditDialogOpen(true);
    };

    const handleInputChange = (field: keyof BusOperator, value: string) => {
        setEditedOperator(prev => ({...prev, [field]: value}));
    }

    const handleDeleteOperator = async () => {
        if (!selectedOperator) return;
        const operatorRef = doc(firestore, "busOperators", selectedOperator.id);
        deleteDoc(operatorRef)
            .then(() => {
                console.log(`Operator ${selectedOperator.id} deleted successfully.`);
                onOperatorDeleted();
            })
            .catch((serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: operatorRef.path,
                    operation: 'delete',
                });
                errorEmitter.emit('permission-error', permissionError);
            })
            .finally(() => {
                setIsDeleteAlertOpen(false);
                setSelectedOperator(null);
            });
    };
    
     const handleUpdateOperator = async () => {
        if (!selectedOperator || !editedOperator) return;
        const operatorRef = doc(firestore, "busOperators", selectedOperator.id);
        const updateData = { ...editedOperator };
        updateDoc(operatorRef, updateData)
            .then(() => {
                console.log(`Operator ${selectedOperator.id} updated successfully.`);
                onOperatorDeleted(); // Re-fetch data
            })
            .catch((serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: operatorRef.path,
                    operation: 'update',
                    requestResourceData: updateData,
                });
                errorEmitter.emit('permission-error', permissionError);
            })
            .finally(() => {
                setIsEditDialogOpen(false);
                setSelectedOperator(null);
                setEditedOperator({});
            });
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
                                        <DropdownMenuItem onClick={() => openEditDialog(op)}>
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

            {/* Edit Dialog */}
             <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Operator</DialogTitle>
                        <DialogDescription>
                            Make changes to the operator's profile here. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" value={editedOperator.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input id="email" type="email" value={editedOperator.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="contact" className="text-right">Contact</Label>
                            <Input id="contact" value={editedOperator.contactNumber || ''} onChange={(e) => handleInputChange('contactNumber', e.target.value)} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                         <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="button" onClick={handleUpdateOperator}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
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
