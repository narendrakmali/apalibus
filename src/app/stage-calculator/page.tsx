
'use client';
import { useState, useEffect } from 'react';
import { loadDepots, calculateStage, type Depot } from '@/lib/stageCalculator';
import { Combobox } from '@/components/ui/combobox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
      
      let baseRatePerStage = 10;
      switch (busType) {
        case 'Express':
          baseRatePerStage = 15;
          break;
        case 'Shivneri':
          baseRatePerStage = 50;
          break;
        default: // Ordinary
          baseRatePerStage = 10;
      }

      const reservationChargePerPerson = 5;

      let farePerFullTicket = stages * baseRatePerStage;

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

  return (
    <div className="container mx-auto py-12 px-4 md:px-6 flex justify-center">
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
                            <SelectItem value="Ordinary">Ordinary</SelectItem>
                            <SelectItem value="Express">Express (Asiad/Hirkani)</SelectItem>
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
    </div>
  );
}
