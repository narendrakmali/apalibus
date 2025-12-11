'use client';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { loadGoogleMaps } from "@/lib/google-maps-loader";
import PlacesAutocomplete from "@/components/places-autocomplete";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { useCurrentLocation } from "@/hooks/use-current-location";
import { useRouter } from '@/navigation';
import { useAuth, useFirestore } from '@/firebase';
import { signInAnonymously } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";

interface Location {
  address: string;
  lat?: number;
  lng?: number;
}

export default function RequestQuotePage() {
  const t = useTranslations('RequestQuote');
  const [fromLocation, setFromLocation] = useState<Location>({ address: "" });
  const [toLocation, setToLocation] = useState<Location>({ address: "Sangli Samagam" });
  const [journeyDate, setJourneyDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [journeyTime, setJourneyTime] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [busType, setBusType] = useState("");
  
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const [numGents, setNumGents] = useState(0);
  const [numLadies, setNumLadies] = useState(0);
  const [numSrCitizen, setNumSrCitizen] = useState(0);
  const [numAmritCitizen, setNumAmritCitizen] = useState(0);
  const [numChildren, setNumChildren] = useState(0);
  const totalPassengers = numGents + numLadies + numSrCitizen + numAmritCitizen + numChildren;

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRequestConfirm, setShowRequestConfirm] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isMapsLoaded, setIsMapsLoaded] = useState(false);

  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();

  useEffect(() => {
    loadGoogleMaps()
      .then(() => setIsMapsLoaded(true))
      .catch((err) => console.error("Failed to load Google Maps", err));
  }, []);

  const { locationName, coords } = useCurrentLocation(isMapsLoaded);

  useEffect(() => {
    if (locationName && coords) {
      setFromLocation({ address: locationName, lat: coords.lat, lng: coords.lng });
    }
  }, [locationName, coords]);
  
  useEffect(() => {
    if (isMapsLoaded) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: 'Sangli, Maharashtra' }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const { lat, lng } = results[0].geometry.location;
          setToLocation({ address: 'Sangli Samagam', lat: lat(), lng: lng() });
        }
      });
    }
  }, [isMapsLoaded]);

  const validateAndSubmit = () => {
    if (!fromLocation.address || !toLocation.address || !busType || !journeyDate || !returnDate || totalPassengers <= 0 || !journeyTime || !returnTime) {
      setError(t('errorFillDetails'));
      setIsAlertOpen(true);
      return;
    }

    if (!fullName || !mobileNumber || !email) {
       setError(t('errorContactInfo'));
      setIsAlertOpen(true);
      return;
    }

    const startDate = new Date(journeyDate);
    const endDate = new Date(returnDate);
    if(startDate > endDate) {
      setError(t('errorReturnDate'));
      setIsAlertOpen(true);
      return;
    }
    
    setError(null);
    setShowRequestConfirm(true);
  }

  const generateAlphanumericId = (length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `RQ-${result}`;
  }

  const handleCreateRequest = async () => {
    if (isSubmitting) return;
    
    setShowRequestConfirm(false);
    setIsSubmitting(true);
    setError(null);

    try {
      let user = auth.currentUser;
      if (!user) {
        const userCredential = await signInAnonymously(auth);
        user = userCredential.user;
      }

      if (!user) {
        throw new Error("Could not create an anonymous user session.");
      }

      const requestId = generateAlphanumericId(8);
      const docRef = doc(firestore, "bookingRequests", requestId);

      const requestData = {
        id: requestId,
        userId: user.uid,
        fromLocation,
        toLocation,
        journeyDate,
        returnDate,
        journeyTime,
        returnTime,
        seats: totalPassengers.toString(),
        numGents,
        numLadies,
        numSrCitizen,
        numAmritCitizen,
        numChildren,
        busType,
        seatType: '', // Not specified in this form, can be added if needed
        estimate: null, // No estimate on initial request
        notes,
        contact: {
          name: fullName,
          mobile: mobileNumber,
          email: email,
        },
        status: "pending",
        createdAt: serverTimestamp(),
      };
      
      setDoc(docRef, requestData)
        .then(() => {
          setShowSuccessDialog(true);
        })
        .catch((serverError) => {
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'create',
            requestResourceData: requestData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });

    } catch (e: any) {
      setError(`Failed to create booking request: ${e.message}`);
      setIsAlertOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4">
        <div className="max-w-3xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">{t('title')}</h1>
                    <p className="text-slate-500 mt-2">{t('subtitle')}</p>
                </div>
                {isMapsLoaded ? (
                <form onSubmit={(e) => { e.preventDefault(); validateAndSubmit(); }}>
                    <div className="space-y-6">
                        <div className="border-b pb-6">
                            <h2 className="text-lg font-semibold text-slate-700 mb-4">{t('tripDetails')}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>{t('pickupLocation')}</Label>
                                    <PlacesAutocomplete 
                                        onLocationSelect={(address, lat, lng) => setFromLocation({ address, lat, lng })}
                                        initialValue={fromLocation.address}
                                        className="w-full"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>{t('destination')}</Label>
                                    <Input value={toLocation.address} disabled />
                                </div>
                                <div className="space-y-1">
                                    <Label>{t('journeyDate')}</Label>
                                    <Input type="date" value={journeyDate} onChange={e => setJourneyDate(e.target.value)} required />
                                </div>
                                <div className="space-y-1">
                                    <Label>{t('departureTime')}</Label>
                                    <Input type="time" value={journeyTime} onChange={e => setJourneyTime(e.target.value)} required />
                                </div>
                                <div className="space-y-1">
                                    <Label>{t('returnDate')}</Label>
                                    <Input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} required />
                                </div>
                                <div className="space-y-1">
                                    <Label>{t('returnTime')}</Label>
                                    <Input type="time" value={returnTime} onChange={e => setReturnTime(e.target.value)} required />
                                </div>
                                
                                <div className="space-y-1">
                                    <Label>{t('busType')}</Label>
                                    <Select onValueChange={setBusType} value={busType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('selectBusType')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="AC Seater/Sleeper">{t('acBus')}</SelectItem>
                                            <SelectItem value="Non-AC Seater/Sleeper">{t('nonAcBus')}</SelectItem>
                                            <SelectItem value="MSRTC Shivshahi">{t('shivshahi')}</SelectItem>
                                            <SelectItem value="MSRTC Hirkani">{t('hirkani')}</SelectItem>
                                            <SelectItem value="Any">{t('anyAvailable')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                         <div className="border-b pb-6">
                            <h2 className="text-lg font-semibold text-slate-700 mb-4">{t('passengerDetails')}</h2>
                             <div className="space-y-4 p-4 border rounded-lg bg-background">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 items-center">
                                    <div className="col-span-6 font-semibold text-sm">{t('bifurcation')}</div>
                                    <div className="space-y-1">
                                        <Label htmlFor="numGents" className="text-xs">{t('gents')}</Label>
                                        <Input id="numGents" type="number" min="0" value={numGents} onChange={(e) => setNumGents(Number(e.target.value))} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="numLadies" className="text-xs">{t('ladies')}</Label>
                                        <Input id="numLadies" type="number" min="0" value={numLadies} onChange={(e) => setNumLadies(Number(e.target.value))} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="numSrCitizen" className="text-xs">{t('srCitizen')}</Label>
                                        <Input id="numSrCitizen" type="number" min="0" value={numSrCitizen} onChange={(e) => setNumSrCitizen(Number(e.target.value))} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="numAmritCitizen" className="text-xs">{t('amritCitizen')}</Label>
                                        <Input id="numAmritCitizen" type="number" min="0" value={numAmritCitizen} onChange={(e) => setNumAmritCitizen(Number(e.target.value))} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="numChildren" className="text-xs">{t('children')}</Label>
                                        <Input id="numChildren" type="number" min="0" value={numChildren} onChange={(e) => setNumChildren(Number(e.target.value))} />
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-2 bg-secondary rounded-md h-full">
                                        <Label className="text-xs font-bold">{t('total')}</Label>
                                        <div className="text-xl font-bold">{totalPassengers}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-b pb-6">
                            <h2 className="text-lg font-semibold text-slate-700 mb-4">{t('contactInfo')}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>{t('fullName')}</Label>
                                    <Input type="text" placeholder={t('enterFullName')} value={fullName} onChange={e => setFullName(e.target.value)} required />
                                </div>
                                <div className="space-y-1">
                                    <Label>{t('mobileNumber')}</Label>
                                    <Input type="tel" placeholder={t('enterMobile')} value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} required />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <Label>{t('email')}</Label>
                                    <Input type="email" placeholder={t('enterEmail')} value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <Label>{t('notes')}</Label>
                                    <Textarea placeholder={t('notesPlaceholder')} value={notes} onChange={(e) => setNotes(e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                           {isSubmitting ? t('submitting') : t('submitButton')}
                        </Button>
                    </div>

                </form>
                ) : (
                    <div className="text-center p-8 text-gray-500">
                        Loading map services...
                    </div>
                )}
            </div>
        </div>
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('errorTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {error}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => { setIsAlertOpen(false); setError(null); }}>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showRequestConfirm} onOpenChange={setShowRequestConfirm}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('confirmTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>{t('confirmDescription')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCreateRequest}>{t('submitConfirm')}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('successTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>{t('successDescription')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => router.push(`/track-status?mobile=${mobileNumber}`)}>
                        {t('checkStatus')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}

    