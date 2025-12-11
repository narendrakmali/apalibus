
'use client';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import PlacesAutocomplete from "@/components/places-autocomplete";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { useCurrentLocation } from "@/hooks/use-current-location";
import { useRouter } from "next/navigation";
import { useAuth, useFirestore } from '@/firebase';
import { signInAnonymously } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Textarea } from "@/components/ui/textarea";

const libraries: ("places")[] = ["places"];

interface Location {
  address: string;
  lat?: number;
  lng?: number;
}

export default function RequestQuotePage() {
  const [fromLocation, setFromLocation] = useState<Location>({ address: "" });
  const [toLocation, setToLocation] = useState<Location>({ address: "Sangli, Maharashtra, India" });
  const [journeyDate, setJourneyDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [journeyTime, setJourneyTime] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [passengers, setPassengers] = useState("");
  const [busType, setBusType] = useState("");
  
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRequestConfirm, setShowRequestConfirm] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script-request-quote',
    googleMapsApiKey: googleMapsApiKey!,
    libraries,
    language: 'en',
  });

  const { locationName, coords } = useCurrentLocation(isLoaded);

  useEffect(() => {
    if (locationName && coords) {
      setFromLocation({ address: locationName, lat: coords.lat, lng: coords.lng });
    }
  }, [locationName, coords]);
  
  useEffect(() => {
    if (isLoaded) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: 'Sangli, Maharashtra' }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const { lat, lng } = results[0].geometry.location;
          setToLocation({ address: 'Sangli, Maharashtra, India', lat: lat(), lng: lng() });
        }
      });
    }
  }, [isLoaded]);

  const validateAndSubmit = () => {
    if (!fromLocation.address || !toLocation.address || !busType || !journeyDate || !returnDate || !passengers || !journeyTime || !returnTime) {
      setError("Please fill all trip details: locations, dates, times, bus type, and passenger count.");
      setIsAlertOpen(true);
      return;
    }

    if (!fullName || !mobileNumber || !email) {
       setError("Please provide your contact information: Name, Mobile, and Email.");
      setIsAlertOpen(true);
      return;
    }

    const startDate = new Date(journeyDate);
    const endDate = new Date(returnDate);
    if(startDate > endDate) {
      setError("Return date must be after the journey date.");
      setIsAlertOpen(true);
      return;
    }
    
    setError(null);
    setShowRequestConfirm(true);
  }

  const generateAlphanumericId = (length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `RQ-${result}`;
  }

  const handleCreateRequest = async () => {
    if (isSubmitting) return;
    
    setShowRequestConfirm(false);
    setIsSubmitting(true);
    setError(null);

    try {
      let user = auth.currentUser;
      if (!user) {
        const userCredential = await signInAnonymously(auth);
        user = userCredential.user;
      }

      if (!user) {
        throw new Error("Could not create an anonymous user session.");
      }

      const requestId = generateAlphanumericId(8);
      const docRef = doc(firestore, "bookingRequests", requestId);

      const requestData = {
        id: requestId,
        userId: user.uid,
        fromLocation,
        toLocation,
        journeyDate,
        returnDate,
        journeyTime,
        returnTime,
        seats: passengers,
        busType,
        seatType: '', // Not specified in this form, can be added if needed
        estimate: null, // No estimate on initial request
        notes,
        contact: {
          name: fullName,
          mobile: mobileNumber,
          email: email,
        },
        status: "pending",
        createdAt: serverTimestamp(),
      };
      
      setDoc(docRef, requestData)
        .then(() => {
          setShowSuccessDialog(true);
        })
        .catch((serverError) => {
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'create',
            requestResourceData: requestData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });

    } catch (e: any) {
      setError(`Failed to create booking request: ${e.message}`);
      setIsAlertOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4">
        <div className="max-w-3xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Request a Bus Quote</h1>
                    <p className="text-slate-500 mt-2">Fill in your travel details, and our team will provide a competitive quote within 24 hours.</p>
                </div>
                {isLoaded ? (
                <form onSubmit={(e) => { e.preventDefault(); validateAndSubmit(); }}>
                    <div className="space-y-6">
                        <div className="border-b pb-6">
                            <h2 className="text-lg font-semibold text-slate-700 mb-4">Trip Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>From</Label>
                                    <PlacesAutocomplete 
                                        onLocationSelect={(address, lat, lng) => setFromLocation({ address, lat, lng })}
                                        initialValue={fromLocation.address}
                                        className="w-full"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>To (Destination)</Label>
                                    <Input value={toLocation.address} disabled />
                                </div>
                                <div className="space-y-1">
                                    <Label>Journey Date</Label>
                                    <Input type="date" value={journeyDate} onChange={e => setJourneyDate(e.target.value)} required />
                                </div>
                                <div className="space-y-1">
                                    <Label>Departure Time</Label>
                                    <Input type="time" value={journeyTime} onChange={e => setJourneyTime(e.target.value)} required />
                                </div>
                                <div className="space-y-1">
                                    <Label>Return Date</Label>
                                    <Input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} required />
                                </div>
                                <div className="space-y-1">
                                    <Label>Return Time</Label>
                                    <Input type="time" value={returnTime} onChange={e => setReturnTime(e.target.value)} required />
                                </div>
                                <div className="space-y-1">
                                    <Label>Number of Passengers</Label>
                                    <Input type="number" placeholder="e.g. 45" value={passengers} onChange={e => setPassengers(e.target.value)} required/>
                                </div>
                                <div className="space-y-1">
                                    <Label>Preferred Bus Type</Label>
                                    <Select onValueChange={setBusType} value={busType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select bus type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="AC Seater/Sleeper">AC Bus (Seater or Sleeper)</SelectItem>
                                            <SelectItem value="Non-AC Seater/Sleeper">Non-AC Bus (Seater or Sleeper)</SelectItem>
                                            <SelectItem value="MSRTC Shivshahi">MSRTC Shivshahi (AC Seater)</SelectItem>
                                            <SelectItem value="MSRTC Hirkani">MSRTC Hirkani (Non-AC Seater)</SelectItem>
                                            <SelectItem value="Any">Any Available</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="border-b pb-6">
                            <h2 className="text-lg font-semibold text-slate-700 mb-4">Contact Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Full Name</Label>
                                    <Input type="text" placeholder="Enter your full name" value={fullName} onChange={e => setFullName(e.target.value)} required />
                                </div>
                                <div className="space-y-1">
                                    <Label>Mobile Number</Label>
                                    <Input type="tel" placeholder="Enter mobile number" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} required />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <Label>Email Address</Label>
                                    <Input type="email" placeholder="Enter your email address" value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <Label>Notes (Optional)</Label>
                                    <Textarea placeholder="Any specific requests or questions?" value={notes} onChange={(e) => setNotes(e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                           {isSubmitting ? 'Submitting...' : 'Submit Quote Request'}
                        </Button>
                    </div>

                </form>
                ) : (
                    <div className="text-center p-8 text-gray-500">
                        Loading map services...
                    </div>
                )}
            </div>
        </div>
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Error</AlertDialogTitle>
              <AlertDialogDescription>
                {error}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => { setIsAlertOpen(false); setError(null); }}>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showRequestConfirm} onOpenChange={setShowRequestConfirm}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Booking Request</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will submit your request. Our team will review it and contact you with a final quote via your provided mobile number or email. Are you sure you want to proceed?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCreateRequest}>Submit Request</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Request Submitted Successfully!</AlertDialogTitle>
                    <AlertDialogDescription>
                        Thank you for your request. Our team will contact you shortly with a quote. You can also track the status of your request online using your mobile number.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => router.push(`/track-status?mobile=${mobileNumber}`)}>
                        Check Status
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
