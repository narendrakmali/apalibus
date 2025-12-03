
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
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import placeholderImages from '@/lib/placeholder-images.json';
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Calendar, Users, Bus, Car } from "lucide-react";


const libraries: ("places")[] = ["places"];

interface Location {
  address: string;
  lat?: number;
  lng?: number;
}


export default function SpecialOfferPage() {
  const [fromLocation, setFromLocation] = useState<Location>({ address: "" });
  const [toLocation, setToLocation] = useState<Location>({ address: "Sangli, Maharashtra, India" });
  const [journeyDate, setJourneyDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [seatType, setSeatType] = useState("");

  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("Regarding Nirankari Samagam Special Offer");


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
  
  useEffect(() => {
    // Pre-fill To location with Sangli coordinates for distance calculation
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
    if (!fromLocation.address || !toLocation.address) {
      setError("Please select valid 'From' and 'To' locations.");
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
        seats: passengers,
        busType: `${rateInfo?.vehicleType} (${rateInfo?.seatingCapacity} Seater, ${rateInfo?.busType})`,
        seatType,
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
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4">
      <Image 
        src={placeholderImages.busTerminal.src}
        alt={placeholderImages.busTerminal.alt}
        fill
        className="absolute inset-0 w-full h-full object-cover z-0"
        data-ai-hint="religious gathering"
      />
      <div className="absolute inset-0 bg-gray-900/70 z-10"></div>
      
      <div className="relative z-20 w-full max-w-4xl p-6 md:p-8 mx-auto bg-card rounded-2xl shadow-2xl">
         <div className="text-center mb-8">
            <span className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Special Offer
            </span>
            <h2 className="text-4xl font-bold text-center mt-3 font-display text-primary">Nirankari Samagam, Sangli</h2>
            <p className="text-muted-foreground mt-2">Book buses at special <span className="text-yellow-500 font-bold">discounted rates</span> for the event. Fill the form to get a quote.</p>
         </div>
        
        {isLoaded ? (
            <form onSubmit={(e) => { e.preventDefault(); validateAndSubmit(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-6">
                
                <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-foreground border-b pb-2">Trip Details</h3>
                </div>

                <div className="relative">
                  <Label htmlFor="from">From</Label>
                  <MapPin className="absolute left-3 top-9 h-5 w-5 text-muted-foreground" />
                  <PlacesAutocomplete 
                    onLocationSelect={(address, lat, lng) => setFromLocation({ address, lat, lng })}
                    initialValue={fromLocation.address}
                  />
                </div>

                <div className="relative">
                  <Label htmlFor="to">To (Destination)</Label>
                  <MapPin className="absolute left-3 top-9 h-5 w-5 text-muted-foreground" />
                  <Input id="to" value={toLocation.address} disabled className="pl-10"/>
                </div>
                
                <div className="relative">
                  <Label htmlFor="start-date">Journey Date</Label>
                  <Calendar className="absolute left-3 top-9 h-5 w-5 text-muted-foreground" />
                  <Input id="start-date" type="date" value={journeyDate} onChange={e => setJourneyDate(e.target.value)} required className="pl-10" />
                </div>
                
                <div className="relative">
                  <Label htmlFor="return-date">Return Date</Label>
                  <Calendar className="absolute left-3 top-9 h-5 w-5 text-muted-foreground" />
                  <Input id="return-date" type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} required className="pl-10" />
                </div>

                 <div className="relative">
                  <Label htmlFor="passengers">Number of Passengers</Label>
                  <Users className="absolute left-3 top-9 h-5 w-5 text-muted-foreground" />
                  <Input id="passengers" type="number" placeholder="e.g., 25" value={passengers} onChange={e => setPassengers(e.target.value)} required className="pl-10" />
                </div>
                
                <div className="relative">
                    <Label htmlFor="vehicle-type">Vehicle Type</Label>
                    <Car className="absolute left-3 top-9 h-5 w-5 text-muted-foreground" />
                    <Select onValueChange={setSelectedVehicle} value={selectedVehicle}>
                        <SelectTrigger id="vehicle-type" className="pl-10">
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
                
                <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-foreground border-b pb-2 mt-4">Your Contact Information</h3>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input id="full-name" type="text" placeholder="Enter your full name" value={fullName} onChange={e => setFullName(e.target.value)} required />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input id="mobile" type="tel" placeholder="Enter your mobile number" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} required />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="Enter your email address" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                
                <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea id="notes" placeholder="Any additional details" value={notes} onChange={e => setNotes(e.target.value)} />
                </div>

              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-end mt-8">
                 <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white text-base py-6" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Request a Quote'}
                  </Button>
              </div>

          </form>
        ) : (
           <div className="text-center p-8 text-muted-foreground">
            <p>Loading location services...</p>
           </div>
        )}
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
                        This will submit your request for the Nirankari Samagam special offer. Our team will review it and contact you with a final quote. Are you sure you want to proceed?
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

    