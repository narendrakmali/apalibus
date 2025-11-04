
'use client';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import PlacesAutocomplete from "@/components/places-autocomplete";
import Image from "next/image";
import { rateCard } from "@/lib/rate-card";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { useCurrentLocation } from "@/hooks/use-current-location";
import { useFirebase } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

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


export default function Home() {
  const [fromLocation, setFromLocation] = useState<Location>({ address: "" });
  const [toLocation, setToLocation] = useState<Location>({ address: "" });
  const [journeyDate, setJourneyDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [seats, setSeats] = useState("");
  const [busType, setBusType] = useState("");
  const [seatType, setSeatType] = useState("");

  const [estimate, setEstimate] = useState<EstimateDetails | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isConfirmationAlertOpen, setIsConfirmationAlertOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, firestore } = useFirebase();
  const router = useRouter();

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey!,
    libraries,
    language: 'en',
    skip: !googleMapsApiKey,
  });

  const { locationName } = useCurrentLocation(isLoaded);

  useEffect(() => {
    if (locationName) {
      setFromLocation({ address: locationName });
    }
  }, [locationName]);


  const calculateDistanceAndEstimate = () => {
    if (!fromLocation.lat || !fromLocation.lng || !toLocation.lat || !toLocation.lng) {
      setError("Please select valid 'From' and 'To' locations from the suggestions.");
      setIsAlertOpen(true);
      return;
    }

    if (!busType || !seats || !journeyDate || !returnDate) {
      setError("Please select Bus Type, Seats, Journey Date, and Return Date.");
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

          const rateInfo = rateCard.find(
            (rate) => rate.busType === busType && rate.seatingCapacity === parseInt(seats)
          );

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

    const subject = "Bus Trip Estimate from Sakpal Travels";
    const body = `
Hello,

Here is the estimated cost for your bus journey:

From: ${fromLocation.address}
To: ${toLocation.address}
Journey Date: ${journeyDate}
Return Date: ${returnDate}
Bus Type: ${busType}
Seats: ${seats} Seater
Seat Type: ${seatType || 'Not specified'}

Estimated Cost Breakdown:
- Single Journey Distance: ~${estimate.singleJourneyKm} km
- Return Journey Distance: ~${estimate.returnJourneyKm} km
- Base Fare (for ~${estimate.totalKm} km): ₹${estimate.baseFare.toLocaleString('en-IN')}
- Driver Allowance (for ${estimate.numDays} days): ₹${estimate.driverAllowance.toLocaleString('en-IN')}
- Permit Charges (for ${estimate.numDays} days): ₹${estimate.permitCharges.toLocaleString('en-IN')}

Total Estimated Cost: ₹${estimate.totalCost.toLocaleString('en-IN')}

Please note: This is an approximate cost. Actual cost may vary based on final details.

Thank you,
Sakpal Travels
    `;

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const handleCreateRequest = async () => {
    if (!user) {
      router.push('/user-login');
      return;
    }

    if (!estimate) {
      setError("Please calculate an estimate before creating a request.");
      setIsAlertOpen(true);
      return;
    }

    if (!firestore) {
      setError("An unexpected error occurred. Please try again.");
      setIsAlertOpen(true);
      return;
    }

    const requestData = {
      fromLocation,
      toLocation,
      journeyDate,
      returnDate,
      seats,
      busType,
      seatType,
      estimate,
      userId: user.uid,
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    const requestsCollection = collection(firestore, 'bookingRequests');
    addDocumentNonBlocking(requestsCollection, requestData);
    
    setIsConfirmationAlertOpen(true);
  };


  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="relative w-full h-[60vh] md:h-[70vh]">
        <Image
            src="https://picsum.photos/seed/yellow-bus/1800/1200"
            alt="Yellow school bus on a road"
            fill
            className="object-cover"
            data-ai-hint="yellow bus"
          />
        <div className="relative container px-4 md:px-6 h-full flex flex-col items-center justify-center text-center text-white space-y-4 bg-black/50">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none font-inter">
            Your Journey, Our Passion
          </h1>
          <p className="mx-auto max-w-[700px] text-lg md:text-xl">
            Find the perfect bus for your adventure. Safe, comfortable, and reliable.
          </p>
        </div>
      </section>

      <div id="search" className="container px-4 md:px-6 -mt-32 relative z-10">
        <div className="w-full max-w-6xl p-6 md:p-8 mx-auto bg-card rounded-2xl shadow-2xl">
          {isLoaded ? (
              <form onSubmit={(e) => { e.preventDefault(); handleCreateRequest(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end mb-6">
                  {/* From & To */}
                  <div className="grid gap-2 text-left">
                    <Label htmlFor="from">From</Label>
                    <PlacesAutocomplete 
                      onLocationSelect={(address, lat, lng) => setFromLocation({ address, lat, lng })}
                      initialValue={fromLocation.address}
                    />
                  </div>
                  <div className="grid gap-2 text-left">
                    <Label htmlFor="to">To</Label>
                    <PlacesAutocomplete onLocationSelect={(address, lat, lng) => setToLocation({ address, lat, lng })} />
                  </div>
                  
                  {/* Dates */}
                  <div className="grid gap-2 text-left">
                    <Label htmlFor="start-date">Journey Date</Label>
                    <Input id="start-date" type="date" value={journeyDate} onChange={e => setJourneyDate(e.target.value)} required />
                  </div>
                  <div className="grid gap-2 text-left">
                    <Label htmlFor="return-date">Return Date</Label>
                    <Input id="return-date" type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} required />
                  </div>

                  {/* Seating */}
                  <div className="grid gap-2 text-left">
                    <Label htmlFor="seats">Seats</Label>
                    <Select onValueChange={setSeats} value={seats}>
                      <SelectTrigger id="seats">
                        <SelectValue placeholder="Number of seats" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 Seater</SelectItem>
                        <SelectItem value="30">30 Seater</SelectItem>
                        <SelectItem value="40">40 Seater</SelectItem>
                        <SelectItem value="50">50 Seater</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Bus Type */}
                  <div className="grid gap-2 text-left">
                    <Label htmlFor="bus-type">Bus Type</Label>
                    <Select onValueChange={setBusType} value={busType}>
                      <SelectTrigger id="bus-type">
                        <SelectValue placeholder="AC / Non-AC" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AC">AC</SelectItem>
                        <SelectItem value="Non-AC">Non-AC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Seat Type */}
                  <div className="grid gap-2 text-left">
                    <Label htmlFor="seat-type">Seat Type</Label>
                     <Select onValueChange={setSeatType} value={seatType}>
                      <SelectTrigger id="seat-type">
                        <SelectValue placeholder="Select seat type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="pushback">Pushback</SelectItem>
                        <SelectItem value="semi-sleeper">Semi Sleeper</SelectItem>
                        <SelectItem value="sleeper">Sleeper</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                   <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={calculateDistanceAndEstimate}>Estimate Cost</Button>
                   <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={handleShare}>Share</Button>
                   <Button type="submit" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">Create Request</Button>
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
      </div>

       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Estimated Fare Breakdown</AlertDialogTitle>
              {estimate && (
                <AlertDialogDescription>
                  This is an approximate cost for a {estimate.numDays}-day trip. Actual cost may vary.
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
                    <span>{estimate.singleJourneyKm} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Return Journey KM</span>
                    <span>{estimate.returnJourneyKm} km</span>
                  </div>
                   <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Fare ({estimate.totalKm} km)</span>
                    <span>₹{estimate.baseFare.toLocaleString('en-IN')}</span>
                  </div>
                   <div className="flex justify-between">
                    <span className="text-muted-foreground">Driver Allowance ({estimate.numDays} days)</span>
                    <span>₹{estimate.driverAllowance.toLocaleString('en-IN')}</span>
                  </div>
                   <div className="flex justify-between">
                    <span className="text-muted-foreground">Permit Charges ({estimate.numDays} days)</span>
                    <span>₹{estimate.permitCharges.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                    <span>Total Estimate</span>
                    <span>₹{estimate.totalCost.toLocaleString('en-IN')}</span>
                  </div>
                </>
              ) : (
                 <p>Calculating estimate...</p>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setIsAlertOpen(false)}>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isConfirmationAlertOpen} onOpenChange={setIsConfirmationAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Request Submitted!</AlertDialogTitle>
              <AlertDialogDescription>
                Your booking request has been sent to the operators. You will be notified once it is reviewed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setIsConfirmationAlertOpen(false)}>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-8 font-inter">Featured Routes</h2>
           {/* Placeholder for featured routes */}
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
        <div className="container px-4 md:px-6">
           <h2 className="text-3xl font-bold text-center mb-8 font-inter">Why Choose Us?</h2>
           {/* Placeholder for service highlights */}
        </div>
      </section>
    </div>
  );
}
