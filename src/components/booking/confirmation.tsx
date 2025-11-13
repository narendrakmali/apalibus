
'use client';
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Share2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import placeholderImages from '@/lib/placeholder-images.json';

export default function BookingConfirmation({ bookingId }: { bookingId: string }) {
    const searchParams = useSearchParams();
    const fare = searchParams.get('fare');
    const seats = searchParams.get('seats');
    const route = searchParams.get('route');
    const date = searchParams.get('date');
    const time = searchParams.get('time');

    const whatsappText = encodeURIComponent(`My Sakpal Travels booking is confirmed! Booking ID: ${bookingId}, Route: ${route}, Date: ${date}, Seats: ${seats}.`);

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-secondary/30 py-12 px-4">
             <Image
                src={placeholderImages.busInterior.src}
                alt={placeholderImages.busInterior.alt}
                width={1920}
                height={1080}
                className="absolute inset-0 w-full h-full object-cover z-0 opacity-20"
                data-ai-hint={placeholderImages.busInterior.hint}
            />
            <Card className="w-full max-w-lg shadow-xl z-10">
                <CardHeader className="text-center items-center">
                    <div className="bg-green-100 rounded-full p-3 w-fit mb-2">
                         <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-display">Booking Confirmed!</CardTitle>
                    <CardDescription>Thank you for booking with Sakpal Travels.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center border-b pb-4">
                        <p className="text-sm text-muted-foreground">Your Booking ID</p>
                        <p className="font-mono text-lg bg-muted p-2 rounded-md inline-block mt-1">#{bookingId}</p>
                    </div>

                    <div className="border rounded-lg p-4 space-y-3 bg-background/50">
                        <h3 className="font-semibold text-center mb-3">Journey Details</h3>
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-muted-foreground">Route:</span>
                            <span className="font-semibold">{route}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-muted-foreground">Date:</span>
                            <span className="font-semibold">{date ? new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric'}) : ''} at {time}</span>
                        </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-muted-foreground">Selected Seats:</span>
                            <div className="flex flex-wrap gap-1 justify-end">
                                {seats?.split(',').map(seat => <Badge key={seat} variant="outline">{seat}</Badge>)}
                            </div>
                        </div>
                         <div className="flex justify-between items-center text-lg border-t pt-3 mt-3">
                            <span className="font-bold">Total Fare:</span>
                            <span className="font-bold">{parseInt(fare || '0').toLocaleString('en-IN')}</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button className="w-full">
                            <Download className="mr-2 h-4 w-4" />
                            Download Ticket
                        </Button>
                        <Button variant="secondary" className="w-full" asChild>
                            <Link href={`https://wa.me/?text=${whatsappText}`} target="_blank">
                                <Share2 className="mr-2 h-4 w-4" />
                                Share on WhatsApp
                            </Link>
                        </Button>
                    </div>
                     <div className="text-center pt-4">
                         <Button asChild variant="link">
                            <Link href="/explore-routes">Book Another Ticket</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
