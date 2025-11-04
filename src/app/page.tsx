
'use client';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import PlacesAutocomplete from "@/components/places-autocomplete";
import Image from "next/image";

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

      <div className="container px-4 md:px-6 -mt-32 relative z-10">
        <div className="w-full max-w-6xl p-6 md:p-8 mx-auto bg-card rounded-2xl shadow-2xl">
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
                <Label htmlFor="start-date">Journey Date</Label>
                <Input id="start-date" type="date" />
              </div>
              <div className="grid gap-2 text-left">
                <Label htmlFor="return-date">Return Date (Optional)</Label>
                <Input id="return-date" type="date" />
              </div>

              {/* Seating */}
              <div className="grid gap-2 text-left">
                <Label htmlFor="seats">Seats</Label>
                <Select>
                  <SelectTrigger id="seats">
                    <SelectValue placeholder="Number of seats" />
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
                <Label htmlFor="bus-type">Bus Type</Label>
                 <Select>
                  <SelectTrigger id="bus-type">
                    <SelectValue placeholder="AC / Non-AC" />
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
