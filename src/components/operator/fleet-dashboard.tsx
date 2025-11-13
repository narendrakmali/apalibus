
'use client';

import { useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Bus, BookingRequest } from '@/lib/types';

interface FleetDashboardProps {
  buses: Bus[];
  bookings: BookingRequest[];
  currentDate: Date;
}

const formatDate = (dateInput: any) => {
    if (!dateInput) return 'N/A';
    const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};


// Helper to check if a date falls within a booking's range
const isDateInBooking = (date: Date, booking: BookingRequest) => {
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  const journeyDate = booking.journeyDate.toDate ? booking.journeyDate.toDate() : new Date(booking.journeyDate);
  journeyDate.setHours(0, 0, 0, 0);

  const returnDate = booking.returnDate.toDate ? booking.returnDate.toDate() : new Date(booking.returnDate);
  returnDate.setHours(0, 0, 0, 0);
  
  return checkDate >= journeyDate && checkDate <= returnDate;
};


// Helper to extract bus registration number from operatorQuote
const getBusRegFromQuote = (quote: string | undefined): string | null => {
    if (!quote) return null;
    const match = quote.match(/\(([^)]+)\)/);
    return match ? match[1] : null;
};


export function FleetDashboard({ buses, bookings, currentDate }: FleetDashboardProps) {
  const { daysInMonth, month, year } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { daysInMonth, month, year };
  }, [currentDate]);

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Memoize the expensive computation of the schedule
  const schedule = useMemo(() => {
    const busSchedule: Record<string, Record<number, BookingRequest | 'available' | null>> = {};

    buses.forEach(bus => {
      busSchedule[bus.id] = {};
      daysArray.forEach(day => {
        const date = new Date(year, month, day);
        
        const relevantBooking = bookings.find(booking => {
            const quoteReg = getBusRegFromQuote(booking.operatorQuote?.availableBus);
            if (quoteReg && quoteReg !== bus.registrationNumber) {
                return false;
            }
             // For pending requests, they might not have a bus assigned yet, so we show them on all buses
            if (booking.status === 'pending' && !quoteReg) {
                 return isDateInBooking(date, booking);
            }
            // For approved, it must match the bus
            if (booking.status === 'approved' && quoteReg === bus.registrationNumber) {
                 return isDateInBooking(date, booking);
            }
            return false;
        });

        busSchedule[bus.id][day] = relevantBooking || 'available';
      });
    });

    return busSchedule;
  }, [buses, bookings, daysArray, month, year]);

  if (buses.length === 0) {
    return (
        <div className="text-center py-10 px-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold">No Buses Found</h3>
            <p className="text-muted-foreground mt-2">
                You haven't added any buses to your fleet yet. Please contact support to add your buses.
            </p>
        </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-x-auto">
      <table className="w-full min-w-[1200px]">
        <thead className="bg-secondary/50">
          <tr>
            <th className="sticky left-0 bg-secondary/50 p-3 text-left font-semibold text-sm w-48 z-10">Bus</th>
            {daysArray.map(day => (
              <th key={day} className="p-2 text-center font-medium text-xs border-l w-12">
                <div>{new Date(year, month, day).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}</div>
                <div>{day}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {buses.map(bus => (
            <tr key={bus.id}>
              <td className="sticky left-0 bg-background p-3 text-left w-48 z-10">
                <div className="font-semibold">{bus.registrationNumber}</div>
                <div className="text-xs text-muted-foreground">{bus.seatingCapacity} Seater {bus.busType}</div>
              </td>
              {daysArray.map(day => {
                const status = schedule[bus.id]?.[day];
                if (!status) return <td key={day} className="border-l"></td>;

                let cellContent;
                if (status === 'available') {
                  cellContent = <div className="h-12 w-full bg-green-100" />;
                } else if (status) { // It's a booking object
                  const bgColor = status.status === 'approved' ? 'bg-red-400' : 'bg-yellow-300';
                  
                  cellContent = (
                     <Popover>
                        <PopoverTrigger asChild>
                            <div className={`h-12 w-full ${bgColor} cursor-pointer hover:opacity-80`}></div>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="space-y-2">
                                <h4 className="font-semibold">{status.fromLocation.address} to {status.toLocation.address}</h4>
                                <p className="text-sm text-muted-foreground">
                                    Travel: {formatDate(status.journeyDate)} - {formatDate(status.returnDate)}
                                </p>
                                <div className={`text-sm font-bold capitalize ${status.status === 'approved' ? 'text-green-600' : 'text-yellow-600'}`}>
                                    Status: {status.status}
                                </div>
                                 <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
                                    <p>Requested by: {status.contact?.name}</p>
                                    <p>Request Date: {formatDate(status.createdAt)}</p>
                                    <p>Request ID: {status.id}</p>
                                 </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                  );

                } else {
                     cellContent = <div className="h-12 w-full bg-gray-50" />;
                }

                return (
                  <td key={day} className="p-0.5 border-l text-center text-xs relative">
                    {cellContent}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
