'use client';
import { useState, useEffect } from 'react';
import { loadDepots, calculateStage, type Depot } from '@/lib/stageCalculator';
import { Combobox } from '@/components/ui/combobox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function StageCalculator() {
  const [origin, setOrigin] = useState('');
  const [dest, setDest] = useState('');
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
      const res = calculateStage(o, d);
      // Simplified fare calculation, as per MSRTC, the first few stages have different rates.
      // Using an average for demonstration.
      const baseRate = 10;
      let fare = res.stages * baseRate;

      // Night service charges
      const isNight = new Date().getHours() >= 22 || new Date().getHours() < 5;
      if (isNight) fare *= 1.18; // 18% extra for night service

      setResult({ ...res, fare: Math.ceil(fare) });
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
              <CardDescription>Select an origin and destination to calculate the approximate stages and fare for an ordinary bus.</CardDescription>
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
                <Button onClick={handleCalc} className="w-full" disabled={loading || !origin || !dest}>
                    {loading ? "Loading Depots..." : "Calculate Stage & Fare"}
                </Button>
                {result && (
                    <div className="mt-4 p-4 bg-secondary/50 border rounded-lg space-y-2">
                    <h3 className="font-semibold text-center">Calculation Result</h3>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Approx. Distance:</span>
                        <span className="font-bold">~{result.distance} km</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Calculated Stages:</span>
                        <span className="font-bold">{result.stages}</span>
                    </div>
                    <div className="flex justify-between text-lg">
                        <span className="text-muted-foreground">Estimated Fare (Ordinary):</span>
                        <span className="font-bold">₹{result.fare}</span>
                    </div>
                     <p className="text-xs text-muted-foreground pt-2 text-center">Fare is an estimate for a single adult on an ordinary bus and may include night charges if applicable. Final fare may vary.</p>
                    </div>
                )}
            </div>
          </CardContent>
      </Card>
    </div>
  );
}
