'use client';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import PlacesAutocomplete from "@/components/places-autocomplete";
import Image from "next/image";
import { rateCard } from "@/lib/rate-card";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from "@/components/ui/alert-dialog";


const libraries: "places"[] = ["places"];

interface EstimateDetails {
  totalCost: number;
  baseFare: number;
  driverAllowance: number;
  permitCharges: number;
  numDays: number;
  minKm: number;
}


export default function Home() {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [journeyDate, setJourneyDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [seats, setSeats] = useState("");
  const [busType, setBusType] = useState("");
  const [seatType, setSeatType] = useState("");

  const [estimate, setEstimate] = useState<EstimateDetails | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);


  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
    language: 'en'
  });

  const handleEstimateCost = () => {
    if (!busType || !seats || !journeyDate || !returnDate) {
      alert("Please select Bus Type, Seats, Journey Date, and Return Date to get an estimate.");
      return;
    }

    const rateInfo = rateCard.find(
      (rate) => rate.busType === busType && rate.seatingCapacity === parseInt(seats)
    );

    if (!rateInfo) {
      alert("No rate information found for the selected bus configuration.");
      return;
    }

    const startDate = new Date(journeyDate);
    const endDate = new Date(returnDate);
    
    if(startDate > endDate) {
      alert("Return date must be after the journey date.");
      return;
    }

    // Calculate number of days. Add 1 to include both start and end dates.
    const numDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
    
    const minKm = rateInfo.minKmPerDay * numDays;
    const baseFare = minKm * rateInfo.ratePerKm;
    const totalDriverAllowance = numDays * rateInfo.driverAllowance;
    const totalPermitCharges = numDays * rateInfo.permitCharges;

    const totalCost = baseFare + totalDriverAllowance + totalPermitCharges;

    setEstimate({
      totalCost,
      baseFare,
      driverAllowance: totalDriverAllowance,
      permitCharges: totalPermitCharges,
      numDays,
      minKm,
    });
    setIsAlertOpen(true);
  };


  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="relative w-full h-[60vh] md:h-[70vh]">
        <Image
            src="https://picsum.photos/seed/1/1800/1200"
            alt="Scenic bus journey"
            fill
            className="object-cover"
            data-ai-hint="bus journey landscape"
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
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end mb-6">
                  {/* From & To */}
                  <div className="grid gap-2 text-left">
                    <Label htmlFor="from">From</Label>
                    <PlacesAutocomplete onLocationSelect={(address) => setFromLocation(address)} />
                  </div>
                  <div className="grid gap-2 text-left">
                    <Label htmlFor="to">To</Label>
                    <PlacesAutocomplete onLocationSelect={(address) => setToLocation(address)} />
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
                   <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                      <AlertDialogTrigger asChild>
                        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={handleEstimateCost}>Estimate Cost</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Estimated Fare Breakdown</AlertDialogTitle>
                           <AlertDialogDescription>
                            This is an approximate cost for a {estimate?.numDays}-day trip. Actual cost may vary.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4 space-y-2">
                          {estimate !== null ? (
                            <>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Base Fare ({estimate.minKm} km)</span>
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
                             <p>Could not calculate estimate. Please check your selections.</p>
                          )}
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogAction>OK</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                   <Button type="button" variant="outline" className="w-full sm:w-auto">Share</Button>
                   <Button type="submit" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">Search Buses</Button>
                </div>

            </form>
          ) : <div className="text-center p-8">Loading Search Tools...</div>}
        </div>
      </div>
      
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
