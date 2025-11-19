
'use client';

import { useMemo, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Bus, BookingRequest } from '@/lib/types';
import { Button } from '../ui/button';
import { FilePen } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import Link from 'next/link';

interface FleetDashboardProps {
    buses: Bus[];
    bookings: BookingRequest[];
    currentDate: Date;
}

/**
 * Extracts the bus registration number from a quote string.
 * The expected format is "Vehicle Type (REG-NUMBER)".
 * @param quote - The quote string.
 * @returns The registration number or null if not found.
 */
const getBusRegFromQuote = (quote: string | undefined): string | null => {
    if (!quote) return null;
    const match = quote.match(/\(([^)]+)\)/);
    return match ? match[1] : null;
};

const formatDate = (dateInput: any) => {
    if (!dateInput) return 'N/A';
    const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const isDateInBooking = (date: Date, booking: BookingRequest) => {
  const checkDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

  const journeyDateVal = (booking.journeyDate && (booking.journeyDate as any).toDate)
    ? (booking.journeyDate as any).toDate()
    : (booking.journeyDate ? new Date(booking.journeyDate as string) : null);

  const returnDateVal = (booking.returnDate && (booking.returnDate as any).toDate)
    ? (booking.returnDate as any).toDate()
    : (booking.returnDate ? new Date(booking.returnDate as string) : null);

  if (!journeyDateVal || !returnDateVal || isNaN(journeyDateVal.getTime()) || isNaN(returnDateVal.getTime())) {
      return false;
  }

  const journeyDateStart = new Date(Date.UTC(journeyDateVal.getUTCFullYear(), journeyDateVal.getUTCMonth(), journeyDateVal.getUTCDate()));
  const returnDateEnd = new Date(Date.UTC(returnDateVal.getUTCFullYear(), returnDateVal.getUTCMonth(), returnDateVal.getUTCDate()));

  return checkDate >= journeyDateStart && checkDate <= returnDateEnd;
};


const FareEditor = ({ bus }: { bus: Bus }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
         <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <FilePen className="h-4 w-4 mr-2" />
                    Edit Fare
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Edit Fare for {bus.registrationNumber}</AlertDialogTitle>
                    <AlertDialogDescription>
                        Adjust the pricing for this specific vehicle.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="base-fare" className="text-right">
                            Base Fare
                        </Label>
                        <Input id="base-fare" defaultValue="5000" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="discount" className="text-right">
                            Discount (%)
                        </Label>
                        <Input id="discount" defaultValue="10" type="number" className="col-span-3" />
                    </div>
                    <div className="border-t pt-4 mt-4">
                         <div className="flex justify-between font-semibold">
                            <span>Final Fare Preview:</span>
                            <span>4,500</span>
                        </div>
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => setIsOpen(false)}>Save Changes</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export function FleetDashboard({ buses, bookings, currentDate }: FleetDashboardProps) {
  const { daysInMonth, month, year } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { daysInMonth, month, year };
  }, [currentDate]);

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const schedule = useMemo(() => {
    const busSchedule: Record<string, Record<number, BookingRequest | 'available' | null>> = {};

    buses.forEach(bus => {
      busSchedule[bus.id] = {};
      daysArray.forEach(day => {
        const date = new Date(year, month, day);
        
        const relevantBooking = bookings.find(booking => {
            if (booking.status === 'approved') {
                if (!booking.operatorQuote) return false;
                const quoteReg = getBusRegFromQuote(booking.operatorQuote.availableBus);
                return quoteReg === bus.registrationNumber && isDateInBooking(date, booking);
            }
            
            if (booking.status === 'pending') {
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
                You haven't added any buses to your fleet yet. Please add a bus to get started.
            </p>
             <Button asChild className="mt-4">
                <Link href="/operator-dashboard/add-bus">Add New Bus</Link>
            </Button>
        </div>
    );
  }
  
  return (
    <div className="border rounded-lg overflow-x-auto">
      <table className="w-full min-w-[1400px]">
        <thead className="bg-secondary/50">
          <tr>
            <th className="sticky left-0 bg-secondary/50 p-3 text-left font-semibold text-sm w-48 z-10">Bus</th>
            <th className="p-3 text-left font-semibold text-sm w-48">Fare</th>
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
              <td className="p-3 text-left w-48">
                <FareEditor bus={bus} />
              </td>
              {daysArray.map(day => {
                const status = schedule[bus.id]?.[day];
                if (status === undefined || status === null) return <td key={day} className="border-l"><div className="h-12 w-full bg-destructive/20" /></td>;

                let cellContent;
                if (status === 'available') {
                  cellContent = <div className="h-12 w-full bg-green-100" />;
                } else { 
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
