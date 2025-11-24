
'use client';
import { useState, useEffect } from 'react';
import { loadDepots, calculateStage, type Depot } from '@/lib/stageCalculator';
import { Combobox } from '@/components/ui/combobox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';

// Fare chart data extracted from the provided MSRTC image
const fareChart: { [key: number]: number } = {
    1: 11, 2: 21, 3: 31, 4: 41, 5: 51, 6: 61, 7: 71, 8: 81, 9: 91, 10: 102,
    11: 112, 12: 122, 13: 132, 14: 142, 15: 152, 16: 162, 17: 172, 18: 182, 19: 192, 20: 202,
    21: 212, 22: 222, 23: 232, 24: 242, 25: 252, 26: 262, 27: 272, 28: 282, 29: 292, 30: 303,
    31: 313, 32: 323, 33: 333, 34: 343, 35: 353, 36: 363, 37: 373, 38: 383, 39: 393, 40: 403,
    41: 413, 42: 423, 43: 433, 44: 443, 45: 453, 46: 463, 47: 473, 48: 483, 49: 493, 50: 504,
    51: 514, 52: 524, 53: 534, 54: 544, 55: 554, 56: 564, 57: 574, 58: 584, 59: 594, 60: 604,
    61: 614, 62: 624, 63: 634, 64: 644, 65: 654, 66: 664, 67: 674, 68: 684, 69: 694, 70: 705,
    71: 715, 72: 725, 73: 735, 74: 745, 75: 755, 76: 765, 77: 775, 78: 785, 79: 795, 80: 805,
    81: 815, 82: 825, 83: 835, 84: 845, 85: 855, 86: 865, 87: 875, 88: 885, 89: 895, 90: 906,
    91: 916, 92: 926, 93: 936, 94: 946, 95: 956, 96: 966, 97: 976, 98: 986, 99: 996, 100: 1006,
};


