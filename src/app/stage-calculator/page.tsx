
'use client';
import { useState, useEffect } from 'react';
import { loadDepots, type Depot } from '@/lib/stageCalculator';
import { Combobox } from '@/components/ui/combobox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';
import axios from 'axios';

interface FareResult {
  origin: string;
  destination: string;
  stages: number;
  details: string;
  fares: {
    ordinary: number;
    express: number;
    shivneri: number;
  };
}

export default function StageCalculator() {
  const [originDepot, setOriginDepot] = useState('');
  const [destinationDepot, setDestinationDepot] = useState('');
  
  const [result, setResult] = useState<FareResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const [depots, setDepots] = useState<Depot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDepots().then(data => {
        setDepots(data);
        setLoading(false);
    });
  }, []);

  const handleCalculateFare = async () => {
    if (!originDepot || !destinationDepot) {
        alert("Please select both origin and destination depots.");
        return;
    }
    setIsCalculating(true);
    setError(null);
    setResult(null);

    try {
        const response = await axios.get('/api/calculate-fare', {
            params: { originDepot, destinationDepot }
        });
        setResult(response.data);
    } catch (err: any) {
        setError(err.response?.data?.error || "Failed to calculate fare.");
    } finally {
        setIsCalculating(false);
    }
  };

  const depotOptions = depots.map(d => ({ value: d.name, label: d.name }));

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-8 justify-center">
            <Card className="w-full max-w-lg mx-auto">
                <CardHeader className="text-center">
                    <CardTitle>MSRTC Fare Estimator</CardTitle>
                    <CardDescription>Estimate individual fares between depots based on MSRTC stages.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                            <div className="space-y-2">
                                <Label>Origin Depot</Label>
                                {loading ? <Skeleton className="h-10 w-full" /> : 
                                <Combobox
                                    options={depotOptions}
                                    value={originDepot}
                                    onChange={setOriginDepot}
                                    placeholder="Select origin..."
                                    searchPlaceholder="Search origin..."
                                    notFoundText="No depot found."
                                />}
                            </div>
                             <div className="space-y-2">
                                <Label>Destination Depot</Label>
                                {loading ? <Skeleton className="h-10 w-full" /> : 
                                <Combobox
                                    options={depotOptions}
                                    value={destinationDepot}
                                    onChange={setDestinationDepot}
                                    placeholder="Select destination..."
                                    searchPlaceholder="Search destination..."
                                    notFoundText="No depot found."
                                />}
                            </div>
                        </div>
                        
                        <Button onClick={handleCalculateFare} className="w-full" disabled={loading || isCalculating || !originDepot || !destinationDepot}>
                            {isCalculating ? "Calculating..." : "Calculate Estimated Fare"}
                        </Button>

                        {error && <p className="text-sm text-center text-destructive">{error}</p>}

                        {result && (
                            <div className="mt-4 p-4 bg-secondary/50 border rounded-lg space-y-3">
                                <h3 className="font-semibold text-center text-lg mb-2">
                                    Fare Estimate: <span className="font-normal">{result.origin}</span> to <span className="font-normal">{result.destination}</span>
                                </h3>
                                
                                <div className="flex justify-between font-mono text-sm">
                                    <span>{result.details}</span>
                                    <span>{result.stages} Stages</span>
                                </div>
                                <div className="border-t my-2 pt-2 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Ordinary Bus</span>
                                        <span className="font-medium">₹ {result.fares.ordinary.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Express / Asiad</span>
                                        <span className="font-medium">₹ {result.fares.express.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Shivneri (AC)</span>
                                        <span className="font-medium">₹ {result.fares.shivneri.toLocaleString()}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground pt-2 text-center">
                                    Fares are per person estimates. For group hire, please use the MSRTC Booking request form.
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
