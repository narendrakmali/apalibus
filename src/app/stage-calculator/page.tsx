
'use client';
import { useState, useEffect } from 'react';
import { loadDepots, calculateStage, type Depot } from '@/lib/stageCalculator';
import { Combobox } from '@/components/ui/combobox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

// Source: Provided MSRTC Fare Chart Data
const ordinaryFareChart: { [key: number]: number } = { 1: 11, 2: 21, 3: 31, 4: 41, 5: 51, 6: 61, 7: 71, 8: 81, 9: 91, 10: 102, 11: 112, 12: 122, 13: 132, 14: 142, 15: 152, 16: 162, 17: 172, 18: 182, 19: 192, 20: 202, 21: 212, 22: 222, 23: 232, 24: 242, 25: 252, 26: 262, 27: 272, 28: 282, 29: 292, 30: 303, 31: 313, 32: 323, 33: 333, 34: 343, 35: 353, 36: 363, 37: 373, 38: 383, 39: 393, 40: 403, 41: 413, 42: 423, 43: 433, 44: 443, 45: 453, 46: 463, 47: 473, 48: 483, 49: 493, 50: 504, 51: 514, 52: 524, 53: 534, 54: 544, 55: 554, 56: 564, 57: 574, 58: 584, 59: 594, 60: 604, 61: 614, 62: 624, 63: 634, 64: 644, 65: 654, 66: 664, 67: 674, 68: 684, 69: 694, 70: 705, 71: 715, 72: 725, 73: 735, 74: 745, 75: 755, 76: 765, 77: 775, 78: 785, 79: 795, 80: 805, 81: 815, 82: 825, 83: 835, 84: 845, 85: 855, 86: 865, 87: 875, 88: 885, 89: 895, 90: 906, 91: 916, 92: 926, 93: 936, 94: 946, 95: 956, 96: 966, 97: 976, 98: 986, 99: 996, 100: 1006 };
const semiComfortFareChart: { [key: number]: number } = { 1: 15, 2: 28, 3: 42, 4: 55, 5: 69, 6: 82, 7: 96, 8: 109, 9: 123, 10: 137, 100: 1366 };
const sleeperFareChart: { [key: number]: number } = { 1: 16, 2: 31, 3: 46, 4: 61, 5: 76, 6: 91, 7: 106, 8: 121, 9: 136, 10: 151, 100: 1476 };
const shivshahiFareChart: { [key: number]: number } = { 1: 16, 2: 31, 3: 47, 4: 62, 5: 78, 6: 93, 7: 109, 8: 124, 9: 140, 10: 155, 100: 1488 };
const janShivneriFareChart: { [key: number]: number } = { 1: 17, 2: 32, 3: 48, 4: 63, 5: 79, 6: 94, 7: 110, 8: 125, 9: 141, 10: 157, 67: 1046 };

const fareCharts = {
    'Ordinary': { chart: ordinaryFareChart, halfRate: 0.5, seniorRate: 0.5 },
    'Semi-Comfort': { chart: semiComfortFareChart, halfRate: 0.5, seniorRate: 1 }, // No senior concession listed
    'Sleeper': { chart: sleeperFareChart, halfRate: 0.5, seniorRate: 1 }, // No senior concession listed
    'Shivshahi': { chart: shivshahiFareChart, halfRate: 0.5, seniorRate: 0.52 }, // महिला/जे.ना is slightly more than half
    'JanShivneri': { chart: janShivneriFareChart, halfRate: 0.5, seniorRate: 0.53 }, // महिला/जे.ना is slightly more than half
}

