
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { useAuth, useFirestore } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';

const sewaCalendar = [
    { value: "2025-11-30_2025-12-04_Sangli", label: "30 Nov - 04 Dec | Sangli Duty" },
    { value: "2025-12-04_2025-12-08_Sangli", label: "04 Dec - 08 Dec | Sangli Duty" },
    { value: "2025-12-07_2025-12-11_Baramati", label: "07 Dec - 11 Dec | Baramati Duty" },
    { value: "2025-12-11_2025-12-15_Satara", label: "11 Dec - 15 Dec | Satara Duty" },
    { value: "2025-12-14_2025-12-18_Kolhapur/Gadchiroli/Ratnagiri", label: "14 Dec - 18 Dec | Kolhapur/Gadchiroli/Ratnagiri Duty" },
    { value: "2025-12-18_2025-12-22_Ahmednagar/Nagpur/Jalgaon/Raigad", label: "18 Dec - 22 Dec | Ahmednagar/Nagpur/Jalgaon/Raigad Duty" },
    { value: "2025-12-21_2025-12-25_Pune/Pimpri/Solapur/Akola", label: "21 Dec - 25 Dec | Pune/Pimpri/Solapur/Akola Duty" },
    { value: "2025-12-25_2025-12-29_Nashik/CSN/Goa", label: "25 Dec - 29 Dec | Nashik/CSN/Goa Duty" },
    { value: "2025-12-28_2026-01-01_Mumbai/Vasai/Ratnagiri", label: "28 Dec - 01 Jan | Mumbai/Vasai/Ratnagiri Duty" },
    { value: "2026-01-01_2026-01-05_Mumbai/Local", label: "01 Jan - 05 Jan | Mumbai & Local Duty" },
    { value: "2026-01-04_2026-01-08_Mumbai/Local", label: "04 Jan - 08 Jan | Mumbai & Local Duty" },
    { value: "2026-01-08_2026-01-12_Mumbai/Local", label: "08 Jan - 12 Jan | Mumbai & Local Duty" },
    { value: "2026-01-11_2026-01-15_Mumbai/Local", label: "11 Jan - 15 Jan | Mumbai & Local Duty" },
    { value: "2026-01-15_2026-01-19_Mumbai/Local", label: "15 Jan - 19 Jan | Mumbai & Local Duty" },
    { value: "2026-01-18_2026-01-22_FinalAdvance", label: "18 Jan - 22 Jan | Final Advance Phase" },
    { value: "2026-01-24_2026-01-27_MainEvent", label: "24 Jan - 27 Jan | Main Samagam Event" },
];


export default function SewaVolunteerPage() {
  const t = useTranslations('SewaVolunteer');
  
  const [volunteerName, setVolunteerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [branch, setBranch] = useState('');
  const [dutyPeriod, setDutyPeriod] = useState('');
  const [transportMode, setTransportMode] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

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
    if (!volunteerName || !mobileNumber || !branch || !dutyPeriod || !transportMode || !arrivalDate || !arrivalTime || !departureDate || !departureTime) {
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

      const volunteerId = generateAlphanumericId('SV', 8);
      const submissionRef = doc(firestore, 'sewaVolunteers', volunteerId);

      const submissionData = {
        id: volunteerId,
        userId: user.uid,
        volunteerName,
        mobileNumber,
        branch,
        dutyPeriod,
        transportMode,
        arrivalDate,
        arrivalTime,
        departureDate,
        departureTime,
        notes,
        createdAt: serverTimestamp(),
      };

      await setDoc(submissionRef, submissionData);
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
                <legend className="text-lg font-semibold text-slate-700 mb-4">{t('volunteerInfo')}</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="volunteerName">{t('volunteerName')}</Label>
                    <Input id="volunteerName" value={volunteerName} onChange={e => setVolunteerName(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="mobileNumber">{t('mobileNumber')}</Label>
                    <Input id="mobileNumber" type="tel" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} required />
                  </div>
                   <div className="md:col-span-2 space-y-1">
                    <Label htmlFor="branch">{t('branch')}</Label>
                    <Input id="branch" placeholder={t('branchPlaceholder')} value={branch} onChange={e => setBranch(e.target.value)} required />
                  </div>
                </div>
              </fieldset>

              <fieldset className="space-y-4 border-b pb-6">
                 <legend className="text-lg font-semibold text-slate-700 mb-4">{t('arrivalDeparture')}</legend>
                 <div className="space-y-1">
                    <Label htmlFor="dutyPeriod">{t('dutyPeriod')}</Label>
                    <Select value={dutyPeriod} onValueChange={setDutyPeriod} required>
                        <SelectTrigger>
                            <SelectValue placeholder={t('selectDutyPeriod')} />
                        </SelectTrigger>
                        <SelectContent>
                            {sewaCalendar.map(item => (
                                <SelectItem key={item.value} value={item.label}>{item.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="arrivalDate">{t('arrivalDate')}</Label>
                        <Input id="arrivalDate" type="date" value={arrivalDate} onChange={e => setArrivalDate(e.target.value)} required />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="arrivalTime">{t('arrivalTime')}</Label>
                        <Input id="arrivalTime" type="time" value={arrivalTime} onChange={e => setArrivalTime(e.target.value)} required />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="departureDate">{t('departureDate')}</Label>
                        <Input id="departureDate" type="date" value={departureDate} onChange={e => setDepartureDate(e.target.value)} required />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="departureTime">{t('departureTime')}</Label>
                        <Input id="departureTime" type="time" value={departureTime} onChange={e => setDepartureTime(e.target.value)} required />
                    </div>
                     <div className="md:col-span-2 space-y-1">
                        <Label htmlFor="transportMode">{t('transportMode')}</Label>
                        <Select value={transportMode} onValueChange={setTransportMode} required>
                            <SelectTrigger>
                                <SelectValue placeholder={t('selectTransportMode')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Train">{t('train')}</SelectItem>
                                <SelectItem value="Bus">{t('bus')}</SelectItem>
                                <SelectItem value="Car">{t('car')}</SelectItem>
                                <SelectItem value="Other">{t('other')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="md:col-span-2 space-y-1">
                        <Label htmlFor="notes">{t('notes')}</Label>
                        <Textarea id="notes" placeholder={t('notesPlaceholder')} value={notes} onChange={e => setNotes(e.target.value)} />
                    </div>
                 </div>
              </fieldset>

              {error && <p className="text-center text-sm text-destructive py-2 bg-destructive/10 rounded-md">{error}</p>}
              
              <div className="mt-8">
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> {t('submitting')}</> : t('submitDetails')}
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
                <AlertDialogDescription>{t('successDescription')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                 <AlertDialogAction onClick={() => router.push('/')}>
                    {t('backToDashboard')}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    