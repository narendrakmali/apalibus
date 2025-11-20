'use client';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { initializeFirebase } from '@/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { useOperatorData } from '@/hooks/use-operator-data';
import Link from 'next/link';
import type { Bus, BookingRequest } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

/**
 * A robust utility function to convert a Firestore Timestamp, a string, or a number into a valid Date object.
 * Returns null if the input is invalid, null, or undefined.
 */
const safeToDate = (dateInput: any): Date | null => {
  if (!dateInput) {
    return null;
  }
  // Handle Firestore Timestamps (which have a toDate method)
  if (typeof dateInput.toDate === 'function') {
    return dateInput.toDate();
  }
  // Handle ISO 8601 strings or millisecond numbers
  if (typeof dateInput === 'string' || typeof dateInput === 'number') {
    const d = new Date(dateInput);
    // Check if the created date is valid
    if (!isNaN(d.getTime())) {
      return d;
    }
  }
  // Return null if the input is not a recognizable or valid date format
  return null;
};


const CalendarHeader = ({ date, setDate }: { date: Date, setDate: (d: Date) => void }) => {
  const prevMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
  const nextMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));

  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold font-display">
        {date.toLocaleString('default', { month: 'long' })} {date.getFullYear()}
      </h3>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const FleetCalendar = ({ buses, bookingRequests }: { buses: Bus[], bookingRequests: BookingRequest[] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const schedule = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const newSchedule: Record<string, Record<number, 'booked' | 'available'>> = {};

    // Initialize schedule for all buses to 'available'
    buses.forEach(bus => {
      newSchedule[bus.id] = {};
      for (let day = 1; day <= daysInMonth; day++) {
        newSchedule[bus.id][day] = 'available';
      }
    });

    // Populate schedule with bookings
    bookingRequests.forEach(booking => {
      // DEFENSIVE CHECK: Ensure the booking has an operator quote and an assigned bus.
      const busIdFromQuote = booking.operatorQuote?.availableBus;
      if (!busIdFromQuote || !newSchedule[busIdFromQuote]) {
        return; // Skip this booking if it's not assigned to a known bus.
      }
      
      // DEFENSIVE CHECK: Safely convert dates, skipping if they are invalid.
      const journeyDate = safeToDate(booking.journeyDate);
      const returnDate = safeToDate(booking.returnDate);
      if (!journeyDate || !returnDate) {
        return; // Skip this booking if dates are invalid.
      }

      // Normalize dates to midnight for accurate day-by-day comparison.
      const start = new Date(journeyDate.setHours(0, 0, 0, 0));
      const end = new Date(returnDate.setHours(0, 0, 0, 0));
      
      // Iterate through the date range of the booking.
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        // Check if the current day in the loop falls within the displayed month.
        if (d.getFullYear() === year && d.getMonth() === month) {
          const dayOfMonth = d.getDate();
          newSchedule[busIdFromQuote][dayOfMonth] = 'booked';
        }
      }
    });

    return newSchedule;
  }, [buses, bookingRequests, currentDate]);

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

  const daysArray = Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }, (_, i) => i + 1);

  return (
    <div>
      <CalendarHeader date={currentDate} setDate={setCurrentDate} />
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50">
            <tr className="divide-x divide-border">
              <th className="sticky left-0 bg-secondary p-2 font-semibold z-10 whitespace-nowrap">Bus</th>
              {daysArray.map((day) => (
                <th key={day} className="p-2 font-normal w-12">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {buses.map(bus => (
              <tr key={bus.id} className="divide-x divide-border">
                <td className="sticky left-0 bg-background p-2 font-medium whitespace-nowrap z-10">
                  <p>{bus.registrationNumber}</p>
                  <p className="text-xs text-muted-foreground">{bus.seatingCapacity} seats</p>
                </td>
                {daysArray.map((day) => {
                  const status = schedule[bus.id]?.[day] || 'available';
                  return (
                    <td key={day} className="text-center p-0">
                       <div className={cn(
                           "h-full w-full min-w-[3rem] p-2",
                           status === 'booked' && 'bg-red-200/50 text-red-800'
                        )}>
                         {/* Cell content can be added here if needed */}
                       </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export default function FleetPage() {
  const { auth } = initializeFirebase();
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  
  // Fetch data only once the user object is available.
  const { buses, requests, loading: dataLoading, error } = useOperatorData(user?.uid);

  const isLoading = authLoading || dataLoading;

  useEffect(() => {
    // Redirect unauthenticated users.
    if (!authLoading && !user) {
      router.push('/operator-login');
    }
  }, [user, authLoading, router]);

  const renderContent = () => {
    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        );
    }
    if (error) {
        return (
            <p className="text-destructive text-center font-semibold p-4 bg-destructive/10 rounded-md">
              Error loading fleet data: {error}
            </p>
        );
    }
    // Only render the calendar if we are not loading and there's no error.
    return <FleetCalendar buses={buses} bookingRequests={requests} />;
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
        <h1 className="text-3xl font-bold font-display text-primary">Manage Fleet Schedule</h1>
        <p className="text-muted-foreground">View the monthly schedule for all buses in your fleet.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Fleet Calendar</CardTitle>
          <CardDescription>A monthly overview of your bus availability and bookings.</CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
