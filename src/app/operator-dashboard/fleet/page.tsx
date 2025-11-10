'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FleetDashboard } from '@/components/operator/fleet-dashboard';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { initializeFirebase } from '@/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { useOperatorData } from '@/hooks/use-operator-data';
import Link from 'next/link';

export default function FleetPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { auth } = initializeFirebase();
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  
  const { buses, requests, loading: dataLoading, error } = useOperatorData(user?.uid);
  const isLoading = authLoading || dataLoading;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/operator-login');
      return;
    }
  }, [user, authLoading, router]);
  
  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  if (isLoading) {
    return (
        <div className="container mx-auto py-8 px-4 md:px-6">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-6 w-80 mb-10" />
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        </div>
    )
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
        <p className="text-muted-foreground">View your bus availability and manage schedules.</p>
      </div>
      
        <Card>
          <CardHeader>
            <CardTitle>Fleet Availability Calendar</CardTitle>
             <CardDescription>Visualize your fleet's schedule for the selected month.</CardDescription>
            <div className="flex items-center gap-4 pt-2">
               <div className="flex items-center gap-2">
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
              <Button variant="outline" onClick={handleToday}>Today</Button>
               <div className="flex items-center gap-4 text-sm ml-auto">
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-100 border"></div><span>Available</span></div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-300 border"></div><span>Pending</span></div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-400 border"></div><span>Booked</span></div>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && <p className="text-destructive text-center">{error}</p>}
            <FleetDashboard buses={buses} bookings={requests} currentDate={currentDate} />
          </CardContent>
        </Card>
    </div>
  );
}
