
'use client';

import { useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FleetDashboard } from '@/components/operator/fleet-dashboard';
import { useOperatorFleet } from '@/hooks/use-operator-fleet';
import { Skeleton } from '@/components/ui/skeleton';

export default function FleetPage() {
  const { user, isUserLoading } = useFirebase();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());

  const { buses, bookings, isLoading: isFleetLoading, error } = useOperatorFleet();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/operator-login');
    }
  }, [isUserLoading, user, router]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  if (isUserLoading || isFleetLoading) {
    return (
        <div className="container mx-auto py-12 px-4 md:px-6">
            <div className="flex justify-between items-center mb-8">
                <Skeleton className="h-10 w-48" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-10" />
                </div>
            </div>
            <Skeleton className="h-[600px] w-full" />
        </div>
    );
  }
  
  if (!user) {
    return null; // or a login prompt
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Fleet Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                Monthly overview of your bus fleet's schedule.
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleToday}>Today</Button>
                <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-lg font-semibold w-36 text-center">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </header>

        {error && <p className="text-destructive text-center">{error}</p>}
        
        {!buses || buses.length === 0 ? (
            <div className="text-center text-muted-foreground py-20 border rounded-lg">
                <p>No buses found in your fleet.</p>
                <Button variant="link" onClick={() => router.push('/operator/add-bus')}>Add a bus to get started</Button>
            </div>
        ) : (
             <FleetDashboard
                buses={buses}
                bookings={bookings || []}
                currentDate={currentDate}
            />
        )}
    </div>
  );
}
