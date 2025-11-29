
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
  numPassengers?: number;
  numConcession?: number;
  estimatedFare?: number;
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
  createdAt: Timestamp | string;
  operatorQuote?: {
    availableBus?: string;
  };
}

export interface User {
    id: string;
    name: string;
    email: string;
    mobileNumber: string;
    isAdmin: boolean;
}

export interface BusOperator {
    id: string;
    name: string;
    email: string;
    contactNumber: string;
}


export interface MsrtcBooking {
    id: string;
    userId: string;
    organizerName: string;
    contactNumber: string;
    email: string;
    travelDate: Timestamp | string;
    origin: string;
    destination: string;
    busType: string;
    purpose: string;
    numPassengers: number;
    numConcession: number;
    estimatedFare: number;
    passengers: any[]; // Consider defining a Passenger type
    status: 'pending' | 'confirmed' | 'rejected';
    createdAt: Timestamp | string;
}
