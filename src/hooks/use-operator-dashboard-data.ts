
'use client';

import { useFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useMemoFirebase } from '@/firebase/provider';
import { useUserRole } from './use-user-role';

// Hook to get high-level stats for the operator dashboard
export const useOperatorDashboardData = () => {
  const { firestore, user } = useFirebase();
  const { role, isLoading: isRoleLoading } = useUserRole();

  const canQuery = !isRoleLoading && role === 'operator' && !!user;

  // Query for the operator's buses
  const busesQuery = useMemoFirebase(() => 
    canQuery ? collection(firestore, `busOperators/${user.uid}/buses`) : null,
    [firestore, user, canQuery]
  );
  
  // Query for pending booking requests - only if user is an operator
  const pendingRequestsQuery = useMemoFirebase(() => 
    canQuery ? query(collection(firestore, 'bookingRequests'), where('status', '==', 'pending')) : null,
    [firestore, canQuery]
  );
  
  // Query for upcoming journeys in the next 24 hours
  const upcomingJourneysQuery = useMemoFirebase(() => {
    if (!canQuery) return null;
    const now = Timestamp.now();
    const in24Hours = new Timestamp(now.seconds + 24 * 3600, now.nanoseconds);
    
    return query(
        collection(firestore, 'bookingRequests'), 
        where('operatorQuote.operatorId', '==', user.uid),
        where('status', '==', 'approved'),
        where('journeyDate', '>=', now.toDate().toISOString().split('T')[0]),
        where('journeyDate', '<=', in24Hours.toDate().toISOString().split('T')[0])
    );
  }, [firestore, user, canQuery]);


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
    isLoading: isRoleLoading || isLoadingBuses || isLoadingRequests || isLoadingUpcoming,
  };
};
