
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { initializeFirebase } from '@/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { useOperatorData } from '@/hooks/use-operator-data';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Bus } from '@/lib/types';

function BusList({ buses }: { buses: Bus[] }) {
  if (buses.length === 0) {
    return (
      <div className="text-center py-10 px-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold">No Buses Found</h3>
        <p className="text-muted-foreground mt-2">
          You haven't added any buses to your fleet yet.
        </p>
        <Button asChild className="mt-4">
          <Link href="/operator-dashboard/add-bus">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Your First Bus
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Registration Number</TableHead>
          <TableHead>Bus Type</TableHead>
          <TableHead>Seating Capacity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {buses.map((bus) => (
          <TableRow key={bus.id}>
            <TableCell className="font-medium">{bus.registrationNumber}</TableCell>
            <TableCell>{bus.busType}</TableCell>
            <TableCell>{bus.seatingCapacity}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}


export default function FleetPage() {
  const { auth } = initializeFirebase();
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  
  const { buses, loading: dataLoading, error } = useOperatorData(user?.uid);

  const isLoading = authLoading || dataLoading;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/operator-login');
    }
  }, [user, authLoading, router]);

  const renderContent = () => {
    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }
    if (error) {
        return (
            <p className="text-destructive text-center font-semibold p-4 bg-destructive/10 rounded-md">
              Error loading data: {error}
            </p>
        );
    }
    return <BusList buses={buses} />;
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
       <div className="mb-8">
        <Button asChild variant="outline" size="sm" className="mb-4">
            <Link href="/operator-dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Link>
        </Button>
        <h1 className="text-3xl font-bold font-display text-primary">Manage Fleet</h1>
        <p className="text-muted-foreground">View and manage the buses in your fleet.</p>
      </div>
      
        <Card>
          <CardHeader>
            <CardTitle>Your Fleet</CardTitle>
            <CardDescription>A list of all buses you have registered.</CardDescription>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>
    </div>
  );
}
