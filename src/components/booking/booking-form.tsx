"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Loader2, CalendarIcon, Clock, Bus, Users, Armchair } from "lucide-react";

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
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { LocationPicker } from "./location-picker";
import { Checkbox } from "../ui/checkbox";
import { BusList } from "./bus-list";

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
  const [showBuses, setShowBuses] = useState(false);
  const [bookingRequest, setBookingRequest] = useState<BookingRequest | null>(null);
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
    // Set default journeyDate on the client after mount to avoid hydration errors
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    form.setValue("journeyDate", today);
  }, [form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setBookingRequest(values);
    setShowBuses(true);
    setIsLoading(false);
  }

  if (showBuses && bookingRequest) {
    return <BusList request={bookingRequest} onBack={() => setShowBuses(false)} />;
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
                            if (window.google) {
                                setStartLatLng(new google.maps.LatLng(location.lat, location.lng));
                            }
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
                             if (window.google) {
                                setDestinationLatLng(new google.maps.LatLng(location.lat, location.lng));
                             }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

                <div className="grid md:grid-cols-2 gap-6 items-end">
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
                                date < new Date(new Date().setHours(0,0,0,0))
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
                        name="journeyTime"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Journey Time</FormLabel>
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
                            <SelectItem value="AC">AC</SelectItem>
                            <SelectItem value="Non-AC">Non-AC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="seatingCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seating Capacity</FormLabel>
                       <div className="relative">
                         <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="pl-10">
                              <SelectValue placeholder="Select capacity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="15">15 Seater</SelectItem>
                            <SelectItem value="30">30 Seater</SelectItem>
                            <SelectItem value="40">40 Seater</SelectItem>
                            <SelectItem value="50">50 Seater</SelectItem>
                          </SelectContent>
                        </Select>
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
                    Searching...
                  </>
                ) : (
                  <>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Find Buses
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
            <p className="text-muted-foreground mt-2">Finding available buses...</p>
        </div>
      )}
    </>
  );
}
