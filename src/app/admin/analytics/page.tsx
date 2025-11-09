
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAdminBookingData } from '@/hooks/use-admin-dashboard-data';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminAnalyticsPage() {
  const { bookings, isLoading } = useAdminBookingData();

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Booking Requests</h1>
        <p className="text-muted-foreground mt-1">
          An overview of all booking requests made on the platform.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>All Booking Requests</CardTitle>
          <CardDescription>
            Charts and booking trends will be shown here in the future.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trip</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Estimate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.fromLocation.address} to {booking.toLocation.address}</TableCell>
                    <TableCell>{new Date(booking.journeyDate).toLocaleDateString()} - {new Date(booking.returnDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                        <span className={`capitalize font-medium ${
                            booking.status === 'pending' ? 'text-yellow-500' 
                            : booking.status === 'approved' ? 'text-green-500' 
                            : booking.status === 'quote_rejected' ? 'text-orange-500'
                            : 'text-red-500'}`}>{booking.status.replace('_', ' ')}
                        </span>
                    </TableCell>
                    <TableCell className="text-right">{booking.estimate.totalCost.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
           {!isLoading && bookings.length === 0 && (
             <div className="text-center text-muted-foreground py-20">
                <p>No booking requests have been made yet.</p>
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