export default function StageCalculator() {
  const [origin, setOrigin] = useState('');
  const [dest, setDest] = useState('');
  const [busType, setBusType] = useState('Ordinary');
  const [numFullPassengers, setNumFullPassengers] = useState(1);
  const [numHalfPassengers, setNumHalfPassengers] = useState(0);
  const [numSeniorPassengers, setNumSeniorPassengers] = useState(0);

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
      
      const selectedChart = fareCharts[busType as keyof typeof fareCharts];
      let farePerFullTicket = selectedChart.chart[stages] || stages * (10 + (busType === 'Ordinary' ? 0 : 4)); // Fallback

      const reservationChargePerPerson = 5;

      const farePerHalfTicket = farePerFullTicket * selectedChart.halfRate;
      const farePerSeniorTicket = farePerFullTicket * selectedChart.seniorRate;
      
      const totalFullFare = numFullPassengers * farePerFullTicket;
      const totalHalfFare = numHalfPassengers * farePerHalfTicket;
      const totalSeniorFare = numSeniorPassengers * farePerSeniorTicket;

      const totalPassengers = numFullPassengers + numHalfPassengers + numSeniorPassengers;
      const totalReservationCharges = totalPassengers * reservationChargePerPerson;

      const totalFare = totalFullFare + totalHalfFare + totalSeniorFare + totalReservationCharges;

      setResult({ 
          stages, 
          distance,
          farePerFullTicket: Math.ceil(farePerFullTicket),
          farePerHalfTicket: Math.ceil(farePerHalfTicket),
          farePerSeniorTicket: Math.ceil(farePerSeniorTicket),
          totalFullFare: Math.ceil(totalFullFare),
          totalHalfFare: Math.ceil(totalHalfFare),
          totalSeniorFare: Math.ceil(totalSeniorFare),
          totalReservationCharges,
          totalFare: Math.ceil(totalFare),
          busType: busType,
      });
    } else {
        alert("Please select a valid origin and destination depot.");
    }
  };
  
  const depotOptions = depots.map(d => ({ value: d.name.toLowerCase(), label: d.name}));
  
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-8 justify-center">
            <Card className="w-full max-w-lg mx-auto">
                <CardHeader>
                    <CardTitle>MSRTC Stage & Fare Calculator</CardTitle>
                    <CardDescription>Select trip details to calculate the approximate stages and fare based on official charts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Origin Depot</Label>
                            {loading ? <Skeleton className="h-10 w-full" /> : 
                            <Combobox
                                options={depotOptions}
                                value={origin}
                                onChange={setOrigin}
                                placeholder="Select origin..."
                                searchPlaceholder="Search depot..."
                                notFoundText="No depot found."
                            />}
                        </div>
                        <div className="space-y-2">
                            <Label>Destination Depot</Label>
                            {loading ? <Skeleton className="h-10 w-full" /> : 
                            <Combobox
                                options={depotOptions}
                                value={dest}
                                onChange={setDest}
                                placeholder="Select destination..."
                                searchPlaceholder="Search depot..."
                                notFoundText="No depot found."
                            />}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bus-type">Bus Type</Label>
                            <Select onValueChange={setBusType} value={busType}>
                                <SelectTrigger id="bus-type"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Ordinary">Ordinary / Fast</SelectItem>
                                    <SelectItem value="Semi-Comfort">Semi-Comfort / Sleeper (Seater)</SelectItem>
                                    <SelectItem value="Sleeper">Ordinary Sleeper</SelectItem>
                                    <SelectItem value="Shivshahi">Shivshahi (AC Seater)</SelectItem>
                                    <SelectItem value="JanShivneri">JanShivneri (AC Seater)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="full-passengers">Full Tickets</Label>
                                <Input id="full-passengers" type="number" min="0" value={numFullPassengers} onChange={(e) => setNumFullPassengers(Math.max(0, parseInt(e.target.value) || 0))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="half-passengers">Half Tickets</Label>
                                <Input id="half-passengers" type="number" min="0" value={numHalfPassengers} onChange={(e) => setNumHalfPassengers(Math.max(0, parseInt(e.target.value) || 0))} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="senior-passengers">Senior/Women</Label>
                                <Input id="senior-passengers" type="number" min="0" value={numSeniorPassengers} onChange={(e) => setNumSeniorPassengers(Math.max(0, parseInt(e.target.value) || 0))} />
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
                                    {numFullPassengers > 0 && <div className="flex justify-between">
                                        <span className="text-muted-foreground">{numFullPassengers} x Full Ticket</span>
                                        <span className="font-medium">₹{result.totalFullFare.toLocaleString()}</span>
                                    </div>}
                                    {numHalfPassengers > 0 && <div className="flex justify-between">
                                        <span className="text-muted-foreground">{numHalfPassengers} x Half Ticket</span>
                                        <span className="font-medium">₹{result.totalHalfFare.toLocaleString()}</span>
                                    </div>}
                                    {numSeniorPassengers > 0 && <div className="flex justify-between">
                                        <span className="text-muted-foreground">{numSeniorPassengers} x Senior/Woman</span>
                                        <span className="font-medium">₹{result.totalSeniorFare.toLocaleString()}</span>
                                    </div>}
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Reservation Charges</span>
                                        <span className="font-medium">₹{result.totalReservationCharges.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between text-xl font-bold border-t pt-2 mt-2">
                                    <span>Total Estimated Fare:</span>
                                    <span>₹{result.totalFare.toLocaleString()}</span>
                                </div>
                            <p className="text-xs text-muted-foreground pt-2 text-center">Fare is an estimate. Final fare may vary.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

