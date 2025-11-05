
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AddBusPage() {
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [seatingCapacity, setSeatingCapacity] = useState('');
  const [busType, setBusType] = useState('');
  const [seatType, setSeatType] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverLanguages, setDriverLanguages] = useState('');
  const [driverContact, setDriverContact] = useState('');
  const [driverId, setDriverId] = useState('');
  const [exteriorImageUrl, setExteriorImageUrl] = useState('');
  const [interiorImageUrl, setInteriorImageUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { firestore, user } = useFirebase();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!user) {
      setError('You must be logged in to add a bus.');
      router.push('/operator-login');
      return;
    }

    try {
      const newBusRef = doc(collection(firestore, `busOperators/${user.uid}/buses`));

      const busData = {
        id: newBusRef.id,
        operatorId: user.uid,
        registrationNumber,
        seatingCapacity: parseInt(seatingCapacity, 10),
        busType,
        seatType,
        driver: {
          name: driverName,
          languages: driverLanguages,
          contactNumber: driverContact,
          idNumber: driverId,
        },
        exteriorImageUrl,
        interiorImageUrl,
      };
      
      addDocumentNonBlocking(collection(firestore, `busOperators/${user.uid}/buses`), busData);

      setSuccess('Bus added successfully! Redirecting...');
      setTimeout(() => {
        // TODO: Redirect to operator dashboard or fleet management page
        router.push('/');
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-12">
      <Card className="mx-auto max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Add a New Bus</CardTitle>
          <CardDescription>
            Fill in the details below to add a new bus to your fleet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="registration-number">Registration Number</Label>
                <Input
                  id="registration-number"
                  placeholder="MH-01-AB-1234"
                  required
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="seating-capacity">No. of Seats</Label>
                <Input
                  id="seating-capacity"
                  type="number"
                  placeholder="45"
                  required
                  value={seatingCapacity}
                  onChange={(e) => setSeatingCapacity(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bus-type">Bus Type</Label>
                <Select onValueChange={setBusType} value={busType}>
                  <SelectTrigger id="bus-type">
                    <SelectValue placeholder="Select bus type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AC">AC</SelectItem>
                    <SelectItem value="Non-AC">Non-AC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="seat-type">Seat Type</Label>
                <Select onValueChange={setSeatType} value={seatType}>
                  <SelectTrigger id="seat-type">
                    <SelectValue placeholder="Select seat type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Pushback">Pushback</SelectItem>
                    <SelectItem value="Semi Sleeper">Semi Sleeper</SelectItem>
                    <SelectItem value="Sleeper">Sleeper</SelectItem>
                  </SelectContent>
                </Select>
              </div>

               <div className="col-span-1 md:col-span-2">
                <h4 className="text-lg font-semibold mt-4 border-b pb-2">Bus Images</h4>
              </div>

               <div className="grid gap-2">
                <Label htmlFor="exterior-image-url">Exterior Image URL</Label>
                <Input
                  id="exterior-image-url"
                  placeholder="https://example.com/exterior.jpg"
                  value={exteriorImageUrl}
                  onChange={(e) => setExteriorImageUrl(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="interior-image-url">Interior Image URL</Label>
                <Input
                  id="interior-image-url"
                  placeholder="https://example.com/interior.jpg"
                  value={interiorImageUrl}
                  onChange={(e) => setInteriorImageUrl(e.target.value)}
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <h4 className="text-lg font-semibold mt-4 border-b pb-2">Driver Details</h4>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="driver-name">Driver Name</Label>
                <Input
                  id="driver-name"
                  placeholder="John Doe"
                  required
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="driver-languages">Languages Spoken</Label>
                <Input
                  id="driver-languages"
                  placeholder="English, Hindi, Marathi"
                  required
                  value={driverLanguages}
                  onChange={(e) => setDriverLanguages(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="driver-contact">Driver Contact Number</Label>
                <Input
                  id="driver-contact"
                  placeholder="9876543210"
                  required
                  value={driverContact}
                  onChange={(e) => setDriverContact(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="driver-id">Driver ID Number</Label>
                <Input
                  id="driver-id"
                  placeholder="ID12345"
                  required
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                />
              </div>

              <div className="col-span-1 md:col-span-2 mt-4">
                 {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                 {success && <p className="text-green-500 text-sm mb-4">{success}</p>}
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
                  Add Bus
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

    