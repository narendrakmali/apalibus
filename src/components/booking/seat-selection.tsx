
'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, PersonStanding } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Seat {
  id: string;
  number: string;
  isBooked: boolean;
  type: 'lower' | 'upper';
  isLadySeat: boolean;
  isSeniorSeat: boolean;
}

// Generate a 30-seat sleeper layout
const generateSeats = (): Seat[] => {
  const seats: Seat[] = [];
  // Lower Deck: 15 seats
  for (let i = 1; i <= 15; i++) {
    seats.push({ id: `L${i}`, number: `L${i}`, isBooked: Math.random() > 0.8, type: 'lower', isLadySeat: false, isSeniorSeat: false });
  }
  // Upper Deck: 15 seats
  for (let i = 1; i <= 15; i++) {
    seats.push({ id: `U${i}`, number: `U${i}`, isBooked: Math.random() > 0.7, type: 'upper', isLadySeat: false, isSeniorSeat: false });
  }
  // Pre-assign some special seats for demonstration
  const ladySeat = seats.find(s => s.id === 'L5');
  if(ladySeat) ladySeat.isLadySeat = true;

  const seniorSeat = seats.find(s => s.id === 'L2');
  if(seniorSeat) seniorSeat.isSeniorSeat = true;

  return seats;
};


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

export default function SeatSelection({ route, journeyDate, onBack }: { route: any, journeyDate: string, onBack: () => void }) {
  const [seats, setSeats] = useState<Seat[]>(generateSeats());
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

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
                <div className="w-full lg:w-64">
                    <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
                    <div className="space-y-4">
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
                             <p className="text-2xl font-bold">₹{totalFare.toLocaleString('en-IN')}</p>
                        </div>
                       
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button className="w-full" disabled={selectedSeats.length === 0}>
                                    Proceed to Book
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Booking</AlertDialogTitle>
                                <AlertDialogDescription>
                                    You are about to book {selectedSeats.length} seat(s) for a total of ₹{totalFare.toLocaleString('en-IN')}. Do you want to continue?
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction>Confirm</AlertDialogAction>
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
