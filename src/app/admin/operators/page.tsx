'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAdminOperatorData } from '@/hooks/use-admin-dashboard-data';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminOperatorsPage() {
  const { operators, isLoading } = useAdminOperatorData();
  const router = useRouter();

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Operator Management</h1>
            <p className="text-muted-foreground mt-1">
            View all registered bus operators on the platform.
            </p>
        </div>
        <Button onClick={() => router.push('/admin/operators/add')}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Operator
        </Button>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>All Operators</CardTitle>
          <CardDescription>
            A list of all registered operators.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operator Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Contact Number</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operators.map((operator) => (
                  <TableRow key={operator.id}>
                    <TableCell className="font-medium">{operator.name}</TableCell>
                    <TableCell>{operator.email}</TableCell>
                    <TableCell>{operator.contactNumber}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
           {!isLoading && operators.length === 0 && (
            <div className="text-center text-muted-foreground py-20">
                <p>No operators have registered yet.</p>
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
