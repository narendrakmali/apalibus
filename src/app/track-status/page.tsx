

'use client';

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, XCircle, MapPin, Calendar, Users, Bus, ArrowRight, Hourglass, CheckCircle } from "lucide-react";
import { useAuth, useFirestore } from '@/firebase';
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import type { BookingRequest, MsrtcBooking } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthState } from "react-firebase-hooks/auth";

type CombinedRequest = (BookingRequest | MsrtcBooking) & { type: 'Private' | 'MSRTC' };

const StatusIndicator = ({ status }: { status: string }) => {
    const getStatusInfo = () => {
        switch (status.toLowerCase()) {
            case 'pending':
                return { icon: <Hourglass className="h-5 w-5 text-yellow-500" />, text: "Pending", variant: "secondary" as const };
            case 'approved':
            case 'confirmed':
                return { icon: <CheckCircle className="h-5 w-5 text-green-600" />, text: "Confirmed", variant: "default" as const };
            case 'rejected':
            case 'quote_rejected':
                 return { icon: <XCircle className="h-5 w-5 text-destructive" />, text: "Rejected", variant: "destructive" as const };
            default:
                return { icon: <Clock className="h-5 w-5 text-muted-foreground" />, text: "Submitted", variant: "outline" as const };
        }
    }
    const { icon, text, variant } = getStatusInfo();
    return (
        <Badge variant={variant} className="capitalize flex items-center gap-1">
            {icon}
            <span>{text}</span>
        </Badge>
    );
}

function formatDate(date: Timestamp | string | undefined) {
    if (!date) return 'N/A';
    const d = (date as Timestamp).toDate ? (date as Timestamp).toDate() : new Date(date as string);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}


function TrackStatusContent() {
  const searchParams = useSearchParams();
  const [mobileNumber, setMobileNumber] = useState('');
  const [searchedMobileNumber, setSearchedMobileNumber] = useState('');
  
  const [requests, setRequests] = useState<CombinedRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firestore = useFirestore();
  const auth = useAuth();
  const [user, authLoading] = useAuthState(auth);

  const handleSearch = async (mobile: string) => {
    if (!mobile) {
      setError("Please enter a mobile number.");
      return;
    }
    setLoading(true);
    setError(null);
    setRequests([]);
    setSearchedMobileNumber(mobile);

    try {
      let currentUser = auth.currentUser;
      if (!currentUser) {
        await signInAnonymously(auth);
        currentUser = auth.currentUser;
      }
      
      if (!currentUser) {
        throw new Error("Authentication failed. Please try again.");
      }

      const allRequests: CombinedRequest[] = [];
      
      const privateRequestsQuery = query(
        collection(firestore, "bookingRequests"), 
        where("contact.mobile", "==", mobile)
      );
      const privateRequestsSnapshot = await getDocs(privateRequestsQuery);
      privateRequestsSnapshot.forEach(doc => {
        allRequests.push({ ...doc.data() as BookingRequest, type: 'Private' });
      });

      const msrtcRequestsQuery = query(
        collection(firestore, "msrtcBookings"), 
        where("contactNumber", "==", mobile)
      );
      const msrtcRequestsSnapshot = await getDocs(msrtcRequestsQuery);
      msrtcRequestsSnapshot.forEach(doc => {
        allRequests.push({ ...doc.data() as MsrtcBooking, type: 'MSRTC' });
      });
      
      allRequests.sort((a, b) => {
        const dateAValue = (a.createdAt as Timestamp)?.toDate ? (a.createdAt as Timestamp).toMillis() : new Date(a.createdAt as string || 0).getTime();
        const dateBValue = (b.createdAt as Timestamp)?.toDate ? (b.createdAt as Timestamp).toMillis() : new Date(b.createdAt as string || 0).getTime();
        return dateBValue - dateAValue;
      });

      setRequests(allRequests);
      
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to fetch request details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const mobileFromUrl = searchParams.get('mobile');
    if (mobileFromUrl) {
      setMobileNumber(mobileFromUrl);
      if(user) { 
        handleSearch(mobileFromUrl);
      }
    }
  }, [searchParams, user]);

  const isLoadingState = loading || authLoading;

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader className="text-center">
            <CardTitle className="text-3xl font-display text-primary">Track Your Request</CardTitle>
            <CardDescription>Enter your mobile number to see the status of your booking requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-grow space-y-2">
                <Label htmlFor="mobile-number">Mobile Number</Label>
                <Input 
                    id="mobile-number"
                    type="tel"
                    placeholder="Enter the mobile number used for booking"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                />
            </div>
            <Button onClick={() => handleSearch(mobileNumber)} disabled={isLoadingState} className="self-end">
                {isLoadingState ? "Searching..." : "Track Request"}
            </Button>
          </div>
          
          {error && <p className="text-destructive text-center mb-4">{error}</p>}
          
          <div className="space-y-6">
            {isLoadingState && (
                 Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i}><CardContent className="pt-6 space-y-3"><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-3/4" /><Skeleton className="h-5 w-1/2" /></CardContent></Card>
                 ))
            )}

            {!isLoadingState && requests.length > 0 && (
                <>
                    <h3 className="text-lg font-semibold text-center">Found {requests.length} request(s) for {searchedMobileNumber}</h3>
                    {requests.map(request => (
                        <div key={request.id}>
                            <Card className="bg-secondary/30">
                                <CardHeader className="flex flex-row justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">{request.type} Booking</CardTitle>
                                        <CardDescription className="font-mono text-xs pt-1">{request.id}</CardDescription>
                                    </div>
                                    <StatusIndicator status={request.status} />
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
                                        <span className="font-medium">Route:</span>
                                        <span className="ml-2 text-muted-foreground truncate">
                                            {'fromLocation' in request ? request.fromLocation.address : request.origin}
                                            <ArrowRight className="inline h-3 w-3 mx-1" />
                                            {'toLocation' in request ? request.toLocation.address : request.destination}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
                                        <span className="font-medium">Date:</span>
                                        <span className="ml-2 text-muted-foreground">
                                            {formatDate('journeyDate' in request ? request.journeyDate : request.travelDate)}
                                            {'returnDate' in request && request.returnDate &&
                                            <>
                                                <ArrowRight className="inline h-3 w-3 mx-1" />
                                                {formatDate(request.returnDate)}
                                            </>
                                            }
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <Users className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
                                        <span className="font-medium">Passengers:</span>
                                        <span className="ml-2 text-muted-foreground">{'seats' in request ? request.seats : request.numPassengers}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Bus className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
                                        <span className="font-medium">Bus Type:</span>
                                        <span className="ml-2 text-muted-foreground">{request.busType}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </>
            )}

            {!isLoadingState && searchedMobileNumber && requests.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                    No requests found for the mobile number: <span className="font-semibold">{searchedMobileNumber}</span>
                </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


export default function TrackStatusPage() {
    return (
        <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
            <TrackStatusContent />
        </Suspense>
    )
}
