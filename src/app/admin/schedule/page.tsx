
'use client';

import { useState, useMemo, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { isSameDay, isTomorrow, format } from 'date-fns';
import { EventContentArg } from '@fullcalendar/core';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, CalendarClock } from 'lucide-react';

type Booking = {
  id: string;
  userName: string;
  journeyDate: { toDate: () => Date };
  startLocation: string;
  destination: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  busDetails: {
    registrationNumber: string;
  };
};

// Color mapping for booking statuses
const statusColors = {
  confirmed: '#22c55e', // green-500
  pending: '#f97316',   // orange-500
  cancelled: '#ef4444', // red-500
};

function renderEventContent(eventInfo: EventContentArg) {
  const { status, busDetails, customerName, route } = eventInfo.event.extendedProps;
  return (
    <div className="p-1 overflow-hidden">
      <b className="whitespace-nowrap">{eventInfo.timeText}</b>
      <p className="text-xs whitespace-nowrap">Bus: {busDetails.registrationNumber}</p>
      <p className="text-xs whitespace-nowrap">{route}</p>
      <p className="text-xs font-medium whitespace-nowrap">({customerName})</p>
    </div>
  );
}

export default function SchedulePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    // This is the corrected query with the required operatorId filter
    return query(collection(firestore, 'bookings'), where('operatorId', '==', user.uid));
  }, [firestore, user?.uid]);

  const { data: bookings, isLoading: areBookingsLoading } = useCollection<Booking>(bookingsQuery);

  const isLoading = isUserLoading || areBookingsLoading;

  const calendarEvents = useMemo(() => {
    if (!bookings) return [];
    return bookings.map(booking => ({
      id: booking.id,
      title: `${booking.busDetails.registrationNumber}: ${booking.startLocation} to ${booking.destination}`,
      start: booking.journeyDate.toDate(),
      allDay: true, // Assuming bookings are for the whole day for simplicity
      backgroundColor: statusColors[booking.status] || '#6b7280',
      borderColor: statusColors[booking.status] || '#6b7280',
      extendedProps: {
        status: booking.status,
        busDetails: booking.busDetails,
        customerName: booking.userName,
        route: `${booking.startLocation} to ${booking.destination}`
      }
    }));
  }, [bookings]);
  
  const tomorrowsBookings = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter(booking => isTomorrow(booking.journeyDate.toDate()));
  }, [bookings]);


  return (
    <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 flex h-14 items-center gap-4 border-b bg-background px-4 sm:h-16 sm:px-6 z-30">
          <SidebarTrigger />
          <h1 className="font-semibold text-lg md:text-xl">My Schedule</h1>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 sm:gap-8 sm:p-6">

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <CalendarClock className="mr-2 text-primary" />
                    Tomorrow&apos;s Bookings
                </CardTitle>
                <CardDescription>
                    A list of all confirmed and pending bookings for the next day.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                     <Skeleton className="h-20 w-full" />
                ) : tomorrowsBookings.length > 0 ? (
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Bus No.</TableHead>
                                <TableHead>Route</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tomorrowsBookings.map((booking) => (
                                <TableRow key={booking.id}>
                                    <TableCell className="font-medium">{booking.busDetails.registrationNumber}</TableCell>
                                    <TableCell>{booking.startLocation} → {booking.destination}</TableCell>
                                    <TableCell>{booking.userName}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge style={{ backgroundColor: statusColors[booking.status]}} className="text-white">{booking.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">You have no bookings for tomorrow.</p>
                    </div>
                )}
            </CardContent>
        </Card>


         <Card>
            <CardHeader>
              <CardTitle>Booking Calendar</CardTitle>
              <CardDescription>
                View all your bookings by day, week, or month.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[600px] w-full" />
              ) : (
                <div className="[&_.fc-button-primary]:bg-primary [&_.fc-button-primary]:text-primary-foreground [&_.fc-button-primary:hover]:bg-primary/90 [&_.fc-daygrid-event]:p-1 [&_.fc-event-main]:text-white">
                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: 'dayGridMonth,timeGridWeek,timeGridDay',
                    }}
                    initialView="dayGridMonth"
                    weekends={true}
                    events={calendarEvents}
                    eventContent={renderEventContent}
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    height="600px"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </main>
    </div>
  );
}

// Add package.json dependencies for FullCalendar
// "@fullcalendar/react": "^6.1.10",
// "@fullcalendar/daygrid": "^6.1.10",
// "@fullcalendar/timegrid": "^6.1.10",
// "@fullcalendar/interaction": "^6.1.10",

    