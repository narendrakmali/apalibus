
'use client';
import { useState, useEffect } from 'react';
import { loadDepots, type Depot } from '@/lib/stageCalculator';
import { Combobox } from '@/components/ui/combobox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { rateCard } from '@/lib/rate-card';
import * as turf from '@turf/turf';

interface FareResult {
    totalKM: string;
    baseFare: number;
    gst: number;
    driverCharges: number;
    finalAmount: number;
}

export default function HireCalculator() {
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupDistance, setPickupDistance] = useState('');
  const [nearestDepot, setNearestDepot] = useState('');
  const [selectedBus, setSelectedBus] = useState('');
  const [daysOfHalt, setDaysOfHalt] = useState('1');

  const [result, setResult] = useState<FareResult | null>(null);
  const [depots, setDepots] = useState<Depot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDepots().then(data => {
        setDepots(data);
        setLoading(false);
    });
  }, []);

  const calculateMSRTCFare = () => {
    const depot = depots.find(d => d.name.toLowerCase() === nearestDepot);
    if (!depot || !pickupDistance || !selectedBus) {
        alert("Please fill all the required fields.");
        return;
    }
    
    // Hardcoded Sangli Location
    const sangliCoords = { lat: 16.8524, lon: 74.5815 }; 
    const pickupDistanceFromDepot = parseFloat(pickupDistance);

    // Using Turf.js to get distance from depot to Sangli, then adjusting for pickup point
    const depotToSangliDist = turf.distance([depot.lon, depot.lat], [sangliCoords.lon, sangliCoords.lat]);
    const sangliDistance = depotToSangliDist - pickupDistanceFromDepot; // Approximate pickup to sangli

    const busTypeRate = rateCard[parseInt(selectedBus, 10)].ratePerKm;

    const deadMileage = pickupDistanceFromDepot * 2;
    const journeyMileage = sangliDistance * 2;
    const totalKM = deadMileage + journeyMileage;
    const baseFare = totalKM * busTypeRate;
    const gstAmount = baseFare * 0.05;
    const driverCharges = parseInt(daysOfHalt) * 500;
    const totalCost = baseFare + gstAmount + driverCharges;

    setResult({
        totalKM: totalKM.toFixed(2),
        baseFare: Math.round(baseFare),
        gst: Math.round(gstAmount),
        driverCharges: Math.round(driverCharges),
        finalAmount: Math.round(totalCost)
    });
  };

  const depotOptions = depots.map(d => ({ value: d.name.toLowerCase(), label: d.name }));
  const busOptions = rateCard
    .filter(bus => ['Non-AC', 'AC'].includes(bus.busType)) // Filter for MSRTC-like buses
    .map((bus, index) => ({
      value: index.toString(),
      label: `${bus.vehicleType} - ${bus.seatingCapacity} Seater (${bus.busType}) @ ₹${bus.ratePerKm}/km`,
    }));

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-8 justify-center">
            <Card className="w-full max-w-lg mx-auto">
                <CardHeader>
                    <CardTitle>MSRTC Hire Fare Calculator</CardTitle>
                    <CardDescription>Estimate the cost of hiring an MSRTC bus using the "Garage-to-Garage" billing logic.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Your Pickup Location (e.g. Branch)</Label>
                             <Input id="pickup-location" type="text" placeholder="e.g. Chembur, Mumbai" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label>Nearest MSRTC Depot</Label>
                            {loading ? <Skeleton className="h-10 w-full" /> : 
                            <Combobox
                                options={depotOptions}
                                value={nearestDepot}
                                onChange={setNearestDepot}
                                placeholder="Select nearest depot..."
                                searchPlaceholder="Search depot..."
                                notFoundText="No depot found."
                            />}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                                <Label htmlFor="depot-distance">Depot to Pickup (KM)</Label>
                                <Input id="depot-distance" type="number" placeholder="e.g. 5" value={pickupDistance} onChange={(e) => setPickupDistance(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="days-halt">Days of Halt at Sangli</Label>
                                <Input id="days-halt" type="number" min="0" placeholder="e.g. 3" value={daysOfHalt} onChange={(e) => setDaysOfHalt(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bus-type">Select Bus Type</Label>
                            <Select onValueChange={setSelectedBus} value={selectedBus}>
                                <SelectTrigger id="bus-type"><SelectValue placeholder="Select a bus type..." /></SelectTrigger>
                                <SelectContent>
                                    {busOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <Button onClick={calculateMSRTCFare} className="w-full" disabled={loading || !nearestDepot || !pickupDistance || !selectedBus}>
                            {loading ? "Loading Depots..." : "Calculate Estimated Fare"}
                        </Button>

                        {result && (
                            <div className="mt-4 p-4 bg-secondary/50 border rounded-lg space-y-3">
                                <h3 className="font-semibold text-center text-lg mb-2">Fare Estimate</h3>
                                
                                <div className="flex justify-between font-mono text-sm">
                                    <span>Total Billable Distance:</span>
                                    <span>~{result.totalKM} km</span>
                                </div>
                                <div className="border-t my-2 pt-2 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Base Fare</span>
                                        <span className="font-medium">₹ {result.baseFare.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">GST (5%)</span>
                                        <span className="font-medium">₹ {result.gst.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Driver Halt Charges</span>
                                        <span className="font-medium">₹ {result.driverCharges.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between text-xl font-bold border-t pt-2 mt-2">
                                    <span>Total Estimated Cost:</span>
                                    <span>₹ {result.finalAmount.toLocaleString()}</span>
                                </div>
                                <p className="text-xs text-muted-foreground pt-2 text-center">
                                    This fare is an estimate based on the "Garage-to-Garage" principle. Final fare may vary.
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
