
'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { EstimateFareOutput } from "@/ai/flows/estimate-fare";
import { IndianRupee, Save, Mail, MessageCircle, CreditCard, Route, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";


interface BookingResultProps {
  result: EstimateFareOutput;
  distance: number;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

export function BookingResult({ result, distance }: BookingResultProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const handleActionClick = (actionName: string) => {
    toast({
      title: "Feature Not Implemented",
      description: `${actionName} functionality is not yet available.`,
    })
  }

  // Round fare up to the nearest 500
  const roundedFare = Math.ceil(result.estimatedFare / 500) * 500;

  // Round distance up to nearest 25
  const roundedDistance = Math.ceil(distance / 25) * 25;

  const handlePayment = async () => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to book a trip.",
        });
        router.push('/login');
        return;
    }
    
    const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: roundedFare * 100, // amount in the smallest currency unit
        currency: "INR",
        name: "Traverse Booking",
        description: "Bus Booking Transaction",
        image: "https://example.com/your_logo.jpg", // Optional
        handler: async (response: any) => {
            try {
                if (!firestore) throw new Error("Firestore is not available.");
                // On successful payment, create a booking document
                const bookingsCollection = collection(firestore, 'bookings');
                await addDoc(bookingsCollection, {
                    userId: user.uid,
                    busId: "mock-bus-id", // This should be dynamic in a real app
                    operatorId: "mock-operator-id", // This should be dynamic
                    journeyDate: new Date(), // This should come from the form
                    status: "confirmed",
                    paymentId: response.razorpay_payment_id,
                    orderId: response.razorpay_order_id,
                    signature: response.razorpay_signature,
                    amount: roundedFare,
                    createdAt: serverTimestamp(),
                });

                toast({
                    title: "Booking Confirmed!",
                    description: `Your payment was successful. Payment ID: ${response.razorpay_payment_id}`,
                });
                 router.push('/dashboard');
            } catch (error: any) {
                console.error("Error saving booking:", error);
                toast({
                    variant: "destructive",
                    title: "Booking Failed",
                    description: "Your payment was successful, but we failed to save your booking. Please contact support.",
                });
            }
        },
        prefill: {
            name: user.displayName || "",
            email: user.email || "",
            contact: user.phoneNumber || "",
        },
        notes: {
            address: "Traverse Corporate Office",
        },
        theme: {
            color: "#294B63",
        },
    };
    
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response: any) => {
        toast({
            variant: "destructive",
            title: "Payment Failed",
            description: `Error: ${response.error.description}`,
        });
    });
    rzp.open();
  }


  return (
    <div className="mt-12 max-w-4xl mx-auto">
      <Card className="shadow-lg animate-in fade-in-50 duration-500">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl text-primary">Fare Estimate Ready!</CardTitle>
          <CardDescription>Here is a summary of your trip estimate.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8 p-8">
          <div className="flex flex-col justify-center items-center bg-primary/5 rounded-lg p-8 space-y-8">
              <div className="text-center">
                <IndianRupee className="h-12 w-12 text-accent mb-4 mx-auto"/>
                <p className="text-muted-foreground text-lg">Estimated Fare</p>
                <p className="text-5xl font-bold text-primary">
                    ₹{roundedFare.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="flex justify-around w-full text-center">
                <div>
                    <Route className="h-8 w-8 text-accent mb-2 mx-auto"/>
                    <p className="text-muted-foreground">Actual Distance</p>
                    <p className="text-2xl font-bold">{Math.round(distance)} km</p>
                </div>
                 <div>
                    <MapPin className="h-8 w-8 text-accent mb-2 mx-auto"/>
                    <p className="text-muted-foreground">Rounded Distance</p>
                    <p className="text-2xl font-bold">{roundedDistance} km</p>
                </div>
              </div>
          </div>
           <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">
                Fare Breakdown
            </h3>
            <div className="text-muted-foreground bg-secondary p-4 rounded-md whitespace-pre-wrap text-sm">
              {result.fareBreakdown}
            </div>
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="p-6 flex-col sm:flex-row items-center justify-center gap-2">
            <Button variant="outline" onClick={() => handleActionClick("Save")}>
                <Save className="mr-2 h-4 w-4"/> Save
            </Button>
            <Button variant="outline" onClick={() => handleActionClick("Email")}>
                <Mail className="mr-2 h-4 w-4"/> Email Estimate
            </Button>
            <Button variant="outline" onClick={() => handleActionClick("Share via WhatsApp")}>
                <MessageCircle className="mr-2 h-4 w-4"/> Share
            </Button>
            <Button onClick={handlePayment}>
                <CreditCard className="mr-2 h-4 w-4"/> Proceed to Book
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
