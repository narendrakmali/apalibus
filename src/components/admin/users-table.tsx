
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { User } from '@/lib/types';
import { MoreHorizontal, Trash2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { useFirestore } from "@/firebase";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { useState } from "react";
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


export function UsersTable({ users, onUserDeleted }: { users: User[], onUserDeleted: () => void }) {
    const firestore = useFirestore();
    const [promoting, setPromoting] = useState<string | null>(null);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [isPromoteAlertOpen, setIsPromoteAlertOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

    const openPromoteDialog = (user: User) => {
        setSelectedUser(user);
        setIsPromoteAlertOpen(true);
    };

    const handleMakeOperator = async () => {
        if (!selectedUser) return;
        
        setPromoting(selectedUser.id);
        setIsPromoteAlertOpen(false);

        try {
            const operatorRef = doc(firestore, "busOperators", selectedUser.id);
            await setDoc(operatorRef, {
                id: selectedUser.id,
                name: selectedUser.name,
                email: selectedUser.email,
                contactNumber: selectedUser.mobileNumber || '',
                busIds: [],
            });
            setFeedbackMessage(`${selectedUser.name} has been successfully promoted to an operator.`);
        } catch (error) {
            console.error("Error making user an operator:", error);
            setFeedbackMessage(`Failed to make user an operator: ${(error as Error).message}`);
        } finally {
            setPromoting(null);
            setSelectedUser(null);
        }
    }
    
    const openDeleteDialog = (user: User) => {
        setSelectedUser(user);
        setIsDeleteAlertOpen(true);
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        try {
            await deleteDoc(doc(firestore, "users", selectedUser.id));
            setFeedbackMessage(`User ${selectedUser.name} deleted successfully.`);
            onUserDeleted(); // Callback to refresh the data on the parent page
        } catch (error) {
            console.error("Error deleting user:", error);
            setFeedbackMessage(`Failed to delete user: ${(error as Error).message}`);
        } finally {
            setIsDeleteAlertOpen(false);
            setSelectedUser(null);
        }
    };


    if (users.length === 0) {
        return <p className="text-muted-foreground text-center py-8">No users found.</p>;
    }

    return (
        <>
            {feedbackMessage && (
                <div className="mb-4 rounded-md border p-4 text-sm">
                    <p>{feedbackMessage}</p>
                    <Button variant="ghost" size="sm" onClick={() => setFeedbackMessage(null)} className="mt-2">Dismiss</Button>
                </div>
            )}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Mobile Number</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.mobileNumber}</TableCell>
                            <TableCell>
                                {user.isAdmin ? (
                                    <Badge>Admin</Badge>
                                ) : (
                                    <Badge variant="secondary">User</Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                               <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem 
                                            onClick={() => openPromoteDialog(user)}
                                            disabled={promoting === user.id}
                                        >
                                            {promoting === user.id ? "Promoting..." : "Make Operator"}
                                        </DropdownMenuItem>
                                         <DropdownMenuItem className="text-destructive" onClick={() => openDeleteDialog(user)}>
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

            {/* Promote Confirmation Dialog */}
            <AlertDialog open={isPromoteAlertOpen} onOpenChange={setIsPromoteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Promote to Operator?</AlertDialogTitle>
                        <AlertDialogDescription>
                           This action will grant operator privileges to <span className="font-semibold">{selectedUser?.name}</span>. They will be able to manage buses and bookings. Are you sure?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedUser(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleMakeOperator}>
                            Confirm & Promote
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user account for <span className="font-semibold">{selectedUser?.name}</span> and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedUser(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
