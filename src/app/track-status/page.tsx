
'use client';

import { useEffect, useState, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, XCircle, MapPin, Calendar, Users, Bus, ArrowRight, Hourglass, CheckCircle, User as UserIcon } from "lucide-react";
import { useAuth, useFirestore } from '@/firebase';
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { useCollection } from 'react-firebase-hooks/firestore';
import type { BookingRequest, MsrtcBooking, User } from "@/lib/types";
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
  
  const firestore = useFirestore();
  const [user, authLoading] = useAuthState(useAuth());

  // Use react-firebase-hooks to get live data
  const [privateRequestsCol, privateLoading, privateError] = useCollection(collection(firestore, 'bookingRequests'));
  const [msrtcRequestsCol, msrtcLoading, msrtcError] = useCollection(collection(firestore, 'msrtcBookings'));
  const [usersCol, usersLoading, usersError] = useCollection(collection(firestore, 'users'));
  
  const handleSearch = (mobile: string) => {
    if (!mobile) {
      alert("Please enter a mobile number.");
      return;
    }
    setSearchedMobileNumber(mobile);
  };
  
  useEffect(() => {
    const mobileFromUrl = searchParams.get('mobile');
    if (mobileFromUrl) {
      setMobileNumber(mobileFromUrl);
      setSearchedMobileNumber(mobileFromUrl);
    }
  }, [searchParams]);

  const filteredData = useMemo(() => {
    if (!searchedMobileNumber) return { foundUsers: [], foundRequests: [] };

    const usersData = usersCol?.docs
      .map(doc => doc.data() as User)
      .filter(u => u.mobileNumber === searchedMobileNumber) || [];

    const privateData = privateRequestsCol?.docs
      .map(doc => ({ ...doc.data() as BookingRequest, type: 'Private' as const }))
      .filter(req => req.contact?.mobile === searchedMobileNumber) || [];

    const msrtcData = msrtcRequestsCol?.docs
      .map(doc => ({ ...doc.data() as MsrtcBooking, type: 'MSRTC' as const }))
      .filter(req => req.contactNumber === searchedMobileNumber) || [];

    const allRequests: CombinedRequest[] = [...privateData, ...msrtcData];

    allRequests.sort((a, b) => {
        const dateAValue = (a.createdAt as Timestamp)?.toDate ? (a.createdAt as Timestamp).toMillis() : new Date(a.createdAt as string || 0).getTime();
        const dateBValue = (b.createdAt as Timestamp)?.toDate ? (b.createdAt as Timestamp).toMillis() : new Date(b.createdAt as string || 0).getTime();
        return dateBValue - dateAValue;
      });

    return { foundUsers: usersData, foundRequests: allRequests };

  }, [searchedMobileNumber, usersCol, privateRequestsCol, msrtcRequestsCol]);

  const { foundUsers, foundRequests } = filteredData;
  const dataLoading = authLoading || privateLoading || msrtcLoading || usersLoading;
  const queryError = privateError || msrtcError || usersError;
  const noResults = !dataLoading && searchedMobileNumber && foundUsers.length === 0 && foundRequests.length === 0;

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
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(mobileNumber)}
                />
            </div>
            <Button onClick={() => handleSearch(mobileNumber)} disabled={dataLoading} className="self-end">
                {dataLoading ? "Searching..." : "Track Request"}
            </Button>
          </div>
          
          {queryError && <p className="text-destructive text-center mb-4">Error: {queryError.message}</p>}
          
          <div className="space-y-6">
            {dataLoading && searchedMobileNumber && (
                 Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i}><CardContent className="pt-6 space-y-3"><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-3/4" /><Skeleton className="h-5 w-1/2" /></CardContent></Card>
                 ))
            )}

            {!dataLoading && (foundUsers.length > 0 || foundRequests.length > 0) && (
                <h3 className="text-lg font-semibold text-center">Found results for {searchedMobileNumber}</h3>
            )}

            {foundUsers.map(user => (
                <div key={user.id}>
                    <Card className="bg-blue-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-800">
                                <UserIcon /> User Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div><span className="font-semibold">Name:</span> {user.name}</div>
                            <div><span className="font-semibold">Email:</span> {user.email}</div>
                            <div><span className="font-semibold">Mobile:</span> {user.mobileNumber}</div>
                        </CardContent>
                    </Card>
                </div>
            ))}

            {foundRequests.map(request => (
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

            {noResults && (
                <p className="text-center text-muted-foreground py-8">
                    No users or requests found for the mobile number: <span className="font-semibold">{searchedMobileNumber}</span>
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
