
'use client';

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, XCircle, MapPin, Calendar, Users, Bus, ArrowRight, Hourglass, CheckCircle, User as UserIcon } from "lucide-react";
import type { BookingRequest, MsrtcBooking, User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useFirestore } from "@/firebase";
import { collection, query, where, onSnapshot, Unsubscribe } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInAnonymously } from "firebase/auth";

type CombinedRequest = (BookingRequest | MsrtcBooking) & { type: 'Private' | 'MSRTC' };

const StatusIndicator = ({ status }: { status: string }) => {
    const getStatusInfo = () => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return { icon: <Hourglass className="h-5 w-5 text-yellow-500" />, text: "Pending", variant: "secondary" as const };
            case 'approved':
            case 'confirmed':
                return { icon: <CheckCircle className="h-5 w-5 text-green-600" />, text: "Confirmed", variant: "default" as const };
            case 'rejected':
            case 'quote_rejected':
                 return { icon: <XCircle className="h-5 w-5 text-destructive" />, text: "Rejected", variant: "destructive" as const };
            default:
                return { icon: <Clock className="h-5 w-5 text-muted-foreground" />, text: status || "Submitted", variant: "outline" as const };
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

function formatDate(date: any) {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}


function TrackStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const firestore = useFirestore();
  const auth = useAuth();
  const [currentUser, authLoading] = useAuthState(auth);

  const [mobileNumber, setMobileNumber] = useState('');
  
  const [foundUsers, setFoundUsers] = useState<User[]>([]);
  const [foundRequests, setFoundRequests] = useState<CombinedRequest[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);

  const handleSearch = () => {
    if (!mobileNumber) {
        alert("Please enter a mobile number to search.");
        return;
    }
    // Update URL to trigger the data fetching effect
    router.push(`/track-status?mobile=${mobileNumber}`);
  };

  useEffect(() => {
    const mobileFromUrl = searchParams.get('mobile');
    if (mobileFromUrl) {
        setMobileNumber(mobileFromUrl);
    } else {
        // Clear results if there's no mobile number in the URL
        setFoundUsers([]);
        setFoundRequests([]);
    }
  }, [searchParams]);

  useEffect(() => {
    const mobileToSearch = searchParams.get('mobile');

    // Only run if there's a mobile number in the URL and auth state is determined
    if (!mobileToSearch || authLoading) {
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    setQueryError(null);
    setFoundUsers([]);
    setFoundRequests([]);

    const performQuery = () => {
        const unsubscribes: Unsubscribe[] = [];

        const queries = [
            { col: 'users', field: 'mobileNumber', type: 'User' },
            { col: 'bookingRequests', field: 'contact.mobile', type: 'Private' },
            { col: 'msrtcBookings', field: 'contactNumber', type: 'MSRTC' }
        ];

        let activeQueries = queries.length;
        const onQueryDone = () => {
            activeQueries--;
            if (activeQueries === 0) {
                setDataLoading(false);
            }
        };

        queries.forEach(({ col, field, type }) => {
            const q = query(collection(firestore, col), where(field, "==", mobileToSearch));
            
            const unsubscribe = onSnapshot(q, (snapshot) => {
                if (type === 'User') {
                    const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
                    setFoundUsers(usersData);
                } else {
                    const requestsData = snapshot.docs.map(doc => ({ ...doc.data(), type, id: doc.id })) as CombinedRequest[];
                    setFoundRequests(prev => {
                        const otherRequests = prev.filter(r => r.type !== type);
                        return [...otherRequests, ...requestsData].sort((a, b) => {
                             const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
                             const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
                             return dateB.getTime() - dateA.getTime();
                        });
                    });
                }
                 if (!snapshot.metadata.fromCache) {
                    onQueryDone();
                }
            }, (error) => {
                console.error(`Error fetching ${col}:`, error);
                setQueryError(`Failed to fetch data. Ensure you are connected to the internet.`);
                onQueryDone();
            });
            unsubscribes.push(unsubscribe);
        });

        return () => {
          unsubscribes.forEach(unsub => unsub());
        };
    }

    if (!currentUser) {
      signInAnonymously(auth)
        .then(() => {
          // Anonymous sign-in successful, the hook will re-run with a currentUser
          // so the query will be performed in the next render cycle.
        })
        .catch(err => {
          console.error("Anonymous sign-in failed:", err);
          setQueryError("Could not authenticate to perform search.");
          setDataLoading(false);
        });
    } else {
        // If user is already available, perform the query
        const cleanup = performQuery();
        return cleanup;
    }

  }, [searchParams, currentUser, authLoading, firestore, auth]);
  
  const mobileToDisplay = searchParams.get('mobile');
  const noResults = !dataLoading && mobileToDisplay && foundUsers.length === 0 && foundRequests.length === 0;

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
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
            </div>
            <Button onClick={handleSearch} disabled={dataLoading} className="self-end">
                {dataLoading ? "Searching..." : "Track Request"}
            </Button>
          </div>
          
          {queryError && <p className="text-destructive text-center mb-4">Error: {queryError}</p>}
          
          <div className="space-y-6">
            {dataLoading && (
                 Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i}><CardContent className="pt-6 space-y-3"><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-3/4" /><Skeleton className="h-5 w-1/2" /></CardContent></Card>
                 ))
            )}

            {!dataLoading && mobileToDisplay && (foundUsers.length > 0 || foundRequests.length > 0) && (
                <h3 className="text-lg font-semibold text-center">Found results for {mobileToDisplay}</h3>
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
                    No users or requests found for the mobile number: <span className="font-semibold">{mobileToDisplay}</span>
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
