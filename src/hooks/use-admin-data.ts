
'use client';
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import type { User, BusOperator, MsrtcBooking } from '@/lib/types';


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
  contact?: {
    name: string;
    mobile: string;
    email: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'quote_rejected';
  createdAt: Timestamp;
}

export const useAdminData = (dataVersion = 0) => {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [operators, setOperators] = useState<BusOperator[]>([]);
  const [msrtcBookings, setMsrtcBookings] = useState<MsrtcBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const firestore = useFirestore();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch Requests
        const requestsCol = collection(firestore, 'bookingRequests');
        const reqQuery = query(requestsCol, orderBy('createdAt', 'desc'));
        const reqSnapshot = await getDocs(reqQuery);
        const requestsData = reqSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as BookingRequest[];
        setRequests(requestsData);

        // Fetch Users
        const usersCol = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersCol);
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];
        setUsers(usersData);

        // Fetch Operators
        const operatorsCol = collection(firestore, 'busOperators');
        const operatorsSnapshot = await getDocs(operatorsCol);
        const operatorsData = operatorsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as BusOperator[];
        setOperators(operatorsData);
        
        // Fetch MSRTC Bookings
        const msrtcCol = collection(firestore, 'msrtcBookings');
        const msrtcQuery = query(msrtcCol, orderBy('createdAt', 'desc'));
        const msrtcSnapshot = await getDocs(msrtcQuery);
        const msrtcData = msrtcSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as MsrtcBooking[];
        setMsrtcBookings(msrtcData);


      } catch (err: any) {
        console.error("Error fetching admin data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [firestore, dataVersion]);

  return { requests, users, operators, msrtcBookings, loading, error };
};
