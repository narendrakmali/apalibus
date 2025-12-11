
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
  numGents?: number;
  numLadies?: number;
  numSrCitizen?: number;
  numAmritCitizen?: number;
  numChildren?: number;
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
    travelDate: Timestamp | any;
    origin: string;
    destination: string;
    busType: string;
    purpose: string;
    numPassengers: number;
    numGents?: number;
    numLadies?: number;
    numSrCitizen?: number;
    numAmritCitizen?: number;
    numChildren?: number;
    numConcession?: number;
    estimatedFare: number;
    passengers: any[]; // Consider defining a Passenger type
    status: 'pending' | 'confirmed' | 'rejected' | 'fulfilled';
    createdAt: Timestamp | string;
}


export interface VehicleSubmission {
  id: string;
  userId: string;
  contactName: string;
  contactMobile: string;
  coordinatorName: string;
  bookingType: 'Private Bus' | 'MSRTC Bus';
  busRegistration?: string;
  operatorName?: string;
  journeyDate: string;
  returnDate: string;
  passengerCount: number;
  ticketImageUrl: string;
  createdAt: Timestamp;
}

    
    