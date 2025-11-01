'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { AddBusDialog } from '@/components/admin/add-bus-dialog';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


type Bus = {
  id: string;
  registrationNumber: string;
  busType: string;
  seatingCapacity: string;
  coachType: string;
};

export default function BusesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const busesQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'buses'), where('operatorId', '==', user.uid));
  }, [firestore, user?.uid]);

  const { data: buses, isLoading: areBusesLoading } = useCollection<Bus>(busesQuery);

  const isLoading = isUserLoading || areBusesLoading;

  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 flex h-14 items-center gap-4 border-b bg-background px-4 sm:h-16 sm:px-6 z-30">
          <SidebarTrigger />
          <h1 className="font-semibold text-lg md:text-xl">My Buses</h1>
          <div className="ml-auto">
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Bus
            </Button>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 sm:gap-8 sm:p-6">
          <Card>
            <CardHeader>
              <CardTitle>Bus Fleet</CardTitle>
              <CardDescription>
                A list of all buses registered under your operator account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
              ) : buses && buses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Registration No.</TableHead>
                      <TableHead>Bus Type</TableHead>
                      <TableHead>Seating Capacity</TableHead>
                      <TableHead>Coach Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {buses.map((bus) => (
                      <TableRow key={bus.id}>
                        <TableCell className="font-medium">{bus.registrationNumber}</TableCell>
                        <TableCell>{bus.busType}</TableCell>
                        <TableCell>{bus.seatingCapacity} Seater</TableCell>
                        <TableCell>{bus.coachType}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You haven't registered any buses yet.</p>
                   <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Your First Bus
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
      <AddBusDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
