
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Combobox } from '@/components/ui/combobox';
import { Loader2, Calculator, Info } from "lucide-react";
import { useAuth, useFirestore } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';

interface Depot {
  name: string;
  id: number;
}

export default function MsrtcBookingPage() {
  const t = useTranslations('MsrtcBooking');
  const [depots, setDepots] = useState<{ label: string; value: string }[]>([]);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [busType, setBusType] = useState('Non-AC');
  
  const [organizerName, setOrganizerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');

  const [numGents, setNumGents] = useState(0);
  const [numLadies, setNumLadies] = useState(0);
  const [numSrCitizen, setNumSrCitizen] = useState(0);
  const [numAmritCitizen, setNumAmritCitizen] = useState(0);
  const [numChildren, setNumChildren] = useState(0);
  const totalPassengers = numGents + numLadies + numSrCitizen + numAmritCitizen + numChildren;
  const numConcession = numSrCitizen + numAmritCitizen + Math.floor(numChildren / 2);

  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);
  const [fareDetails, setFareDetails] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    async function fetchDepots() {
      try {
        const response = await fetch('/api/msrtc');
        const data = await response.json();
        if (data.depots) {
          const formattedDepots = data.depots.map((depot: Depot) => ({
            label: depot.name,
            value: depot.name
          }));
          setDepots(formattedDepots);
        }
      } catch (err) {
        console.error("Failed to fetch depots:", err);
      }
    }
    fetchDepots();
  }, []);

  const handleCalculateFare = async () => {
    if (!origin || !destination) {
      setError(t('errorSelectDepots'));
      return;
    }
    setIsCalculating(true);
    setEstimatedFare(null);
    setFareDetails('');
    try {
      const response = await fetch(`/api/calculate-fare?originDepot=${origin}&destinationDepot=${destination}`);
      const data = await response.json();
      if (response.ok) {
        setEstimatedFare(data.fares.express); // Default to express fare
        setFareDetails(data.details);
      } else {
        throw new Error(data.error || 'Failed to calculate fare.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCalculating(false);
    }
  };

  const generateAlphanumericId = (prefix: string, length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}-${result}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizerName || !contactNumber || !travelDate || !origin || !destination || totalPassengers <= 0) {
      setError(t('errorFillAllFields'));
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      let user = auth.currentUser;
      if (!user) {
        user = (await signInAnonymously(auth)).user;
      }
      if (!user) {
        throw new Error(t('errorAuth'));
      }

      const bookingId = generateAlphanumericId('MS', 8);
      const bookingRef = doc(firestore, 'msrtcBookings', bookingId);

      const bookingData = {
        id: bookingId,
        userId: user.uid,
        organizerName,
        contactNumber,
        email,
        travelDate,
        origin,
        destination,
        busType,
        purpose,
        numPassengers: totalPassengers,
        numGents,
        numLadies,
        numSrCitizen,
        numAmritCitizen,
        numChildren,
        estimatedFare,
        passengers: [],
        status: "pending",
        createdAt: serverTimestamp(),
        numConcession,
      };

      await setDoc(bookingRef, bookingData);
      setShowSuccessDialog(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-slate-50 min-h-screen py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-800">{t('title')}</h1>
              <p className="text-slate-500 mt-2">{t('subtitle')}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
              
              <fieldset className="space-y-4 border-b pb-6">
                <legend className="text-lg font-semibold text-slate-700 mb-4">{t('organizerInfo')}</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="organizerName">{t('organizerName')}</Label>
                    <Input id="organizerName" value={organizerName} onChange={e => setOrganizerName(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="contactNumber">{t('contactNumber')}</Label>
                    <Input id="contactNumber" type="tel" value={contactNumber} onChange={e => setContactNumber(e.target.value)} required />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <Label htmlFor="email">{t('emailAddress')}</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>
              </fieldset>

              <fieldset className="space-y-4 border-b pb-6">
                 <legend className="text-lg font-semibold text-slate-700 mb-4">{t('tripDetails')}</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label>{t('originDepot')}</Label>
                        <Combobox
                            options={depots}
                            value={origin}
                            onChange={setOrigin}
                            placeholder={t('selectOrigin')}
                            searchPlaceholder={t('searchDepot')}
                            notFoundText={t('depotNotFound')}
                        />
                    </div>
                     <div className="space-y-1">
                        <Label>{t('destinationDepot')}</Label>
                        <Combobox
                            options={depots}
                            value={destination}
                            onChange={setDestination}
                            placeholder={t('selectDestination')}
                            searchPlaceholder={t('searchDepot')}
                            notFoundText={t('depotNotFound')}
                        />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="travelDate">{t('travelDate')}</Label>
                        <Input id="travelDate" type="date" value={travelDate} onChange={e => setTravelDate(e.target.value)} required />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="busType">{t('busType')}</Label>
                        <Select value={busType} onValueChange={setBusType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Non-AC">{t('nonAc')}</SelectItem>
                                <SelectItem value="AC">{t('ac')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="md:col-span-2 space-y-1">
                        <Label htmlFor="purpose">{t('purpose')}</Label>
                        <Textarea id="purpose" placeholder={t('purposePlaceholder')} value={purpose} onChange={e => setPurpose(e.target.value)} />
                    </div>
                 </div>
              </fieldset>

              <fieldset className="border-b pb-6">
                <legend className="text-lg font-semibold text-slate-700 mb-4">{t('passengerDetails')}</legend>
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
                 <div className="mt-4 flex flex-col md:flex-row items-center gap-4">
                    <Button type="button" onClick={handleCalculateFare} disabled={isCalculating || !origin || !destination}>
                        {isCalculating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Calculator className="mr-2 h-4 w-4" />}
                        {t('calculateFare')}
                    </Button>
                    {estimatedFare !== null && (
                        <div className="text-sm font-semibold bg-green-100 text-green-800 p-2 rounded-md">
                           {t('estimatedFare')}: ₹{estimatedFare.toLocaleString()} ({fareDetails})
                        </div>
                    )}
                </div>
                 {numConcession > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-lg flex items-start gap-2">
                        <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <p>{t('concessionInfo', { count: numConcession })}</p>
                    </div>
                 )}
              </fieldset>

              {error && <p className="text-center text-sm text-destructive py-2 bg-destructive/10 rounded-md">{error}</p>}
              
              <div className="mt-8">
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> {t('submitting')}</> : t('submitRequest')}
                </Button>
              </div>

            </form>
          </div>
        </div>
      </div>
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{t('successTitle')}</AlertDialogTitle>
                <AlertDialogDescription>{t('successDescription', { mobile: contactNumber })}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                 <AlertDialogAction onClick={() => router.push(`/track-status?mobile=${contactNumber}` as any)}>
                    {t('checkStatus')}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
