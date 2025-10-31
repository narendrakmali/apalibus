
"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Loader2, Milestone, CalendarIcon, Clock, Bus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { getFareEstimate } from "@/app/actions";
import type { EstimateFareOutput } from "@/ai/flows/estimate-fare";
import { useToast } from "@/hooks/use-toast";
import { BookingResult } from "./booking-result";
import { cn } from "@/lib/utils";
import { LocationPicker } from "./location-picker";

const formSchema = z.object({
  startLocation: z.string().min(2, "Please enter a valid starting location."),
  destination: z.string().min(2, "Please enter a valid destination."),
  journeyDate: z.date({
    required_error: "A date of travel is required.",
  }),
  numberOfSeats: z.coerce.number().min(1, "Please enter at least 1 seat.").max(10, "You can book a maximum of 10 seats."),
  distanceKm: z.coerce.number().min(1, "Distance must be at least 1 km."),
  busType: z.enum(["Standard", "Luxury"]),
  timeOfTravel: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "Please enter a valid 24-hour time (e.g., 18:30)."
    ),
});

export function BookingForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<EstimateFareOutput | null>(null);
  const { toast } = useToast();
  const [startLatLng, setStartLatLng] = useState<google.maps.LatLng | null>(null);
  const [destinationLatLng, setDestinationLatLng] = useState<google.maps.LatLng | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startLocation: "",
      destination: "",
      journeyDate: new Date(),
      numberOfSeats: 1,
      distanceKm: 0,
      busType: "Standard",
      timeOfTravel: "19:00",
    },
  });

  useEffect(() => {
    if (startLatLng && destinationLatLng && window.google) {
      const distanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(startLatLng, destinationLatLng);
      const distanceInKm = Math.round((distanceInMeters / 1000) / 10) * 10;
      form.setValue("distanceKm", distanceInKm > 0 ? distanceInKm : 10);
    }
  }, [startLatLng, destinationLatLng, form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    if (values.distanceKm <= 0) {
        toast({
            variant: "destructive",
            title: "Invalid Distance",
            description: "Please select a valid start and destination.",
        });
        setIsLoading(false);
        return;
    }
    try {
      // The AI model doesn't use all the fields, so we just pass what it needs.
      const estimationResult = await getFareEstimate({
          startLocation: values.startLocation,
          destination: values.destination,
          distanceKm: values.distanceKm,
          busType: values.busType,
          timeOfTravel: values.timeOfTravel,
      });
      setResult(estimationResult);
    } catch (error) {
      console.error("Fare estimation failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get fare estimate. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardContent className="p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Location</FormLabel>
                      <FormControl>
                        <LocationPicker
                          label="Start Location"
                          onLocationSelect={(location, address) => {
                            field.onChange(address);
                            setStartLatLng(new google.maps.LatLng(location.lat, location.lng));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination</FormLabel>
                      <FormControl>
                        <LocationPicker
                          label="Destination"
                          onLocationSelect={(location, address) => {
                            field.onChange(address);
                            setDestinationLatLng(new google.maps.LatLng(location.lat, location.lng));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="journeyDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Journey Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
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
                                date < new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                     <FormField
                        control={form.control}
                        name="numberOfSeats"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Number of Seats</FormLabel>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <FormControl>
                                <Input type="number" placeholder="e.g., 2" {...field} className="pl-10" />
                                </FormControl>
                            </div>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>


              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="busType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bus Type</FormLabel>
                       <div className="relative">
                         <Bus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="pl-10">
                              <SelectValue placeholder="Select a bus type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Standard">Standard</SelectItem>
                            <SelectItem value="Luxury">Luxury</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeOfTravel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time of Travel</FormLabel>
                       <div className="relative">
                         <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input type="time" {...field} className="pl-10" />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full md:w-auto" size="lg">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Estimating...
                  </>
                ) : (
                  <>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Estimate Fare & Book
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      {isLoading && (
        <div className="text-center mt-8">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground mt-2">Finding the best fares for you...</p>
        </div>
      )}
      {result && <BookingResult result={result} distance={form.getValues("distanceKm")} />}
    </>
  );
}
