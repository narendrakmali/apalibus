
'use client';

import { useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Edit, PlusCircle } from 'lucide-react';
import { FleetDashboard } from '@/components/operator/fleet-dashboard';
import { useOperatorFleet } from '@/hooks/use-operator-fleet';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Bus } from '@/components/operator/fleet-dashboard';

export default function FleetPage() {
  const { user, isUserLoading } = useFirebase();
  const router = useRouter();
  
  const { buses, bookings, isLoading: isFleetLoading, error } = useOperatorFleet();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/operator-login');
    }
  }, [isUserLoading, user, router]);

  
  if (isUserLoading || isFleetLoading) {
    return (
        <div className="container mx-auto py-12 px-4 md:px-6">
            <div className="flex justify-between items-center mb-8">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        </div>
    );
  }
  
  if (!user) {
    return null; // or a login prompt
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Fleet Management</h1>
                <p className="text-muted-foreground mt-1">
                    View and manage all buses in your fleet.
                </p>
            </div>
            <Button onClick={() => router.push('/operator/add-bus')}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Bus
            </Button>
        </header>

        {error && <p className="text-destructive text-center mb-4">{error}</p>}
        
        {!buses || buses.length === 0 ? (
            <div className="text-center text-muted-foreground py-20 border rounded-lg">
                <p>No buses found in your fleet.</p>
                <Button variant="link" onClick={() => router.push('/operator/add-bus')}>Add a bus to get started</Button>
            </div>
        ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {buses.map((bus: Bus) => (
                    <Card key={bus.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>{bus.registrationNumber}</CardTitle>
                                    <CardDescription>{bus.seatingCapacity} Seater {bus.busType}</CardDescription>
                                </div>
                                <span className="text-xs font-semibold uppercase bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <div className="flex justify-between items-center mt-4">
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Rate: </span>
                                    <span className="font-semibold">Placeholder/km</span>
                                </div>
                                <Button variant="outline" size="sm">
                                    <Edit className="mr-2 h-3 w-3" />
                                    Edit
                                </Button>
                             </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}

         <div className="mt-12">
            <h2 className="text-2xl font-bold tracking-tight mb-4">Schedule Overview</h2>
            <FleetDashboard
                buses={buses || []}
                bookings={bookings || []}
                currentDate={new Date()}
            />
        </div>
    </div>
  );
}
