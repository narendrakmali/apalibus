
'use client';

import { useFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useMemoFirebase } from '@/firebase/provider';

// Hook to get high-level stats for the operator dashboard
export const useOperatorDashboardData = () => {
  const { firestore, user } = useFirebase();

  // Query for the operator's buses
  const busesQuery = useMemoFirebase(() => 
    firestore && user ? collection(firestore, `busOperators/${user.uid}/buses`) : null,
    [firestore, user]
  );
  
  // Query for pending booking requests
  const pendingRequestsQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'bookingRequests'), where('status', '==', 'pending')) : null,
    [firestore]
  );
  
  // Query for upcoming journeys in the next 24 hours
  const upcomingJourneysQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    const now = Timestamp.now();
    const in24Hours = new Timestamp(now.seconds + 24 * 3600, now.nanoseconds);
    
    return query(
        collection(firestore, 'bookingRequests'), 
        where('operatorQuote.operatorId', '==', user.uid),
        where('status', '==', 'approved'),
        where('journeyDate', '>=', now.toDate().toISOString().split('T')[0]),
        where('journeyDate', '<=', in24Hours.toDate().toISOString().split('T')[0])
    );
  }, [firestore, user]);


  const { data: buses, isLoading: isLoadingBuses } = useCollection(busesQuery);
  const { data: pendingRequests, isLoading: isLoadingRequests } = useCollection(pendingRequestsQuery);
  const { data: upcoming, isLoading: isLoadingUpcoming } = useCollection(upcomingJourneysQuery);

  const stats = {
    totalBuses: buses?.length ?? 0,
    pendingRequests: pendingRequests?.length ?? 0,
    upcomingJourneys: upcoming?.length ?? 0,
  };

  return {
    stats,
    isLoading: isLoadingBuses || isLoadingRequests || isLoadingUpcoming,
  };
};
