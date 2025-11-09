
'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FleetDashboard, type Bus, type BookingRequest } from '@/components/operator/fleet-dashboard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data - in a real app, this would come from a Firestore hook
const mockBuses: Bus[] = [
  { id: 'bus1', registrationNumber: 'MH-04-A-1234', seatingCapacity: 40, busType: 'AC' },
  { id: 'bus2', registrationNumber: 'MH-04-B-5678', seatingCapacity: 50, busType: 'Non-AC' },
  { id: 'bus3', registrationNumber: 'MH-04-C-9012', seatingCapacity: 30, busType: 'AC Sleeper' },
];

const mockBookings: BookingRequest[] = [
   { 
      id: 'req1', 
      fromLocation: { address: 'Mumbai' }, 
      toLocation: { address: 'Pune' },
      journeyDate: '2024-08-05', 
      returnDate: '2024-08-07', 
      status: 'approved',
      operatorQuote: { availableBus: "40 Seater AC (MH-04-A-1234)" }
    },
    { 
      id: 'req2', 
      fromLocation: { address: 'Delhi' },
      toLocation: { address: 'Agra' },
      journeyDate: '2024-08-10', 
      returnDate: '2024-08-11', 
      status: 'pending',
      operatorQuote: { availableBus: "30 Seater AC Sleeper (MH-04-C-9012)" }
    },
     { 
      id: 'req3', 
      fromLocation: { address: 'Goa' },
      toLocation: { address: 'Bangalore' },
      journeyDate: '2024-08-20', 
      returnDate: '2024-08-25', 
      status: 'approved',
      operatorQuote: { availableBus: "50 Seater Non-AC (MH-04-B-5678)" }
    }
];

// In a real app, you would use a hook like this:
// import { useOperatorDashboardData } from '@/hooks/use-operator-dashboard-data';

export default function OperatorDashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 7, 1)); // August 2024
  
  // MOCK HOOK USAGE
  const isLoading = false; // Set to true to see skeleton loaders
  const buses = mockBuses;
  const bookingRequests = mockBookings;
  const operatorName = "Example Travels";


  // REAL HOOK USAGE (to be used once Firestore is connected)
  // const { buses, bookingRequests, operatorName, isLoading } = useOperatorDashboardData();
  
  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };


  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-display text-primary">Operator Dashboard</h1>
        <p className="text-muted-foreground">Welcome, {isLoading ? <Skeleton className="h-5 w-32 inline-block" /> : <strong>{operatorName}</strong>}. Manage your fleet and bookings.</p>
      </header>
      
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Fleet Availability Calendar</CardTitle>
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
            {isLoading ? (
               <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
            ) : (
                <FleetDashboard buses={buses} bookings={bookingRequests} currentDate={currentDate} />
            )}
          </CardContent>
        </Card>

        {/* Other dashboard components like Booking Requests would go here */}

      </div>
    </div>
  );
}
