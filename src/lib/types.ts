
import { Timestamp } from "firebase/firestore";

export interface Bus {
  id: string;
  registrationNumber: string;
  seatingCapacity: number;
  busType: string;
}

export interface BookingRequest {
  id: string;
  userId: string;
  fromLocation: { address: string; lat?: number; lng?: number };
  toLocation: { address: string; lat?: number; lng?: number };
  journeyDate: Timestamp | string;
  returnDate: Timestamp | string;
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
  operatorQuote?: {
    availableBus?: string;
  };
}
