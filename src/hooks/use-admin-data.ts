'use client';
import { useState, useEffect } from 'react';
import { initializeFirebase } from '@/firebase';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';

export interface BookingRequest {
  id: string;
  userId: string;
  fromLocation: { address: string; lat?: number; lng?: number };
  toLocation: { address: string; lat?: number; lng?: number };
  journeyDate: string;
  returnDate: string;
  seats: string;
  busType: string;
  seatType: string;
  estimate: {
    totalCost: number;
    baseFare: number;
    driverAllowance: number;
    permitCharges: number;
    numDays: number;
    totalKm: number;
  } | null;
  contact: {
    name: string;
    mobile: string;
    email: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'quote_rejected';
  createdAt: Timestamp;
}

export const useAdminData = () => {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { firestore } = initializeFirebase();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const requestsCol = collection(firestore, 'bookingRequests');
        const q = query(requestsCol, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const requestsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as BookingRequest[];
        
        setRequests(requestsData);

      } catch (err: any) {
        console.error("Error fetching booking requests:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [firestore]);

  return { requests, loading, error };
};
