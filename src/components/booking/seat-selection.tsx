
'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, PersonStanding } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

interface Seat {
  id: string;
  number: string;
  isBooked: boolean;
  type: 'lower' | 'upper';
  isLadySeat: boolean;
  isSeniorSeat: boolean;
}

const pickupPoints = [
  "Borivali E - Axis Bank Nr. National Park",
  "Kandivali E - Samta Nagar Police Chowki",
  "Malad E - Omkar Building Altamontegate Shantaram Talav Busstop",
  "Goregaon East",
  "Jogwari E - Lal Building",
  "Airport",
  "Hanuman Road Bus Stop Andheri E - End Of Fly Over",
  "Santacruz - Vakola Signal",
  "Bandra",
  "Sion",
  "Chembur E - Opp Yogi Restaurant",
  "Mankhurd - Shivaji Nagar",
  "Vashi",
  "Sanpada - Sanpada Signal",
  "Nerul",
  "Belapur - CBD Belapur",
  "Kharghar",
  "Kamothe",
  "Amboli - Kalamboli Opp Mcdonald Restaurant"
];


const Seat = ({ seat, onSelect, isSelected }: { seat: Seat, onSelect: (id: string) => void, isSelected: boolean }) => {
    
    const getSeatClass = () => {
        if (seat.isBooked) return 'bg-gray-300 text-gray-500 cursor-not-allowed';
        if (isSelected) return 'bg-primary text-primary-foreground';
        if (seat.isLadySeat) return 'bg-pink-200 border-pink-400';
        if (seat.isSeniorSeat) return 'bg-orange-200 border-orange-400';
        return 'bg-gray-100 hover:bg-gray-200';
    }

    const getIcon = () => {
        if (seat.isLadySeat) return <User className="h-4 w-4" />;
        if (seat.isSeniorSeat) return <PersonStanding className="h-4 w-4" />;
        return null;
    }

    return (
        <button
            onClick={() => onSelect(seat.id)}
            disabled={seat.isBooked}
            className={`w-16 h-10 rounded-md border-2 flex items-center justify-center transition-colors ${getSeatClass()}`}
        >
            <div className="flex items-center gap-1">
                {getIcon()}
                <span>{seat.number}</span>
            </div>
        </button>
    )
}

export default function SeatSelection({ route, journeyDate, onBack, initialSeats }: { route: any, journeyDate: string, onBack: () => void, initialSeats: Seat[] }) {
  const [seats, setSeats] = useState<Seat[]>(initialSeats);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();


  const handleSelectSeat = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat || seat.isBooked) return;

    setSelectedSeats(prev => 
        prev.includes(seatId) 
            ? prev.filter(id => id !== seatId) 
            : [...prev, seatId]
    );
  }

  const totalFare = selectedSeats.length * route.baseFare;

  const handleConfirmBooking = async () => {
    setIsProcessing(true);
    // Step 1: Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    const paymentSuccess = true; // Assume payment is always successful for now

    if (paymentSuccess) {
        // Step 2: Finalize booking if payment is successful
        await finalizeBooking();
    } else {
        // Handle payment failure (e.g., show an error message)
        console.error("Payment failed.");
        setIsProcessing(false);
    }
  };

  const finalizeBooking = async () => {
    console.log("Finalizing booking...");
    const bookingId = `SPL${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // In a real app, you would perform Firestore writes here:
    // 1. Create a new document in the 'bookings' collection with all details.
    console.log("Creating booking document:", {
        id: bookingId,
        busId: route.operator, // Using operator as a stand-in for busId
        date: journeyDate,
        seats: selectedSeats,
        fare: totalFare,
        pickupPoint: selectedPickupPoint,
        // passengerInfo, etc.
    });

    // 2. Update the 'buses' document to mark seats as booked.
    console.log(`Updating seat status for bus ${route.operator}`);
    
    // Redirect to confirmation page
    router.push(`/booking-confirmation/${bookingId}?fare=${totalFare}&seats=${selectedSeats.join(',')}&route=${route.from}-${route.to}&date=${journeyDate}&time=${route.departureTime}`);
  };


  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Button variant="outline" size="sm" onClick={onBack} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Routes
      </Button>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Select Your Seats</CardTitle>
          <CardDescription>
            For {route.from} to {route.to} on {new Date(journeyDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Seat Layout */}
                <div className="flex-1 p-4 border rounded-lg bg-muted/20">
                    <div className="mb-6">
                        <h3 className="font-semibold mb-2 text-center">Lower Deck</h3>
                        <div className="grid grid-cols-5 gap-2">
                            {seats.filter(s => s.type === 'lower').map(seat => (
                                <Seat key={seat.id} seat={seat} onSelect={handleSelectSeat} isSelected={selectedSeats.includes(seat.id)} />
                            ))}
                        </div>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2 text-center">Upper Deck</h3>
                        <div className="grid grid-cols-5 gap-2">
                            {seats.filter(s => s.type === 'upper').map(seat => (
                                <Seat key={seat.id} seat={seat} onSelect={handleSelectSeat} isSelected={selectedSeats.includes(seat.id)} />
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-6 text-sm justify-center">
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border bg-gray-100"></div> Available</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border bg-gray-300"></div> Booked</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border bg-primary"></div> Selected</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border bg-pink-200"></div> Lady Seat</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border bg-orange-200"></div> Sr. Citizen</div>
                    </div>
                </div>

                {/* Booking Summary */}
                <div className="w-full lg:w-80">
                    <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="pickup-point">Pickup Point</Label>
                            <Select onValueChange={setSelectedPickupPoint} value={selectedPickupPoint}>
                                <SelectTrigger id="pickup-point" className="w-full">
                                    <SelectValue placeholder="Select a pickup point" />
                                </SelectTrigger>
                                <SelectContent>
                                    {pickupPoints.map(point => (
                                        <SelectItem key={point} value={point}>{point}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <p className="font-medium">Selected Seats:</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                            {selectedSeats.length > 0 ? selectedSeats.map(id => (
                                <Badge key={id} variant="secondary">{id}</Badge>
                            )) : <p className="text-sm text-muted-foreground">None</p>}
                            </div>
                        </div>
                        <div>
                            <p className="font-medium">Total Fare:</p>
                             <p className="text-2xl font-bold">&#8377;{totalFare.toLocaleString('en-IN')}</p>
                        </div>
                       
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button className="w-full" disabled={selectedSeats.length === 0 || !selectedPickupPoint || isProcessing}>
                                    {isProcessing ? 'Processing...' : 'Proceed to Book'}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Booking</AlertDialogTitle>
                                <AlertDialogDescription>
                                    You are about to book {selectedSeats.length} seat(s) for a total of &#8377;{totalFare.toLocaleString('en-IN')}. Your pickup point is {selectedPickupPoint}. Do you want to continue?
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleConfirmBooking} disabled={isProcessing}>
                                    {isProcessing ? 'Processing...' : 'Confirm'}
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                    </div>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
