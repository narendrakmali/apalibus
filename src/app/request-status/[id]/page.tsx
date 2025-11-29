
'use client';

import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, MapPin, Calendar, Users, Bus, ArrowRight, Hourglass } from "lucide-react";
import { useFirestore } from '@/firebase';
import { doc, getDoc } from "firebase/firestore";
import type { BookingRequest, MsrtcBooking } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const StatusIndicator = ({ status }: { status: string }) => {
    const getStatusInfo = () => {
        switch (status.toLowerCase()) {
            case 'pending':
                return { icon: <Hourglass className="h-10 w-10 text-yellow-500" />, text: "Request Pending", description: "Your request has been submitted and is awaiting review from the operator.", variant: "secondary" as const, bg: "bg-yellow-100" };
            case 'approved':
            case 'confirmed':
                return { icon: <CheckCircle className="h-10 w-10 text-green-600" />, text: "Request Confirmed", description: "Your booking has been confirmed! You will be contacted shortly with further details.", variant: "default" as const, bg: "bg-green-100"};
            case 'rejected':
            case 'quote_rejected':
                 return { icon: <XCircle className="h-10 w-10 text-destructive" />, text: "Request Rejected", description: "Unfortunately, we were unable to fulfill your request at this time. Please contact us for more options.", variant: "destructive" as const, bg: "bg-red-100" };
            default:
                return { icon: <Clock className="h-10 w-10 text-muted-foreground" />, text: "Request Submitted", description: "Thank you for your request. Our team will get back to you shortly.", variant: "outline" as const, bg: "bg-gray-100" };
        }
    }
    const { icon, text, description, variant, bg } = getStatusInfo();
    return (
        <div className="text-center items-center flex flex-col">
            <div className={`${bg} rounded-full p-3 w-fit mb-4`}>
                {icon}
            </div>
            <CardTitle className="text-2xl font-display mt-2">{text}</CardTitle>
            <CardDescription className="mt-2">{description}</CardDescription>
            <Badge variant={variant} className="mt-4 capitalize">{status}</Badge>
        </div>
    );
}


export default function RequestStatusPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const id = params.id as string;
  const isMsrtc = searchParams.get('msrtc') === 'true';

  const [request, setRequest] = useState<BookingRequest | MsrtcBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const firestore = useFirestore();

  useEffect(() => {
    if (!id) {
      setError("No request ID provided.");
      setLoading(false);
      return;
    }

    const collectionName = isMsrtc ? "msrtcBookings" : "bookingRequests";

    const fetchRequest = async () => {
      try {
        const docRef = doc(firestore, collectionName, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setRequest({ id: docSnap.id, ...docSnap.data() } as BookingRequest | MsrtcBooking);
        } else {
          setError("No such request found. Please check the ID.");
        }
      } catch (err) {
        console.error("Error fetching request:", err);
        setError("Failed to fetch request details.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id, firestore, isMsrtc]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-secondary/50 py-12 px-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
           {loading ? <Skeleton className="h-24 w-full" /> : 
            request ? <StatusIndicator status={request.status} /> : 
            <CardTitle>Request Not Found</CardTitle>}
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div>
            <p className="text-sm text-muted-foreground text-center mb-2">Your request ID is:</p>
            <p className="font-mono text-sm bg-muted p-2 rounded-md text-center">{id}</p>
          </div>

          <div className="border rounded-lg p-4 space-y-3 bg-background/50">
             <h3 className="font-semibold text-center mb-3">Your Trip Summary</h3>
             {loading ? (
                <div className="space-y-3">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4 mx-auto" />
                </div>
             ) : error ? (
                <p className="text-destructive text-center">{error}</p>
             ) : request ? (
                <>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium">From:</span>
                    <span className="ml-2 text-muted-foreground truncate">{'fromLocation' in request ? request.fromLocation.address : request.origin}</span>
                  </div>
                   <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium">To:</span>
                    <span className="ml-2 text-muted-foreground truncate">{'toLocation' in request ? request.toLocation.address : request.destination}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium">Date:</span>
                    <span className="ml-2 text-muted-foreground">
                        {'journeyDate' in request ? new Date(request.journeyDate as string).toLocaleDateString() : new Date((request.travelDate as any).seconds * 1000).toLocaleDateString()}
                        {'returnDate' in request && request.returnDate &&
                          <>
                            <ArrowRight className="inline h-3 w-3 mx-1" />
                            {new Date(request.returnDate as string).toLocaleDateString()}
                          </>
                        }
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-3 text-muted-foreground" />
                    <span className="font-medium">Passengers:</span>
                    <span className="ml-2 text-muted-foreground">{'seats' in request ? request.seats : request.numPassengers}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Bus className="h-4 w-4 mr-3 text-muted-foreground" />
                    <span className="font-medium">Bus Type:</span>
                    <span className="ml-2 text-muted-foreground">{request.busType}</span>
                  </div>
                </>
             ) : null}
          </div>

          <div className="flex items-center justify-center gap-2 text-muted-foreground pt-4 text-center text-sm">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>You can bookmark this page to check your request status later.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
