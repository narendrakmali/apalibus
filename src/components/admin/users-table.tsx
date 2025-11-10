'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { User } from '@/lib/types';
import { MoreHorizontal } from "lucide-react";
import { Badge } from "../ui/badge";

export function UsersTable({ users }: { users: User[] }) {
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
