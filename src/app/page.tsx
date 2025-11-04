
'use client';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import PlacesAutocomplete from "@/components/places-autocomplete";

const libraries: "places"[] = ["places"];

export default function Home() {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-primary/10">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none font-inter">
              Book Your Journey with Sakpal Travels
            </h1>
            <p className="mx-auto max-w-[700px] text-foreground/80 md:text-xl">
              Reliable, Safe, and Comfortable Bus Journeys to Your Favorite Destinations.
            </p>
            <div className="w-full max-w-6xl p-6 mx-auto mt-8 bg-card rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-center text-primary-foreground mb-6">Find Your Bus</h2>
              {isLoaded ? (
                 <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
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
                   <Label htmlFor="start-date">Date of Start Journey</Label>
                   <Input id="start-date" type="date" />
                 </div>
                 <div className="grid gap-2 text-left">
                   <Label htmlFor="return-date">Date of Return Journey</Label>
                   <Input id="return-date" type="date" />
                 </div>
 
                 {/* Seating */}
                 <div className="grid gap-2 text-left">
                   <Label htmlFor="seats">No. of Seaters</Label>
                   <Select>
                     <SelectTrigger id="seats">
                       <SelectValue placeholder="Select seats" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="13">13 Seater</SelectItem>
                       <SelectItem value="15">15 Seater</SelectItem>
                       <SelectItem value="17">17 Seater</SelectItem>
                       <SelectItem value="20">20 Seater</SelectItem>
                       <SelectItem value="24">24 Seater</SelectItem>
                       <SelectItem value="30">30 Seater</SelectItem>
                       <SelectItem value="36">36 Seater</SelectItem>
                       <SelectItem value="40">40 Seater</SelectItem>
                       <SelectItem value="45">45 Seater</SelectItem>
                       <SelectItem value="49">49 Seater</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                 
                 {/* Bus Type */}
                 <div className="grid gap-2 text-left">
                   <Label htmlFor="bus-type">Type of Bus</Label>
                    <Select>
                     <SelectTrigger id="bus-type">
                       <SelectValue placeholder="Select bus type" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="ac">AC</SelectItem>
                       <SelectItem value="non-ac">Non-AC</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                 
                 {/* Seat Type */}
                  <div className="grid gap-2 text-left">
                   <Label htmlFor="seat-type">Seat Type</Label>
                    <Select>
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
 
                 <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground lg:col-start-4">Search Buses</Button>
               </form>
              ) : <div>Loading...</div>}
             
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-8 font-inter">Featured Routes</h2>
           {/* Placeholder for featured routes */}
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary/10">
        <div className="container px-4 md:px-6">
           <h2 className="text-3xl font-bold text-center mb-8 font-inter">Why Choose Us?</h2>
           {/* Placeholder for service highlights */}
        </div>
      </section>
    </div>
  );
}

