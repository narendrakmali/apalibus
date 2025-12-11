
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, UserPlus, Upload, Download } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { loadGoogleMaps } from '@/lib/google-maps-loader';
import { useCurrentLocation } from '@/hooks/use-current-location';
import { useAuth, useFirestore } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import PlacesAutocomplete from '@/components/places-autocomplete';

interface Passenger {
  name: string;
  age: number | string;
  gender: 'Male' | 'Female' | 'Other' | '';
  idProof: File | null;
}

interface Location {
  address: string;
  lat?: number;
  lng?: number;
}


export default function MsrtcBookingPage() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [branch, setBranch] = useState('');
  const [zone, setZone] = useState('');
  
  const [travelDate, setTravelDate] = useState<Date>();
  const [origin, setOrigin] = useState<Location>({ address: "" });
  const [destination, setToLocation] = useState<Location>({ address: "Sangli Samagam" });
  const [busType, setBusType] = useState('');
  const [purpose, setPurpose] = useState('');
  
  const [passengers, setPassengers] = useState<Passenger[]>([
    { name: '', age: '', gender: '', idProof: null },
  ]);

  const [uploadMode, setUploadMode] = useState<'manual' | 'file'>('manual');
  const [passengerFile, setPassengerFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isMapsLoaded, setIsMapsLoaded] = useState(false);


  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();


  const [numGents, setNumGents] = useState(0);
  const [numLadies, setNumLadies] = useState(0);
  const [numSrCitizen, setNumSrCitizen] = useState(0);
  const [numAmritCitizen, setNumAmritCitizen] = useState(0);
  const [numChildren, setNumChildren] = useState(0);
  const totalPassengers = numGents + numLadies + numSrCitizen + numAmritCitizen + numChildren;

  useEffect(() => {
    loadGoogleMaps()
      .then(() => setIsMapsLoaded(true))
      .catch((err) => console.error("Failed to load Google Maps", err));
  }, []);

  const { locationName, coords } = useCurrentLocation(isMapsLoaded);

  useEffect(() => {
    if (locationName && coords) {
      setOrigin({ address: locationName, lat: coords.lat, lng: coords.lng });
    }
  }, [locationName, coords]);

  const handleAddPassenger = () => {
    setPassengers([...passengers, { name: '', age: '', gender: '', idProof: null }]);
  };

  const handleRemovePassenger = (index: number) => {
    const newPassengers = passengers.filter((_, i) => i !== index);
    setPassengers(newPassengers);
  };

  const handlePassengerChange = (index: number, field: keyof Passenger, value: any) => {
    const newPassengers = [...passengers];
    if (field === 'idProof') {
      newPassengers[index][field] = value.target.files ? value.target.files[0] : null;
    } else {
        newPassengers[index][field] = value;
    }
    setPassengers(newPassengers);
  };

  const generateAlphanumericId = (length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `MSRTC-${result}`;
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!origin.address || !destination.address || !busType || !travelDate || totalPassengers <= 0) {
        setError("Please fill out all required travel details and add at least one passenger.");
        return;
    }
    if (!branch || !zone || !mobileNumber || !email) {
        setError("Please provide all coordinator details: Branch, Zone, Mobile, and Email.");
        return;
    }

    setIsSubmitting(true);
    
    try {
        let user = auth.currentUser;
        if (!user) {
            const userCredential = await signInAnonymously(auth);
            user = userCredential.user;
        }
        
        if (!user) {
            throw new Error("Could not create an anonymous user session.");
        }

        const bookingId = generateAlphanumericId(8);
        const docRef = doc(firestore, "msrtcBookings", bookingId);

        const serializablePassengers = passengers.map(p => ({
            name: p.name,
            age: p.age,
            gender: p.gender,
        }));

        const bookingData = {
            id: bookingId,
            userId: user.uid, // Anonymous user ID
            organizerName: `${branch} / ${zone}`, // Combined field
            contactNumber: mobileNumber,
            email,
            travelDate,
            origin: origin.address,
            destination: destination.address,
            busType,
            purpose,
            numPassengers: totalPassengers,
            numGents,
            numLadies,
            numSrCitizen,
            numAmritCitizen,
            numChildren,
            passengers: uploadMode === 'manual' ? serializablePassengers : [],
            status: "pending",
            createdAt: serverTimestamp(),
        };

        setDoc(docRef, bookingData)
          .then(() => {
            setShowSuccessDialog(true);
          })
          .catch((serverError) => {
            const permissionError = new FirestorePermissionError({
              path: docRef.path,
              operation: 'create',
              requestResourceData: bookingData,
            });
            errorEmitter.emit('permission-error', permissionError);
          });
        
    } catch (err: any) {
        setError(`Failed to submit request: ${err.message}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = ["Name", "Age", "Gender", "Aadhaar Number (for concession)"];
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "passenger_list_template.csv");
    document.body.appendChild(link);
    
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4">
      <Card className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg border border-slate-200">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-slate-800">MSRTC-Bus-Request</CardTitle>
          <CardDescription className="text-slate-500 mt-2">Fill out the form below to request a group booking with concessions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <fieldset className="space-y-6 p-6 border rounded-xl">
              <legend className="text-xl font-semibold px-2 text-slate-700">1. Coordinator Details</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch Name</Label>
                  <Input id="branch" value={branch} onChange={(e) => setBranch(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zone">Zone</Label>
                  <Input id="zone" value={zone} onChange={(e) => setZone(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Mobile Number</Label>
                  <Input id="contactNumber" type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
            </fieldset>

            <fieldset className="space-y-6 p-6 border rounded-xl">
              <legend className="text-xl font-semibold px-2 text-slate-700">2. Travel & Passenger Details</legend>
               {isMapsLoaded ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="travelDate">Travel Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal h-11 rounded-xl text-base",
                                    !travelDate && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {travelDate ? format(travelDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={travelDate}
                                onSelect={setTravelDate}
                                initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="busType">Bus Type</Label>
                        <Select onValueChange={setBusType} value={busType}>
                            <SelectTrigger><SelectValue placeholder="Select bus type" /></SelectTrigger>
                            <SelectContent>
                            <SelectItem value="Shivneri">Shivneri (AC)</SelectItem>
                            <SelectItem value="Asiad">Asiad (Non-AC)</SelectItem>
                            <SelectItem value="Hirkani">Hirkani (Semi-Luxury)</SelectItem>
                            <SelectItem value="Ordinary">Ordinary</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="origin">Pickup Location</Label>
                        <PlacesAutocomplete 
                            onLocationSelect={(address, lat, lng) => setOrigin({ address, lat, lng })}
                            initialValue={origin.address}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="destination">Destination</Label>
                        <Input id="destination" value={destination.address} disabled />
                    </div>
                    
                    <div className="md:col-span-2 space-y-4 p-4 border rounded-lg bg-slate-100">
                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 items-center">
                            <div className="col-span-6 font-semibold text-sm text-slate-600">Passenger Bifurcation:</div>
                            <div className="space-y-1">
                                <Label htmlFor="numGents" className="text-xs">Gents</Label>
                                <Input id="numGents" type="number" min="0" value={numGents} onChange={(e) => setNumGents(Number(e.target.value))} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="numLadies" className="text-xs">Ladies</Label>
                                <Input id="numLadies" type="number" min="0" value={numLadies} onChange={(e) => setNumLadies(Number(e.target.value))} />
                            </div>
                             <div className="space-y-1">
                                <Label htmlFor="numSrCitizen" className="text-xs">Sr. Citizen (65+)</Label>
                                <Input id="numSrCitizen" type="number" min="0" value={numSrCitizen} onChange={(e) => setNumSrCitizen(Number(e.target.value))} />
                            </div>
                             <div className="space-y-1">
                                <Label htmlFor="numAmritCitizen" className="text-xs">Amrit (75+)</Label>
                                <Input id="numAmritCitizen" type="number" min="0" value={numAmritCitizen} onChange={(e) => setNumAmritCitizen(Number(e.target.value))} />
                            </div>
                             <div className="space-y-1">
                                <Label htmlFor="numChildren" className="text-xs">Children (5-12)</Label>
                                <Input id="numChildren" type="number" min="0" value={numChildren} onChange={(e) => setNumChildren(Number(e.target.value))} />
                            </div>
                            <div className="flex flex-col items-center justify-center p-2 bg-slate-200 rounded-md h-full">
                                <Label className="text-xs font-bold text-slate-600">Total</Label>
                                <div className="text-xl font-bold text-slate-800">{totalPassengers}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="md:col-span-2 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                        <p className="text-xs text-yellow-800 font-semibold">
                            For concessional fare, Aadhaar card is mandatory for Females & Sr. Citizens, and a valid certificate is required for Divyang passengers.
                        </p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="purpose">Additional Remark</Label>
                        <Textarea id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g., Any special instructions or notes for the booking."/>
                    </div>
                </div>
               ) : (
                <div className="text-center p-8 text-slate-500">
                    Loading map services...
                </div>
               )}
            </fieldset>

            <fieldset className="p-6 border rounded-xl">
                <legend className="text-xl font-semibold px-2 text-slate-700">3. Passenger List (Optional)</legend>
                <div className="flex gap-4 my-4 border-b pb-4">
                    <Button type="button" variant={uploadMode === 'manual' ? 'default' : 'outline'} onClick={() => setUploadMode('manual')}>
                        Enter Manually
                    </Button>
                    <Button type="button" variant={uploadMode === 'file' ? 'default' : 'outline'} onClick={() => setUploadMode('file')}>
                        Upload File
                    </Button>
                </div>

                {uploadMode === 'file' ? (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500">
                      Upload a CSV or Excel file with passenger details. The file should contain columns for: Name, Age, Gender, and Aadhaar Number (for concessions).
                    </p>
                    <div className="flex gap-4 items-center">
                      <Input 
                        id="passenger-file" 
                        type="file" 
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        onChange={(e) => setPassengerFile(e.target.files ? e.target.files[0] : null)}
                        className="max-w-sm"
                      />
                       <Button type="button" variant="outline" onClick={handleDownloadTemplate}>
                        <Download className="mr-2 h-4 w-4" /> Download Template
                      </Button>
                    </div>
                     {passengerFile && (
                        <div className="text-sm font-medium text-green-600">
                          File selected: {passengerFile.name}
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="space-y-4">
                      {passengers.map((passenger, index) => (
                          <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-3 border-b">
                              <div className="md:col-span-4 space-y-1">
                                  <Label htmlFor={`p-name-${index}`} className="text-xs">Name</Label>
                                  <Input id={`p-name-${index}`} placeholder="Full Name" value={passenger.name} onChange={(e) => handlePassengerChange(index, 'name', e.target.value)} required />
                              </div>
                              <div className="md:col-span-2 space-y-1">
                                  <Label htmlFor={`p-age-${index}`} className="text-xs">Age</Label>
                                  <Input id={`p-age-${index}`} type="number" placeholder="Age" value={passenger.age} onChange={(e) => handlePassengerChange(index, 'age', e.target.value)} required />
                              </div>
                              <div className="md:col-span-2 space-y-1">
                                  <Label htmlFor={`p-gender-${index}`} className="text-xs">Gender</Label>
                                  <Select onValueChange={(value) => handlePassengerChange(index, 'gender', value)} value={passenger.gender}>
                                      <SelectTrigger id={`p-gender-${index}`}><SelectValue placeholder="Gender" /></SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="Male">Male</SelectItem>
                                          <SelectItem value="Female">Female</SelectItem>
                                          <SelectItem value="Other">Other</SelectItem>
                                      </SelectContent>
                                  </Select>
                              </div>
                              <div className="md:col-span-3 space-y-1">
                                  <Label htmlFor={`p-id-${index}`} className="text-xs">ID Proof (Aadhaar)</Label>
                                  <Input id={`p-id-${index}`} type="file" onChange={(e) => handlePassengerChange(index, 'idProof', e)} className="h-11 pt-2 text-xs"/>
                              </div>
                              <div className="md:col-span-1">
                                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemovePassenger(index)} disabled={passengers.length === 1}>
                                      <Trash2 className="h-5 w-5 text-destructive" />
                                  </Button>
                              </div>
                          </div>
                      ))}
                      <Button type="button" variant="outline" onClick={handleAddPassenger} className="mt-4">
                          <UserPlus className="mr-2 h-4 w-4" /> Add Another Passenger
                      </Button>
                  </div>
                )}
            </fieldset>
            
            {error && <p className="text-center text-sm text-destructive py-2">{error}</p>}

            <div className="flex justify-end pt-6">
                <Button type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Request Submitted Successfully!</AlertDialogTitle>
                    <AlertDialogDescription>
                        Thanks for creating a request. Our backend team will update you about your request by call, or you can check your status online.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => router.push(`/track-status?mobile=${mobileNumber}`)}>
                        Check Status
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    </div>
  );
}
