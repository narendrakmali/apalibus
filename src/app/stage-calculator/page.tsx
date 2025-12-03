
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
const ordinaryFareChart: { [key: number]: { full: number; half: number; senior: number; disabled: number; } } = {
  1: { full: 11, half: 6, senior: 6, disabled: 4 },
  1.5: { full: 16, half: 9, senior: 9, disabled: 5 },
  2: { full: 21, half: 11, senior: 11, disabled: 6 },
  3: { full: 31, half: 16, senior: 16, disabled: 9 },
  100: { full: 1006, half: 504, senior: 504, disabled: 252 },
};

const semiComfortFareChart: { [key: number]: { full: number; half: number; senior: number; disabled: number; } } = {
  1: { full: 15, half: 8, senior: 8, disabled: 4 },
  1.5: { full: 21, half: 11, senior: 11, disabled: 6 },
  2: { full: 28, half: 15, senior: 15, disabled: 8 },
  100: { full: 1366, half: 684, senior: 684, disabled: 342 },
};

const sleeperFareChart: { [key: number]: { full: number; half: number; senior: number; disabled: number; } } = {
  1: { full: 16, half: 8, senior: 8, disabled: 5 },
  1.5: { full: 23, half: 12, senior: 12, disabled: 7 },
  2: { full: 31, half: 16, senior: 16, disabled: 8 },
  100: { full: 1476, half: 739, senior: 739, disabled: 370 },
};

const shivshahiFareChart: { [key: number]: { full: number; half: number; senior: number; disabled: number; } } = {
  1: { full: 16, half: 8, senior: 9, disabled: 6 },
  1.5: { full: 23, half: 12, senior: 13, disabled: 8 },
  2: { full: 31, half: 16, senior: 17, disabled: 11 },
  100: { full: 1488, half: 745, senior: 778, disabled: 494 },
};

const janShivneriFareChart: { [key: number]: { full: number; half: number; senior: number; disabled: number; } } = {
  1: { full: 17, half: 9, senior: 9, disabled: 0 }, // Disabled fare not specified, assuming 0
  1.5: { full: 24, half: 13, senior: 13, disabled: 0 },
  2: { full: 32, half: 17, senior: 17, disabled: 0 },
  67: { full: 1046, half: 524, senior: 539, disabled: 0 },
};


const fareCharts = {
    'Ordinary': ordinaryFareChart,
    'Semi-Comfort': semiComfortFareChart,
    'Sleeper': sleeperFareChart,
    'Shivshahi': shivshahiFareChart,
    'JanShivneri': janShivneriFareChart,
};

export default function StageCalculator() {
  const [origin, setOrigin] = useState('');
  const [dest, setDest] = useState('');
  const [busType, setBusType] = useState('Ordinary');
  const [numFullPassengers, setNumFullPassengers] = useState(1);
  const [numHalfPassengers, setNumHalfPassengers] = useState(0);
  const [numSeniorPassengers, setNumSeniorPassengers] = useState(0);
  const [numDisabledPassengers, setNumDisabledPassengers] = useState(0);

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
      let stageRates = selectedChart[stages];

      if (!stageRates) {
        // Fallback for stages not explicitly in the chart
        const baseRatePerKm = { 'Ordinary': 10.05, 'Semi-Comfort': 13.65, 'Sleeper': 14.75, 'Shivshahi': 14.20, 'JanShivneri': 14.90 }[busType];
        const estimatedFullFare = Math.ceil(stages * (baseRatePerKm || 10));
        stageRates = {
            full: estimatedFullFare,
            half: Math.ceil(estimatedFullFare * 0.5),
            senior: Math.ceil(estimatedFullFare * 0.5),
            disabled: Math.ceil(estimatedFullFare * 0.25),
        }
      }

      const reservationChargePerPerson = 5;

      const totalFullFare = numFullPassengers * stageRates.full;
      const totalHalfFare = numHalfPassengers * stageRates.half;
      const totalSeniorFare = numSeniorPassengers * stageRates.senior;
      const totalDisabledFare = numDisabledPassengers * stageRates.disabled;

      const totalPassengers = numFullPassengers + numHalfPassengers + numSeniorPassengers + numDisabledPassengers;
      const totalReservationCharges = totalPassengers * reservationChargePerPerson;

      const totalFare = totalFullFare + totalHalfFare + totalSeniorFare + totalDisabledFare + totalReservationCharges;

      setResult({ 
          stages, 
          distance,
          totalFullFare: Math.ceil(totalFullFare),
          totalHalfFare: Math.ceil(totalHalfFare),
          totalSeniorFare: Math.ceil(totalSeniorFare),
          totalDisabledFare: Math.ceil(totalDisabledFare),
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
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                            <div className="space-y-2">
                                <Label htmlFor="disabled-passengers">Divyang</Label>
                                <Input id="disabled-passengers" type="number" min="0" value={numDisabledPassengers} onChange={(e) => setNumDisabledPassengers(Math.max(0, parseInt(e.target.value) || 0))} />
                            </div>
                        </div>
                         <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                            <p className="text-xs text-yellow-800 font-semibold">
                                For concessional fare, Aadhaar card is mandatory for Females &amp; Sr. Citizens, and a valid certificate is required for Divyang passengers.
                            </p>
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
                                        <span className="font-medium">{result.totalFullFare.toLocaleString()}</span>
                                    </div>}
                                    {numHalfPassengers > 0 && <div className="flex justify-between">
                                        <span className="text-muted-foreground">{numHalfPassengers} x Half Ticket</span>
                                        <span className="font-medium">{result.totalHalfFare.toLocaleString()}</span>
                                    </div>}
                                    {numSeniorPassengers > 0 && <div className="flex justify-between">
                                        <span className="text-muted-foreground">{numSeniorPassengers} x Senior/Woman</span>
                                        <span className="font-medium">{result.totalSeniorFare.toLocaleString()}</span>
                                    </div>}
                                    {numDisabledPassengers > 0 && <div className="flex justify-between">
                                        <span className="text-muted-foreground">{numDisabledPassengers} x Divyang</span>
                                        <span className="font-medium">{result.totalDisabledFare.toLocaleString()}</span>
                                    </div>}
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Reservation Charges</span>
                                        <span className="font-medium">{result.totalReservationCharges.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between text-xl font-bold border-t pt-2 mt-2">
                                    <span>Total Estimated Fare:</span>
                                    <span>{result.totalFare.toLocaleString()}</span>
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
