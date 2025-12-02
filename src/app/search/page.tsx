
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
import Image from "next/image";
import { useAuth, useFirestore } from '@/firebase';
import { signInAnonymously } from "firebase/auth";
import { doc, setDoc, collection, serverTimestamp } from "firebase/firestore";
import placeholderImages from '@/lib/placeholder-images.json';
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";


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


  const calculateDistanceAndEstimate = () => {
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
  };
  
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

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4">
      <Image 
        src={placeholderImages.busTerminal.src}
        alt={placeholderImages.busTerminal.alt}
        fill
        className="absolute inset-0 w-full h-full object-cover z-0"
        data-ai-hint={placeholderImages.busTerminal.hint}
      />
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      
      <div className="relative z-20 w-full max-w-4xl p-6 md:p-8 mx-auto bg-card/90 backdrop-blur-sm rounded-2xl shadow-2xl border">
         <h2 className="text-3xl font-bold text-center mb-2 font-display text-primary-foreground">Rent a Bus</h2>
         <p className="text-muted-foreground text-center mb-8">Fill in the details below to get an instant estimate for your group trip.</p>
        
        {isLoaded ? (
            <form onSubmit={(e) => { e.preventDefault(); calculateDistanceAndEstimate(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                
                <div className="grid gap-2 md:col-span-2">
                    <h3 className="text-lg font-semibold text-primary-foreground border-b pb-2 mb-2">Trip Details</h3>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="from">From</Label>
                  <PlacesAutocomplete 
                    onLocationSelect={(address, lat, lng) => setFromLocation({ address, lat, lng })}
                    initialValue={fromLocation.address}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="to">To</Label>
                  <PlacesAutocomplete 
                    onLocationSelect={(address, lat, lng) => setToLocation({ address, lat, lng })} 
                    initialValue={toLocation.address}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="start-date">Journey Date</Label>
                  <Input id="start-date" type="date" value={journeyDate} onChange={e => setJourneyDate(e.target.value)} required />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="return-date">Return Date</Label>
                  <Input id="return-date" type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} required />
                </div>

                 <div className="grid gap-2">
                  <Label htmlFor="passengers">Number of Passengers</Label>
                  <Input id="passengers" type="number" placeholder="e.g., 25" value={passengers} onChange={e => setPassengers(e.target.value)} required />
                </div>
                
                <div className="grid gap-2">
                    <Label htmlFor="vehicle-type">Vehicle Type</Label>
                    <Select onValueChange={setSelectedVehicle} value={selectedVehicle}>
                        <SelectTrigger id="vehicle-type">
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
                
                <div className="grid gap-2">
                  <Label htmlFor="seat-type">Seat Type (Optional)</Label>
                   <Select onValueChange={setSeatType} value={seatType}>
                    <SelectTrigger id="seat-type">
                      <SelectValue placeholder="Select seat type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General (Seater)</SelectItem>
                      <SelectItem value="Pushback">Pushback (Seater)</SelectItem>
                      <SelectItem value="Semi Sleeper">Seater cum Sleeper</SelectItem>
                      <SelectItem value="Sleeper">Sleeper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2 md:col-span-2">
                    <h3 className="text-lg font-semibold text-primary-foreground border-b pb-2 mb-2 mt-4">Your Contact Information</h3>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input id="full-name" type="text" placeholder="Enter your full name" value={fullName} onChange={e => setFullName(e.target.value)} required />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input id="mobile" type="tel" placeholder="Enter your mobile number" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} required />
                </div>

                <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="Enter your email address" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>

              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-end mt-8">
                 <Button type="submit" className="w-full sm:w-auto">Estimate Cost</Button>
                 <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={handleShare}>Share Estimate</Button>
                 <Button type="button" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setShowRequestConfirm(true)} disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Raise Request'}
                  </Button>
              </div>

          </form>
        ) : (
           <div className="text-center p-8 text-muted-foreground">
            <h3 className="font-semibold text-lg text-foreground mb-2">Google Maps Not Configured</h3>
            <p>Please add your Google Maps API key to the <code className="bg-muted text-foreground p-1 rounded-sm text-xs">.env</code> file to enable location search.</p>
            <p>Create a file named <code className="bg-muted text-foreground p-1 rounded-sm text-xs">.env</code> and add: <code className="bg-muted text-foreground p-1 rounded-sm text-xs">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY</code></p>
           </div>
        )}
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
              <AlertDialogAction onClick={() => { setIsAlertOpen(false); setError(null); }}>OK</AlertDialogAction>
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
