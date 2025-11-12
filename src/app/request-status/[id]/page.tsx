
'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Clock, MapPin, Calendar, Users, Bus, ArrowRight } from "lucide-react";
import { initializeFirebase } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { BookingRequest } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function RequestStatusPage({ params }: { params: { id: string } }) {
  const [request, setRequest] = useState<BookingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { firestore } = initializeFirebase();

  useEffect(() => {
    if (!params.id) {
      setError("No request ID provided.");
      setLoading(false);
      return;
    }

    const fetchRequest = async () => {
      try {
        const docRef = doc(firestore, "bookingRequests", params.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setRequest({ id: docSnap.id, ...docSnap.data() } as BookingRequest);
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
  }, [params.id, firestore]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-secondary/50 py-12 px-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-green-100 rounded-full p-3 w-fit">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-display mt-4">Request Submitted!</CardTitle>
          <CardDescription>Thank you for your request. Our team will get back to you shortly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div>
            <p className="text-sm text-muted-foreground text-center mb-2">Your request ID is:</p>
            <p className="font-mono text-sm bg-muted p-2 rounded-md text-center">{params.id}</p>
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
                    <MapPin className="h-4 w-4 mr-3 text-muted-foreground" />
                    <span className="font-medium">From:</span>
                    <span className="ml-2 text-muted-foreground">{request.fromLocation.address}</span>
                  </div>
                   <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-3 text-muted-foreground" />
                    <span className="font-medium">To:</span>
                    <span className="ml-2 text-muted-foreground">{request.toLocation.address}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-3 text-muted-foreground" />
                    <span className="font-medium">Dates:</span>
                    <span className="ml-2 text-muted-foreground">
                        {new Date(request.journeyDate as string).toLocaleDateString()}
                        <ArrowRight className="inline h-3 w-3 mx-1" />
                        {new Date(request.returnDate as string).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-3 text-muted-foreground" />
                    <span className="font-medium">Passengers:</span>
                    <span className="ml-2 text-muted-foreground">{request.seats}</span>
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
            <span>You can now safely close this page. We will contact you via email or phone with a quote.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
