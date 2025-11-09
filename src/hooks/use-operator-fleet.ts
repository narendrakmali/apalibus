
'use client';

import { useEffect, useState } from 'react';
import { useFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { Bus, BookingRequest } from '@/components/operator/fleet-dashboard';
import { useMemoFirebase } from '@/firebase/provider';
import { useUserRole } from './use-user-role';


export const useOperatorFleet = () => {
    const { firestore, user, isUserLoading } = useFirebase();
    const { role, isLoading: isRoleLoading } = useUserRole();
    const [error, setError] = useState<string | null>(null);

    // 1. Fetch the operator's buses
    const operatorBusesQuery = useMemoFirebase(() => {
        // Wait until role is confirmed as 'operator' and user is logged in
        if (isRoleLoading || role !== 'operator' || !firestore || !user) return null;
        return collection(firestore, `busOperators/${user.uid}/buses`);
    }, [firestore, user, role, isRoleLoading]);

    const { data: buses, isLoading: isLoadingBuses, error: busesError } = useCollection<Bus>(operatorBusesQuery);

    // 2. Fetch all relevant booking requests for an operator
    const bookingRequestsQuery = useMemoFirebase(() => {
        // Wait until role is confirmed as 'operator'
        if (isRoleLoading || role !== 'operator' || !firestore) return null;
        // Fetch all requests that are either pending (for any operator to claim)
        // or have already been actioned by the current operator.
        return query(collection(firestore, 'bookingRequests'), where('status', 'in', ['pending', 'approved', 'rejected', 'quote_rejected']));
    }, [firestore, role, isRoleLoading]);

    const { data: bookings, isLoading: isLoadingBookings, error: bookingsError } = useCollection<BookingRequest>(bookingRequestsQuery);

    useEffect(() => {
        if (busesError) {
            setError(busesError.message);
            console.error("Error fetching buses:", busesError);
        } else if (bookingsError) {
            setError(bookingsError.message);
            console.error("Error fetching bookings:", bookingsError);
        } else {
            setError(null);
        }
    }, [busesError, bookingsError]);


    return {
        buses,
        bookings,
        // The overall loading state depends on all async operations
        isLoading: isUserLoading || isRoleLoading || isLoadingBuses || isLoadingBookings,
        error,
    };
};
