
'use client';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import PlacesAutocomplete from "@/components/places-autocomplete";
import { rateCard } from "@/lib/rate-card";
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


export default function SpecialOfferPage() {
  const [fromLocation, setFromLocation] = useState<Location>({ address: "" });
  const [toLocation, setToLocation] = useState<Location>({ address: "Sangli Samagam" });
  const [journeyDate, setJourneyDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [journeyTime, setJourneyTime] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("Regarding Special Offer");

  const [numGents, setNumGents] = useState(0);
  const [numLadies, setNumLadies] = useState(0);
  const [numSrCitizen, setNumSrCitizen] = useState(0);
  const [numAmritCitizen, setNumAmritCitizen] = useState(0);
  const [numChildren, setNumChildren] = useState(0);
  const totalPassengers = numGents + numLadies + numSrCitizen + numAmritCitizen + numChildren;

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
    id: 'google-map-script-special',
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
          setToLocation({ address: 'Sangli Samagam', lat: lat(), lng: lng() });
        }
      });
    }
  }, [isLoaded]);

  const validateAndSubmit = () => {
    if (!fromLocation.address || !toLocation.address) {
      setError("Please select valid 'Pickup Location' and 'To' locations.");
      setIsAlertOpen(true);
      return;
    }
    
    if (!selectedVehicle || !journeyDate || !returnDate || totalPassengers <= 0 || !journeyTime || !returnTime) {
      setError("Please fill all trip details including vehicle, passengers, dates, and times.");
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
    return `SO-${result}`;
  }

  const handleCreateRequest = async () => {
    if (isSubmitting) return;
    
    const rateInfo = selectedVehicle ? rateCard[parseInt(selectedVehicle)] : null;

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
        throw new Error("Could not create an anonymous user.");
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
        seats: totalPassengers.toString(),
        numGents,
        numLadies,
        numSrCitizen,
        numAmritCitizen,
        numChildren,
        busType: `${rateInfo?.vehicleType} (${rateInfo?.seatingCapacity} Seater, ${rateInfo?.busType})`,
        seatType: '', // Not specified in this form
        estimate: null, // No estimate needed for special offer
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
    <div className="booking-page-wrapper">
        <div className="booking-card-container">
            <div className="booking-card">
                <div className="form-header">
                    <span className="badge">⭐ Special Discount</span>
                    <h1>Special Offer to Sangli</h1>
                    <p>Reliable group travel packages from Mumbai/Navi Mumbai. Get a special quote.</p>
                </div>
                {isLoaded ? (
                <form onSubmit={(e) => { e.preventDefault(); validateAndSubmit(); }}>
                    <div className="form-section-title">Trip Details</div>
                    <div className="form-grid">
                        <div className="input-group">
                            <Label>📍 Pickup Location</Label>
                            <PlacesAutocomplete 
                                onLocationSelect={(address, lat, lng) => setFromLocation({ address, lat, lng })}
                                initialValue={fromLocation.address}
                                className="input-field"
                            />
                        </div>
                        <div className="input-group">
                            <Label>📍 Destination</Label>
                            <Input value={toLocation.address} className="input-field" disabled />
                        </div>
                         <div className="input-group">
                            <Label>📅 Journey Date</Label>
                            <Input type="date" className="input-field" value={journeyDate} onChange={e => setJourneyDate(e.target.value)} required />
                        </div>
                         <div className="input-group">
                            <Label>🕖 Start Time</Label>
                            <Input type="time" className="input-field" value={journeyTime} onChange={e => setJourneyTime(e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <Label>📅 Return Date</Label>
                            <Input type="date" className="input-field" value={returnDate} onChange={e => setReturnDate(e.target.value)} required />
                        </div>
                         <div className="input-group">
                            <Label>🕖 Return Time</Label>
                            <Input type="time" className="input-field" value={returnTime} onChange={e => setReturnTime(e.target.value)} required />
                        </div>
                    </div>

                    <div className="form-section-title">Vehicle & Passengers</div>
                    <div className="form-grid">
                        
                        <div className="input-group full-width">
                             <Label>🚌 Vehicle Type</Label>
                            <Select onValueChange={setSelectedVehicle} value={selectedVehicle}>
                                <SelectTrigger className="input-field">
                                    <SelectValue placeholder="Select vehicle type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {rateCard.map((vehicle, index) => (
                                        <SelectItem key={index} value={index.toString()}>
                                            {vehicle.vehicleType} ({vehicle.seatingCapacity} Seater, {vehicle.busType})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                         <div className="input-group full-width">
                            <div className="space-y-4 p-4 border rounded-lg bg-background">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 items-center">
                                    <div className="col-span-6 font-semibold text-sm">Passenger Bifurcation:</div>
                                    <div className="space-y-1">
                                        <Label htmlFor="numGents" className="text-xs">Gents</Label>
                                        <Input id="numGents" type="number" min="0" value={numGents} onChange={(e) => setNumGents(Number(e.target.value))} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="numLadies" className="text-xs">Ladies</Label>
                                        <Input id="numLadies" type="number" min="0" value={numLadies} onChange={(e) => setNumLadies(Number(e.target.value))} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="numSrCitizen" className="text-xs">Sr. Citizen (65+)</Label>
                                        <Input id="numSrCitizen" type="number" min="0" value={numSrCitizen} onChange={(e) => setNumSrCitizen(Number(e.target.value))} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="numAmritCitizen" className="text-xs">Amrit (75+)</Label>
                                        <Input id="numAmritCitizen" type="number" min="0" value={numAmritCitizen} onChange={(e) => setNumAmritCitizen(Number(e.target.value))} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="numChildren" className="text-xs">Children (5-12)</Label>
                                        <Input id="numChildren" type="number" min="0" value={numChildren} onChange={(e) => setNumChildren(Number(e.target.value))} />
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-2 bg-secondary rounded-md h-full">
                                        <Label className="text-xs font-bold">Total</Label>
                                        <div className="text-xl font-bold">{totalPassengers}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-section-title">Your Contact Information</div>
                    <div className="form-grid">
                         <div className="input-group">
                            <Label>👤 Full Name</Label>
                            <Input type="text" className="input-field" placeholder="Enter your full name" value={fullName} onChange={e => setFullName(e.target.value)} required />
                        </div>

                        <div className="input-group">
                            <Label>📞 Mobile Number</Label>
                            <Input type="tel" className="input-field" placeholder="Enter mobile number" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} required />
                        </div>

                        <div className="input-group full-width">
                            <Label>✉️ Email Address</Label>
                            <Input type="email" className="input-field" placeholder="Enter your email address" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>

                        <div className="input-group full-width">
                            <Label>📝 Notes (Optional)</Label>
                            <Textarea className="input-field" value={notes} onChange={(e) => setNotes(e.target.value)} />
                        </div>
                    </div>

                    <div className="action-area">
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                           {isSubmitting ? 'Submitting...' : 'Request a Quote ➔'}
                        </button>
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
                        This will submit your request for the special offer. Our team will review it and contact you with a final quote. Are you sure you want to proceed?
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
                        Thanks for creating a request for the special offer. Our team will contact you shortly with a discounted quote. You can also track your request online.
                    </description>
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
