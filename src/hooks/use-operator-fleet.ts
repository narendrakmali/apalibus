
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { Bus, BookingRequest } from '@/components/operator/fleet-dashboard';
import { useMemoFirebase } from '@/firebase/provider';


export const useOperatorFleet = () => {
    const { firestore, user, isUserLoading } = useFirebase();
    const [error, setError] = useState<string | null>(null);

    // 1. Fetch the operator's buses
    const operatorBusesQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, `busOperators/${user.uid}/buses`);
    }, [firestore, user]);

    const { data: buses, isLoading: isLoadingBuses, error: busesError } = useCollection<Bus>(operatorBusesQuery);

    // 2. Fetch all booking requests (operators need to see all to assign buses)
    const bookingRequestsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        // In a real-world app with many operators, you'd likely have a more complex query,
        // perhaps on a field that operators can see, or via a backend function.
        // For now, we fetch all and filter client-side, which is fine for a small number of requests.
        return query(collection(firestore, 'bookingRequests'), where('status', 'in', ['pending', 'approved']));
    }, [firestore]);

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
        isLoading: isUserLoading || isLoadingBuses || isLoadingBookings,
        error,
    };
};
