
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
import { doc, setDoc, collection, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Textarea } from "@/components/ui/textarea";

const libraries: ("places")[] = ["places"];

interface Location {
  address: string;
  lat?: number;
  lng?: number;
}

interface EstimateDetails {
  totalCost: number;
  baseFare: number;
  driverAllowance: number;
  permitCharges: number;
  numDays: number;
  totalKm: number;
  singleJourneyKm?: number;
  returnJourneyKm?: number;
}


export default function SearchPage() {
  const [fromLocation, setFromLocation] = useState<Location>({ address: "" });
  const [toLocation, setToLocation] = useState<Location>({ address: "" });
  const [journeyDate, setJourneyDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [seatType, setSeatType] = useState("");

  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");

  const [estimate, setEstimate] = useState<EstimateDetails | null>(null);
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
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey!,
    libraries,
    language: 'en',
    skip: !googleMapsApiKey,
  });

  const { locationName, coords } = useCurrentLocation(isLoaded);

  useEffect(() => {
    if (locationName && coords) {
      setFromLocation({ address: locationName, lat: coords.lat, lng: coords.lng });
    }
  }, [locationName, coords]);

  const handleSubmit = () => {
     if (!fromLocation.lat || !fromLocation.lng || !toLocation.lat || !toLocation.lng) {
      setError("Please select valid 'From' and 'To' locations from the suggestions.");
      setIsAlertOpen(true);
      return;
    }
    
    if (!selectedVehicle || !journeyDate || !returnDate || !passengers) {
      setError("Please fill all trip details: Vehicle Type, Passengers, Journey Date, and Return Date.");
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
    setEstimate(null);

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: { lat: fromLocation.lat, lng: fromLocation.lng },
        destination: { lat: toLocation.lat, lng: toLocation.lng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK && result) {
          const oneWayDistance = result.routes[0].legs[0].distance!.value / 1000; // in km

          const rateInfo = rateCard[parseInt(selectedVehicle)];

          if (!rateInfo) {
            setError("No rate information found for the selected bus configuration.");
            setIsAlertOpen(true);
            return;
          }

          const numDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
          
          const singleJourneyKm = oneWayDistance + 20;
          const returnJourneyKm = oneWayDistance + 20;
          const calculatedTotalKm = singleJourneyKm + returnJourneyKm;
          
          const minKmForTrip = rateInfo.minKmPerDay * numDays;
          const totalKm = Math.max(calculatedTotalKm, minKmForTrip);
          
          const baseFare = totalKm * rateInfo.ratePerKm;
          const totalDriverAllowance = numDays * rateInfo.driverAllowance;
          const totalPermitCharges = numDays * rateInfo.permitCharges;

          const totalCost = baseFare + totalDriverAllowance + totalPermitCharges;

          setEstimate({
            totalCost,
            baseFare,
            driverAllowance: totalDriverAllowance,
            permitCharges: totalPermitCharges,
            numDays,
            totalKm,
            singleJourneyKm: Math.round(singleJourneyKm),
            returnJourneyKm: Math.round(returnJourneyKm),
          });
        } else {
          setError("Could not calculate the distance between the selected locations.");
        }
        setIsAlertOpen(true);
      }
    );
  }

  const handleShare = () => {
    if (!estimate) {
        alert("Please calculate an estimate first before sharing.");
        return;
    }
    const rateInfo = rateCard[parseInt(selectedVehicle)];

    const subject = "Bus Trip Estimate from Sakpal Travels";
    const body = `
Hello ${fullName},

Here is the estimated cost for your bus journey for ${passengers} passengers:

From: ${fromLocation.address}
To: ${toLocation.address}
Journey Date: ${journeyDate}
Return Date: ${returnDate}
Vehicle: ${rateInfo.vehicleType} (${rateInfo.seatingCapacity} Seater ${rateInfo.busType})
Seat Type: ${seatType || 'Not specified'}

Estimated Cost Breakdown:
- Single Journey Distance: ~${estimate.singleJourneyKm} km
- Return Journey Distance: ~${estimate.returnJourneyKm} km
- Base Fare (for ~${estimate.totalKm} km): ${estimate.baseFare.toLocaleString('en-IN')}
- Driver Allowance (for ${estimate.numDays} days): ${estimate.driverAllowance.toLocaleString('en-IN')}
- Permit Charges (for ${estimate.numDays} days): ${estimate.permitCharges.toLocaleString('en-IN')}

Total Estimated Cost: ${estimate.totalCost.toLocaleString('en-IN')}

Please note: This is an approximate cost. Actual cost may vary based on final details.

Thank you,
Sakpal Travels
    `;

    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const generateAlphanumericId = (length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  const handleCreateRequest = async () => {
    if (isSubmitting) return;
    
    const rateInfo = selectedVehicle ? rateCard[parseInt(selectedVehicle)] : null;

    if (!fromLocation.address || !toLocation.address || !journeyDate || !returnDate || !passengers || !rateInfo || !fullName || !mobileNumber || !email) {
      setError("Please fill out all fields before submitting a request.");
      setIsAlertOpen(true);
      return;
    }
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
        seats: passengers,
        busType: `${rateInfo.vehicleType} (${rateInfo.seatingCapacity} Seater ${rateInfo.busType})`,
        seatType,
        estimate,
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

  const handleBookNow = () => {
    if (!estimate) {
        handleSubmit();
    } else {
        setShowRequestConfirm(true);
    }
  }

  return (
    <div className="booking-page-wrapper">
        <div className="booking-card-container">
            <div className="booking-card">
                <div className="form-header">
                    <span className="badge">Group & Private</span>
                    <h1>Rent a Bus</h1>
                    <p>Reliable group travel packages for any occasion. Get an instant estimate.</p>
                </div>
                {isLoaded ? (
                <form onSubmit={(e) => { e.preventDefault(); handleBookNow(); }}>
                    <div className="form-section-title">Trip Details</div>
                    <div className="form-grid">
                        <div className="input-group">
                            <Label>📍 From</Label>
                            <PlacesAutocomplete 
                                onLocationSelect={(address, lat, lng) => setFromLocation({ address, lat, lng })}
                                initialValue={fromLocation.address}
                                className="input-field"
                            />
                        </div>
                        <div className="input-group">
                            <Label>📍 To (Destination)</Label>
                            <PlacesAutocomplete 
                                onLocationSelect={(address, lat, lng) => setToLocation({ address, lat, lng })}
                                initialValue={toLocation.address}
                                className="input-field"
                            />
                        </div>
                        <div className="input-group">
                            <Label>📅 Journey Date</Label>
                            <Input type="date" className="input-field" value={journeyDate} onChange={e => setJourneyDate(e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <Label>📅 Return Date</Label>
                            <Input type="date" className="input-field" value={returnDate} onChange={e => setReturnDate(e.target.value)} required />
                        </div>
                    </div>

                    <div className="form-section-title">Vehicle & Passengers</div>
                    <div className="form-grid">
                        <div className="input-group">
                            <Label>👥 Number of Passengers</Label>
                            <Input type="number" className="input-field" placeholder="e.g. 25" value={passengers} onChange={e => setPassengers(e.target.value)} required/>
                        </div>
                        <div className="input-group">
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
                    </div>

                    <div className="action-area">
                        <button type="button" onClick={handleShare} className="btn btn-secondary">Share Estimate</button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                           {isSubmitting ? 'Submitting...' : 'Get Estimate & Book ➔'}
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
              <AlertDialogTitle>{error ? 'Error' : 'Estimated Fare Breakdown'}</AlertDialogTitle>
              {estimate && !error && (
                <AlertDialogDescription>
                  This is an approximate cost for a {estimate.numDays}-day trip for {passengers} passengers. Actual cost may vary.
                </AlertDialogDescription>
              )}
            </AlertDialogHeader>
            <div className="py-4 space-y-2">
              {error ? (
                <p className="text-destructive">{error}</p>
              ) : estimate ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Single Journey KM</span>
                    <span>~{estimate.singleJourneyKm} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Return Journey KM</span>
                    <span>~{estimate.returnJourneyKm} km</span>
                  </div>
                   <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Fare ({estimate.totalKm} km)</span>
                    <span>{estimate.baseFare.toLocaleString('en-IN')}</span>
                  </div>
                   <div className="flex justify-between">
                    <span className="text-muted-foreground">Driver Allowance ({estimate.numDays} days)</span>
                    <span>{estimate.driverAllowance.toLocaleString('en-IN')}</span>
                  </div>
                   <div className="flex justify-between">
                    <span className="text-muted-foreground">Permit Charges ({estimate.numDays} days)</span>
                    <span>{estimate.permitCharges.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="border-t my-2"></div>

                  <div className="flex justify-between font-bold text-lg pt-2 mt-2">
                    <span>Total Estimate</span>
                    <span>{estimate.totalCost.toLocaleString('en-IN')}</span>
                  </div>
                </>
              ) : (
                 <p>Calculating estimate...</p>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => { setIsAlertOpen(false); setError(null); if (estimate) { setShowRequestConfirm(true); } }}>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showRequestConfirm} onOpenChange={setShowRequestConfirm}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Booking Request</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will submit your request to our operators. They will review it and provide a final quote. Are you sure you want to proceed?
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
                        Thanks for creating a request. Our backend team will update you about your request by call, or you can check your status online.
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
