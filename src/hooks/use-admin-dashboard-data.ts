
'use client';

import { useFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useMemoFirebase } from '@/firebase/provider';
import { useUserRole } from './use-user-role';

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
  const { role, isLoading: isRoleLoading } = useUserRole();

  // IMPORTANT: Only allow querying if the role check is complete and the role is 'admin'.
  const canQuery = !isRoleLoading && role === 'admin';

  const usersQuery = useMemoFirebase(() => canQuery ? collection(firestore, 'users') : null, [firestore, canQuery]);
  const operatorsQuery = useMemoFirebase(() => canQuery ? collection(firestore, 'busOperators') : null, [firestore, canQuery]);
  const bookingsQuery = useMemoFirebase(() => canQuery ? collection(firestore, 'bookingRequests') : null, [firestore, canQuery]);

  const { data: users, isLoading: isLoadingUsers } = useCollection(usersQuery);
  const { data: operators, isLoading: isLoadingOperators } = useCollection(operatorsQuery);
  const { data: bookings, isLoading: isLoadingBookings } = useCollection(bookingsQuery);

  const stats = {
    totalUsers: users?.length ?? 0,
    totalOperators: operators?.length ?? 0,
    totalBookingRequests: bookings?.length ?? 0,
  };

  // The overall loading state is true if the role is still being determined OR if any of the queries are running.
  return {
    stats,
    isLoading: isRoleLoading || isLoadingUsers || isLoadingOperators || isLoadingBookings,
  };
};

// Hook to get all users
export const useAdminUserData = () => {
    const { firestore } = useFirebase();
    const { role, isLoading: isRoleLoading } = useUserRole();
    // IMPORTANT: Only allow querying if the role check is complete and the role is 'admin'.
    const canQuery = !isRoleLoading && role === 'admin';

    const usersQuery = useMemoFirebase(() => canQuery ? collection(firestore, 'users') : null, [firestore, canQuery]);
    const { data, isLoading: isLoadingCollection } = useCollection<User>(usersQuery);
    
    return { users: data ?? [], isLoading: isRoleLoading || isLoadingCollection };
}

// Hook to get all operators
export const useAdminOperatorData = () => {
    const { firestore } = useFirebase();
    const { role, isLoading: isRoleLoading } = useUserRole();
    // IMPORTANT: Only allow querying if the role check is complete and the role is 'admin'.
    const canQuery = !isRoleLoading && role === 'admin';
    
    const operatorsQuery = useMemoFirebase(() => canQuery ? collection(firestore, 'busOperators') : null, [firestore, canQuery]);
    const { data, isLoading: isLoadingCollection } = useCollection<BusOperator>(operatorsQuery);

    return { operators: data ?? [], isLoading: isRoleLoading || isLoadingCollection };
}

// Hook to get all booking requests
export const useAdminBookingData = () => {
    const { firestore } = useFirebase();
    const { role, isLoading: isRoleLoading } = useUserRole();
    // IMPORTANT: Only allow querying if the role check is complete and the role is 'admin'.
    const canQuery = !isRoleLoading && role === 'admin';

    const bookingsQuery = useMemoFirebase(() => canQuery ? collection(firestore, 'bookingRequests') : null, [firestore, canQuery]);
    const { data, isLoading: isLoadingCollection } = useCollection<BookingRequest>(bookingsQuery);

    return { bookings: data ?? [], isLoading: isRoleLoading || isLoadingCollection };
}
