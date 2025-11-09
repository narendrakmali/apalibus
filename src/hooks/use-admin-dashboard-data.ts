'use client';

import { useFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useMemoFirebase } from '@/firebase/provider';

// Simplified types for admin dashboard data
interface User {
  id: string;
  name: string;
  email: string;
}

interface BusOperator {
  id: string;
  name: string;
  email: string;
  contactNumber: string;
}

interface BookingRequest {
    id: string;
    fromLocation: { address: string };
    toLocation: { address: string };
    journeyDate: string;
    returnDate: string;
    status: 'pending' | 'approved' | 'rejected' | 'quote_rejected';
    estimate: { totalCost: number; };
}

// Hook to get high-level stats
export const useAdminDashboardData = () => {
  const { firestore } = useFirebase();

  const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const operatorsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'busOperators') : null, [firestore]);
  const bookingsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'bookingRequests') : null, [firestore]);

  const { data: users, isLoading: isLoadingUsers } = useCollection(usersQuery);
  const { data: operators, isLoading: isLoadingOperators } = useCollection(operatorsQuery);
  const { data: bookings, isLoading: isLoadingBookings } = useCollection(bookingsQuery);

  const stats = {
    totalUsers: users?.length ?? 0,
    totalOperators: operators?.length ?? 0,
    totalBookingRequests: bookings?.length ?? 0,
  };

  return {
    stats,
    isLoading: isLoadingUsers || isLoadingOperators || isLoadingBookings,
  };
};

// Hook to get all users
export const useAdminUserData = () => {
    const { firestore } = useFirebase();
    const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
    const { data, isLoading } = useCollection<User>(usersQuery);
    return { users: data ?? [], isLoading };
}

// Hook to get all operators
export const useAdminOperatorData = () => {
    const { firestore } = useFirebase();
    const operatorsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'busOperators') : null, [firestore]);
    const { data, isLoading } = useCollection<BusOperator>(operatorsQuery);
    return { operators: data ?? [], isLoading };
}

// Hook to get all booking requests
export const useAdminBookingData = () => {
    const { firestore } = useFirebase();
    const bookingsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'bookingRequests') : null, [firestore]);
    const { data, isLoading } = useCollection<BookingRequest>(bookingsQuery);
    return { bookings: data ?? [], isLoading };
}
