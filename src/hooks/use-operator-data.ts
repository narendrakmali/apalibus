
'use client';
import { useState, useEffect } from 'react';
import { initializeFirebase } from '@/firebase';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import type { Bus, BookingRequest } from '@/lib/types';

export const useOperatorData = (operatorId?: string) => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { firestore } = initializeFirebase();

  useEffect(() => {
    if (!operatorId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let busesLoaded = false;
    let requestsLoaded = false;

    const checkLoadingComplete = () => {
        if (busesLoaded && requestsLoaded) {
            setLoading(false);
        }
    };
    
    // Listener for buses
    const busesQuery = query(collection(firestore, 'busOperators', operatorId, 'buses'));
    const unsubscribeBuses = onSnapshot(busesQuery, (snapshot) => {
      const busesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Bus[];
      setBuses(busesData);
      busesLoaded = true;
      checkLoadingComplete();
    }, (err) => {
      console.error("Error fetching buses:", err);
      setError("Failed to fetch bus data.");
      busesLoaded = true;
      checkLoadingComplete();
    });

    // Listener for all booking requests
    const requestsQuery = query(collection(firestore, 'bookingRequests'), orderBy('createdAt', 'desc'));
    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
      const requestsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BookingRequest[];
      setRequests(requestsData);
      requestsLoaded = true;
      checkLoadingComplete();
    }, (err) => {
      console.error("Error fetching booking requests:", err);
      setError("Failed to fetch booking requests.");
      requestsLoaded = true;
      checkLoadingComplete();
    });


    // Cleanup function
    return () => {
      unsubscribeBuses();
      unsubscribeRequests();
    };

  }, [firestore, operatorId]);

  return { buses, requests, loading, error };
};
