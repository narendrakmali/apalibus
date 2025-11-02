
"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Loader2, CalendarIcon, Clock, Bus, Users, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { LocationPicker } from "./location-picker";
import { BusList } from "./bus-list";
import { getFareEstimate } from "@/app/actions";
import { BookingResult } from "./booking-result";

const formSchema = z.object({
  startLocation: z.string().min(2, "Please enter a valid starting location."),
  destination: z.string().min(2, "Please enter a valid destination."),
  journeyDate: z.date({
    required_error: "A date of travel is required.",
  }),
  journeyTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Please enter a valid 24-hour time (e.g., 18:30)."),
  busType: z.enum(["AC", "Non-AC"]),
  seatingCapacity: z.enum(["15", "30", "40", "50"]),
}).refine(data => {
    return true;
});

export type BookingRequest = z.infer<typeof formSchema>;

export function BookingForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [bookingRequest, setBookingRequest] = useState<BookingRequest | null>(null);
  const [fareResult, setFareResult] = useState<{ fareBreakdown: string, estimatedFare: number } | null>(null);

  const { toast } = useToast();
  const [startLatLng, setStartLatLng] = useState<google.maps.LatLng | null>(null);
  const [destinationLatLng, setDestinationLatLng] = useState<google.maps.LatLng | null>(null);
  

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startLocation: "",
      destination: "",
      journeyTime: "19:00",
      busType: "AC",
      seatingCapacity: "40",
    },
  });

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    form.setValue("journeyDate", today);
  }, [form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!startLatLng || !destinationLatLng) {
        toast({
            variant: "destructive",
            title: "Location Error",
            description: "Please select both a start and destination from the suggestions."
        });
        return;
    }
    
    setIsLoading(true);

    try {
        const distanceMeters = google.maps.geometry.spherical.computeDistanceBetween(startLatLng, destinationLatLng);
        const distanceKm = distanceMeters / 1000;

        const fareInput = {
            ...values,
            distanceKm,
            timeOfTravel: values.journeyTime
        };

        const result = await getFareEstimate(fareInput);
        setFareResult(result);
        setBookingRequest(values);
        setShowResult(true);

    } catch(error: any) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Estimation Failed",
            description: error.message || "Could not fetch fare estimate."
        });
    } finally {
        setIsLoading(false);
    }
  }

  if (showResult && bookingRequest && fareResult) {
    return <BookingResult request={bookingRequest} result={fareResult} onBack={() => setShowResult(false)} />;
  }

  return (
    <>
      <Card className="max-w-5xl mx-auto shadow-2xl">
        <CardContent className="p-4 md:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-10 gap-4 items-end">
              <div className="md:col-span-3">
                <FormField
                  control={form.control}
                  name="startLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-foreground">From</FormLabel>
                      <FormControl>
                        <LocationPicker
                          label="Start Location"
                          onLocationSelect={(location, address) => {
                            field.onChange(address);
                            if (window.google) {
                                setStartLatLng(new google.maps.LatLng(location.lat, location.lng));
                            }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-3">
                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-foreground">To</FormLabel>
                      <FormControl>
                        <LocationPicker
                          label="Destination"
                          onLocationSelect={(location, address) => {
                            field.onChange(address);
                             if (window.google) {
                                setDestinationLatLng(new google.maps.LatLng(location.lat, location.lng));
                             }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-2">
                <FormField
                control={form.control}
                name="journeyDate"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="font-semibold text-foreground">Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal bg-secondary",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP")
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                            date < new Date(new Date().setHours(0,0,0,0))
                            }
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    </FormItem>
                )}
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90" size="lg">
                    {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    <Search className="mr-2 h-4 w-4" />
                    )}
                    Search Buses
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      {isLoading && (
        <div className="text-center mt-8">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground mt-2">Finding available buses...</p>
        </div>
      )}
    </>
  );
}
