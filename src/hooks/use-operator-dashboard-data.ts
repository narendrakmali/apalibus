
'use client';

import { useFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
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

  const { data: buses, isLoading: isLoadingBuses } = useCollection(busesQuery);
  const { data: pendingRequests, isLoading: isLoadingRequests } = useCollection(pendingRequestsQuery);

  const stats = {
    totalBuses: buses?.length ?? 0,
    pendingRequests: pendingRequests?.length ?? 0,
  };

  return {
    stats,
    isLoading: isLoadingBuses || isLoadingRequests,
  };
};
