
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, UserPlus, Upload, Download, FileDown, ChevronsUpDown, Check, Users, Ticket, Percent } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useJsApiLoader } from '@react-google-maps/api';
import { useCurrentLocation } from '@/hooks/use-current-location';
import { Combobox } from '@/components/ui/combobox';
import { loadDepots, calculateStage, type Depot } from '@/lib/stageCalculator';

interface Passenger {
  name: string;
  age: number | string;
  gender: 'Male' | 'Female' | 'Other' | '';
  idProof: File | null;
}

const libraries: ("places")[] = ["places"];

// Haversine formula to calculate distance between two lat-lon points
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};


export default function MsrtcBookingPage() {
  const [organizerName, setOrganizerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [travelDate, setTravelDate] = useState<Date>();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [busType, setBusType] = useState('');
  const [purpose, setPurpose] = useState('');
  
  const [passengers, setPassengers] = useState<Passenger[]>([
    { name: '', age: '', gender: '', idProof: null },
  ]);

  const [depots, setDepots] = useState<Depot[]>([]);
  const [loadingDepots, setLoadingDepots] = useState(true);
  
  const [uploadMode, setUploadMode] = useState<'manual' | 'file'>('manual');
  const [passengerFile, setPassengerFile] = useState<File | null>(null);

  const [isSubmitted, setIsSubmitted] = useState(false);

  // New state for passenger counts and fare
  const [numPassengers, setNumPassengers] = useState<number>(0);
  const [numConcession, setNumConcession] = useState<number>(0);
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);


  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey!,
    libraries,
    language: 'en',
    skip: !googleMapsApiKey,
  });

  const { coords } = useCurrentLocation(isLoaded);

  useEffect(() => {
    const fetchDepots = async () => {
      try {
        setLoadingDepots(true);
        const data = await loadDepots();
        if (coords) {
          const sortedDepots = data.map((depot: Depot) => ({
            ...depot,
            distance: getDistance(coords.lat, coords.lng, depot.lat, depot.lon),
          })).sort((a: any, b: any) => a.distance - b.distance);
          setDepots(sortedDepots);
          setOrigin(sortedDepots[0]?.name.toLowerCase() || ''); // Pre-select the nearest depot
        } else {
            setDepots(data);
        }
      } catch (error) {
        console.error("Failed to fetch depots:", error);
      } finally {
        setLoadingDepots(false);
      }
    };

    fetchDepots();
  }, [coords]);

  // Effect to calculate fare
  useEffect(() => {
    if (origin && destination && numPassengers > 0) {
      const o = depots.find((d) => d.name.toLowerCase() === origin);
      const d = depots.find((d) => d.name.toLowerCase() === destination);
      if (o && d) {
        const { stages } = calculateStage(o, d);
        const baseRatePerStage = 10; // Average rate for ordinary bus
        
        const fullFarePassengers = numPassengers - numConcession;
        const concessionPassengers = numConcession;
        
        const fareForFull = fullFarePassengers * stages * baseRatePerStage;
        const fareForConcession = concessionPassengers * stages * baseRatePerStage * 0.5; // 50% concession
        
        let totalFare = fareForFull + fareForConcession;
        
        // Night service charge
        const isNight = new Date().getHours() >= 22 || new Date().getHours() < 5;
        if (isNight) totalFare *= 1.18; // 18% extra for night service

        setEstimatedFare(Math.ceil(totalFare));
      }
    } else {
      setEstimatedFare(null);
    }
  }, [origin, destination, numPassengers, numConcession, depots]);


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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      organizerName,
      contactNumber,
      email,
      travelDate,
      origin,
      destination,
      busType,
      purpose,
      numPassengers,
      numConcession,
      estimatedFare,
      passengers,
      passengerFile
    });
    setIsSubmitted(true);
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.text("MSRTC Group Booking Request", 14, 16);
    doc.setFontSize(12);
    doc.text(`Organizer: ${organizerName}`, 14, 24);
    doc.text(`Travel Date: ${travelDate ? format(travelDate, "PPP") : 'N/A'}`, 14, 30);
    doc.text(`Route: ${origin} to ${destination}`, 14, 36);

    const tableColumn = ["Name", "Age", "Gender"];
    const tableRows: (string | number)[][] = [];

    passengers.forEach(p => {
        const passengerData = [
            p.name,
            p.age,
            p.gender
        ];
        tableRows.push(passengerData);
    });

    (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 42,
    });
    
    doc.text("Seat allocation details will be shown here.", 14, (doc as any).lastAutoTable.finalY + 10);

    doc.save(`msrtc_booking_request.pdf`);
  };

  const handleDownloadTemplate = () => {
    const headers = ["Name", "Age", "Gender", "Aadhaar Number (for concession)"];
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "passenger_list_template.csv");
    document.body.appendChild(link); // Required for FF
    
    link.click();
    document.body.removeChild(link);
  };

  const depotOptions = depots.map(depot => ({
      value: depot.name.toLowerCase(),
      label: depot.name
  }));
  
  if (isSubmitted) {
    return (
        <div className="container mx-auto py-12 px-4 md:px-6">
            <Card className="max-w-2xl mx-auto text-center">
                <CardHeader>
                    <CardTitle className="text-2xl font-display">Request Submitted Successfully!</CardTitle>
                    <CardDescription>Your group booking request has been received. You will be contacted shortly with a confirmation and seat allocation details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p className="font-semibold">Here is a summary of your request:</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside text-left mx-auto max-w-sm">
                            <li><strong>Organizer:</strong> {organizerName}</li>
                            <li><strong>Route:</strong> {depotOptions.find(d => d.value === origin)?.label} to {depotOptions.find(d => d.value === destination)?.label}</li>
                            <li><strong>Date:</strong> {travelDate ? format(travelDate, "PPP") : 'Not set'}</li>
                            <li><strong>Passengers:</strong> {numPassengers} ({numConcession} with concession)</li>
                            <li><strong>Estimated Fare:</strong> {estimatedFare ? `₹${estimatedFare.toLocaleString()}` : 'N/A'}</li>
                        </ul>
                        <div className="flex gap-4 justify-center pt-4">
                            <Button onClick={handleDownloadPdf}>
                                <FileDown className="mr-2 h-4 w-4" />
                                Download Request Summary PDF
                            </Button>
                             <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                                Make a New Request
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
  }


  return (
    <div className="container mx-auto py-12 px-4 md:px-6 bg-secondary/30">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-display text-primary">MSRTC Group Booking Request</CardTitle>
          <CardDescription>Fill out the form below to request a group booking with concessions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Organizer Details */}
            <fieldset className="space-y-4 p-4 border rounded-lg">
              <legend className="text-lg font-semibold px-2">1. Organizer Details</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="organizerName">Name of Group Organizer</Label>
                  <Input id="organizerName" value={organizerName} onChange={(e) => setOrganizerName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input id="contactNumber" type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
            </fieldset>

            {/* Travel Details */}
            <fieldset className="space-y-4 p-4 border rounded-lg">
              <legend className="text-lg font-semibold px-2">2. Travel Details</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <Label htmlFor="travelDate">Travel Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
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
                  <Label htmlFor="origin">Origin</Label>
                  {loadingDepots ? <Skeleton className="h-10 w-full" /> : (
                    <Combobox
                        options={depotOptions}
                        value={origin}
                        onChange={setOrigin}
                        placeholder="Select origin depot..."
                        searchPlaceholder="Search depot..."
                        notFoundText="No depot found."
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                   {loadingDepots ? <Skeleton className="h-10 w-full" /> : (
                    <Combobox
                        options={depotOptions}
                        value={destination}
                        onChange={setDestination}
                        placeholder="Select destination depot..."
                        searchPlaceholder="Search depot..."
                        notFoundText="No depot found."
                    />
                  )}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="numPassengers">Number of Passengers</Label>
                    <Input id="numPassengers" type="number" min="1" value={numPassengers} onChange={(e) => setNumPassengers(Number(e.target.value))} placeholder="e.g., 25" required />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="numConcession">Passengers with Concession</Label>
                    <Input id="numConcession" type="number" min="0" max={numPassengers} value={numConcession} onChange={(e) => setNumConcession(Number(e.target.value))} placeholder="e.g., 5" required />
                 </div>
                 <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="purpose">Purpose of Travel</Label>
                    <Textarea id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g., Pilgrimage, School Trip, etc."/>
                </div>
              </div>
            </fieldset>

            {/* Passenger List */}
            <fieldset className="p-4 border rounded-lg">
                <legend className="text-lg font-semibold px-2">3. Passenger List</legend>
                <div className="flex gap-4 mb-4 border-b pb-4">
                    <Button type="button" variant={uploadMode === 'manual' ? 'default' : 'outline'} onClick={() => setUploadMode('manual')}>
                        Enter Manually
                    </Button>
                    <Button type="button" variant={uploadMode === 'file' ? 'default' : 'outline'} onClick={() => setUploadMode('file')}>
                        Upload File
                    </Button>
                </div>

                {uploadMode === 'file' ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
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
                          <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end p-2 border-b">
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
                                  <Input id={`p-id-${index}`} type="file" onChange={(e) => handlePassengerChange(index, 'idProof', e)} className="h-10 pt-2 text-xs"/>
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

             {/* Fare Estimate */}
            {estimatedFare !== null && (
                <div className="p-6 border-t border-dashed mt-8">
                    <h3 className="text-lg font-semibold text-center mb-4">Fare Estimate</h3>
                    <div className="max-w-md mx-auto space-y-3">
                         <div className="flex justify-between items-center">
                            <span className="text-muted-foreground flex items-center gap-2"><Users className="w-4 h-4"/>Total Passengers</span>
                            <span className="font-semibold">{numPassengers}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground flex items-center gap-2"><Percent className="w-4 h-4"/>Concession Passengers</span>
                            <span className="font-semibold">{numConcession}</span>
                        </div>
                        <div className="flex justify-between items-center text-xl font-bold pt-2 border-t mt-2">
                             <span className="flex items-center gap-2"><Ticket className="w-5 h-5"/>Estimated Total Fare</span>
                             <span>₹{estimatedFare.toLocaleString()}</span>
                        </div>
                    </div>
                     <p className="text-xs text-muted-foreground pt-4 text-center">This is an estimate for an ordinary bus and may vary. Night charges may be applied separately.</p>
                </div>
            )}
            
            <div className="flex justify-end pt-4">
                <Button type="submit" size="lg">Submit Request</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