export default function StageCalculator() {
  const [origin, setOrigin] = useState('');
  const [dest, setDest] = useState('');
  const [busType, setBusType] = useState('Ordinary');
  const [numFullPassengers, setNumFullPassengers] = useState(1);
  const [numConcessionPassengers, setNumConcessionPassengers] = useState(0);

  const [result, setResult] = useState<any>(null);
  const [depots, setDepots] = useState<Depot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDepots().then(data => {
        setDepots(data);
        setLoading(false);
    });
  }, []);

  const handleCalc = async () => {
    const o = depots.find((d) => d.name.toLowerCase() === origin);
    const d = depots.find((d) => d.name.toLowerCase() === dest);
    if (o && d) {
      const { stages, distance } = calculateStage(o, d);
      
      let farePerFullTicket = fareChart[stages] || stages * 10; // Fallback to formula if stage not in chart

      // Adjust for different bus types
      switch (busType) {
        case 'Express':
          farePerFullTicket *= 1.5; // Approx. 50% more than ordinary
          break;
        case 'Shivneri':
          farePerFullTicket *= 2.5; // Approx. 2.5x more than ordinary
          break;
        default: // Ordinary
          // No change needed for ordinary
      }
      
      const reservationChargePerPerson = 5;

      // Night service charges
      const isNight = new Date().getHours() >= 22 || new Date().getHours() < 5;
      if (isNight) {
        farePerFullTicket *= 1.18; // 18% extra for night service
      }
      
      const farePerConcessionTicket = farePerFullTicket * 0.5;

      const totalFullFare = numFullPassengers * farePerFullTicket;
      const totalConcessionFare = numConcessionPassengers * farePerConcessionTicket;
      const totalPassengers = numFullPassengers + numConcessionPassengers;
      const totalReservationCharges = totalPassengers * reservationChargePerPerson;

      const totalFare = totalFullFare + totalConcessionFare + totalReservationCharges;

      setResult({ 
          stages, 
          distance,
          farePerFullTicket: Math.ceil(farePerFullTicket),
          farePerConcessionTicket: Math.ceil(farePerConcessionTicket),
          totalFullFare: Math.ceil(totalFullFare),
          totalConcessionFare: Math.ceil(totalConcessionFare),
          totalReservationCharges,
          totalFare: Math.ceil(totalFare),
          busType: busType,
      });
    } else {
        alert("Please select a valid origin and destination depot.");
    }
  };
  
  const depotOptions = depots.map(d => ({ value: d.name.toLowerCase(), label: d.name}));
  
  const fareChartImages = [
      { id: 1, src: "https://picsum.photos/seed/fare1/400/600", alt: "MSRTC Fare Chart 1" },
      { id: 2, src: "https://picsum.photos/seed/fare2/400/600", alt: "MSRTC Fare Chart 2" },
      { id: 3, src: "https://picsum.photos/seed/fare3/400/600", alt: "MSRTC Fare Chart 3" },
      { id: 4, src: "https://picsum.photos/seed/fare4/400/600", alt: "MSRTC Fare Chart 4" },
      { id: 5, src: "https://picsum.photos/seed/fare5/400/600", alt: "MSRTC Fare Chart 5" },
  ];

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-8 justify-center">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>MSRTC Stage & Fare Calculator</CardTitle>
                    <CardDescription>Select an origin and destination to calculate the approximate stages and fare.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Origin Depot</Label>
                            <Combobox
                                options={depotOptions}
                                value={origin}
                                onChange={setOrigin}
                                placeholder="Select origin..."
                                searchPlaceholder="Search depot..."
                                notFoundText="No depot found."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Destination Depot</Label>
                            <Combobox
                                options={depotOptions}
                                value={dest}
                                onChange={setDest}
                                placeholder="Select destination..."
                                searchPlaceholder="Search depot..."
                                notFoundText="No depot found."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bus-type">Bus Type</Label>
                            <Select onValueChange={setBusType} value={busType}>
                                <SelectTrigger id="bus-type"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Ordinary">Ordinary / Express</SelectItem>
                                    <SelectItem value="Shivneri">Shivneri (AC)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="full-passengers">Passengers (Full Ticket)</Label>
                                <Input id="full-passengers" type="number" min="0" value={numFullPassengers} onChange={(e) => setNumFullPassengers(Math.max(0, parseInt(e.target.value) || 0))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="concession-passengers">Passengers (50% Concession)</Label>
                                <Input id="concession-passengers" type="number" min="0" value={numConcessionPassengers} onChange={(e) => setNumConcessionPassengers(Math.max(0, parseInt(e.target.value) || 0))} />
                            </div>
                        </div>
                        <Button onClick={handleCalc} className="w-full" disabled={loading || !origin || !dest}>
                            {loading ? "Loading Depots..." : "Calculate Stage & Fare"}
                        </Button>
                        {result && (
                            <div className="mt-4 p-4 bg-secondary/50 border rounded-lg space-y-3">
                                <h3 className="font-semibold text-center text-lg mb-2">Fare Estimate for {result.busType} Bus</h3>
                                
                                <div className="flex justify-between font-mono text-sm">
                                    <span>Approx. Distance:</span>
                                    <span>~{result.distance} km</span>
                                </div>
                                <div className="flex justify-between font-mono text-sm">
                                    <span>Calculated Stages:</span>
                                    <span>{result.stages}</span>
                                </div>

                                <div className="border-t my-2 pt-2 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{numFullPassengers} x Full Ticket Fare</span>
                                        <span className="font-medium">₹{result.totalFullFare.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{numConcessionPassengers} x Concession Fare (50%)</span>
                                        <span className="font-medium">₹{result.totalConcessionFare.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Reservation Charges</span>
                                        <span className="font-medium">₹{result.totalReservationCharges.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between text-xl font-bold border-t pt-2 mt-2">
                                    <span>Total Estimated Fare:</span>
                                    <span>₹{result.totalFare.toLocaleString()}</span>
                                </div>
                            <p className="text-xs text-muted-foreground pt-2 text-center">Fare is an estimate and may include night charges if applicable. Final fare may vary.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
            
            <div className="w-full lg:max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Official MSRTC Fare Charts</CardTitle>
                        <CardDescription>Reference images for fare calculation.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {fareChartImages.map(image => (
                            <div key={image.id} className="relative aspect-[2/3] w-full overflow-hidden rounded-lg shadow-md">
                                <Image 
                                    src={image.src}
                                    alt={image.alt}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
