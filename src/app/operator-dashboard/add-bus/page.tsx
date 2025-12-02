'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth, useFirestore } from '@/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { collection, doc, setDoc } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AddBusPage() {
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [seatingCapacity, setSeatingCapacity] = useState('');
  const [busType, setBusType] = useState('');
  const [seatType, setSeatType] = useState('');
  
  const [driverName, setDriverName] = useState('');
  const [driverLanguages, setDriverLanguages] = useState('');
  const [driverContact, setDriverContact] = useState('');
  const [driverId, setDriverId] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const auth = useAuth();
  const firestore = useFirestore();
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  if (!loading && !user) {
    router.push('/operator-login');
    return null;
  }

  const handleAddBus = async () => {
    setError(null);
    setSuccess(null);

    if (!user) {
        setError("You must be logged in to add a bus.");
        return;
    }

    if (!registrationNumber || !seatingCapacity || !busType || !seatType || !driverName || !driverContact || !driverId || !driverLanguages) {
      setError('Please fill out all fields.');
      return;
    }
    
    setIsLoading(true);

    const busesCollectionRef = collection(firestore, `busOperators/${user.uid}/buses`);
    const newBusRef = doc(busesCollectionRef);
    const busData = {
      id: newBusRef.id,
      operatorId: user.uid,
      registrationNumber: registrationNumber,
      seatingCapacity: parseInt(seatingCapacity, 10),
      busType: busType,
      seatType: seatType,
      driver: {
        name: driverName,
        languages: driverLanguages,
        contactNumber: driverContact,
        idNumber: driverId,
      },
      availableDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], // Default to all days
      interiorImageUrl: '',
      exteriorImageUrl: '',
    };

    setDoc(newBusRef, busData)
      .then(() => {
        setSuccess(`Bus ${registrationNumber} added successfully! You will be redirected shortly.`);
        setTimeout(() => router.push('/operator-dashboard/fleet'), 2000);
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: newBusRef.path,
          operation: 'create',
          requestResourceData: busData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };


  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-2xl">
        <div className="mb-8">
            <Button asChild variant="outline" size="sm" className="mb-4">
                <Link href="/operator-dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
            <h1 className="text-3xl font-bold font-display text-primary">Add a New Bus</h1>
            <p className="text-muted-foreground">Fill in the details below to register a new vehicle to your fleet.</p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            
            <fieldset className="space-y-4 p-4 border rounded-lg">
                <legend className="text-lg font-semibold px-2">Bus Details</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="reg-number">Registration Number</Label>
                        <Input id="reg-number" placeholder="e.g., MH04AB1234" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="capacity">Seating Capacity</Label>
                        <Input id="capacity" type="number" placeholder="e.g., 30" value={seatingCapacity} onChange={(e) => setSeatingCapacity(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bus-type">Bus Type</Label>
                        <Select onValueChange={setBusType} value={busType}>
                            <SelectTrigger id="bus-type"><SelectValue placeholder="Select AC / Non-AC" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="AC">AC</SelectItem>
                                <SelectItem value="Non-AC">Non-AC</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="seat-type">Seat Type</Label>
                        <Select onValueChange={setSeatType} value={seatType}>
                            <SelectTrigger id="seat-type"><SelectValue placeholder="Select seat type" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="General">General (Seater)</SelectItem>
                                <SelectItem value="Pushback">Pushback (Seater)</SelectItem>
                                <SelectItem value="Semi Sleeper">Seater cum Sleeper</SelectItem>
                                <SelectItem value="Sleeper">Sleeper</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </fieldset>

             <fieldset className="space-y-4 p-4 border rounded-lg">
                <legend className="text-lg font-semibold px-2">Driver Details</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="driver-name">Driver's Name</Label>
                        <Input id="driver-name" placeholder="Enter driver's full name" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="driver-contact">Driver's Contact</Label>
                        <Input id="driver-contact" type="tel" placeholder="Enter mobile number" value={driverContact} onChange={(e) => setDriverContact(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="driver-languages">Languages Spoken</Label>
                        <Input id="driver-languages" placeholder="e.g., Marathi, Hindi" value={driverLanguages} onChange={(e) => setDriverLanguages(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="driver-id">Driver ID Number</Label>
                        <Input id="driver-id" placeholder="e.g., License or Aadhaar" value={driverId} onChange={(e) => setDriverId(e.target.value)} />
                    </div>
                </div>
            </fieldset>
            
            {error && <p className="text-center text-sm text-destructive">{error}</p>}
            {success && <p className="text-center text-sm text-green-600">{success}</p>}

            <Button onClick={handleAddBus} disabled={isLoading} className="w-full">
              {isLoading ? 'Saving Bus...' : 'Add Bus to Fleet'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
