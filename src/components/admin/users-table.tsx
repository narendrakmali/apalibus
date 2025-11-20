'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { User } from '@/lib/types';
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { useFirestore } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


async function makeUserOperator(firestore: any, user: User) {
    if (!firestore || !user) {
        console.error("Firestore or User not provided");
        return;
    }
    if (confirm(`Are you sure you want to make ${user.name} an operator?`)) {
        try {
            const operatorRef = doc(firestore, "busOperators", user.id);
            await setDoc(operatorRef, {
                id: user.id,
                name: user.name,
                email: user.email,
                contactNumber: user.mobileNumber || '',
                busIds: [],
            });
            alert(`${user.name} has been successfully promoted to an operator.`);
            // Optionally, you might want to refresh the user list or update the UI
        } catch (error) {
            console.error("Error making user an operator:", error);
            alert(`Failed to make user an operator: ${(error as Error).message}`);
        }
    }
}


export function UsersTable({ users }: { users: User[] }) {
    const firestore = useFirestore();
    const [promoting, setPromoting] = useState<string | null>(null);

    const handleMakeOperator = async (user: User) => {
        setPromoting(user.id);
        await makeUserOperator(firestore, user);
        setPromoting(null);
    }

    if (users.length === 0) {
        return <p className="text-muted-foreground text-center py-8">No users found.</p>;
    }

    return (
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
                                        onClick={() => handleMakeOperator(user)}
                                        disabled={promoting === user.id}
                                    >
                                        {promoting === user.id ? "Promoting..." : "Make Operator"}
                                    </DropdownMenuItem>
                                     <DropdownMenuItem className="text-destructive" onClick={() => console.log(`Deleting ${user.id}`)}>
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
