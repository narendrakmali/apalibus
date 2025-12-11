
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Camera, FileUp, Loader2, X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { useAuth, useFirestore } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';

export default function InformTransportPage() {
  const t = useTranslations('InformTransport');
  const [bookingType, setBookingType] = useState<'private' | 'msrtc'>('private');
  const [contactName, setContactName] = useState('');
  const [contactMobile, setContactMobile] = useState('');
  const [coordinatorName, setCoordinatorName] = useState('');
  const [journeyDate, setJourneyDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengerCount, setPassengerCount] = useState('');
  const [busRegistration, setBusRegistration] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [ticketFiles, setTicketFiles] = useState<string[]>([]); // Store as data URLs
  const [ticketFileNames, setTicketFileNames] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    // Cleanup camera stream
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleCameraOpen = async () => {
    if (ticketFiles.length >= 10) {
      setError(t('maxFilesError'));
      return;
    }
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setIsCameraOpen(true);
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setError(t('cameraDeniedError'));
      }
    } else {
      setError(t('cameraNotSupportedError'));
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const dataUrl = canvas.toDataURL('image/jpeg');
      
      setTicketFiles(prev => [...prev, dataUrl]);
      setTicketFileNames(prev => [...prev, `capture-${Date.now()}.jpg`]);
      handleCameraClose();
    }
  };
  
  const handleCameraClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
    setStream(null);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
        if (ticketFiles.length + files.length > 10) {
            setError(t('maxFilesError'));
            return;
        }
        
        for (const file of Array.from(files)) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setTicketFiles(prev => [...prev, e.target?.result as string]);
                setTicketFileNames(prev => [...prev, file.name]);
            };
            reader.readAsDataURL(file);
        }
    }
  };

  const handleRemoveFile = (index: number) => {
    setTicketFiles(prev => prev.filter((_, i) => i !== index));
    setTicketFileNames(prev => prev.filter((_, i) => i !== index));
  }

  const uploadTickets = async (userId: string, submissionId: string, dataUrls: string[], fileNames: string[]): Promise<string[]> => {
      const storage = getStorage();
      const uploadPromises = dataUrls.map((dataUrl, index) => {
          const fileName = fileNames[index];
          const filePath = `ticketSubmissions/${userId}/${submissionId}-${fileName}`;
          const storageRef = ref(storage, filePath);
          return uploadString(storageRef, dataUrl, 'data_url').then(uploadResult => getDownloadURL(uploadResult.ref));
      });
      return Promise.all(uploadPromises);
  }

  const generateAlphanumericId = (prefix: string, length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}-${result}`;
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!contactName || !contactMobile || !coordinatorName || !journeyDate || !returnDate || !passengerCount || ticketFiles.length === 0) {
      setError(t('fillFieldsError'));
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
            throw new Error(t('authError'));
        }

        const submissionId = generateAlphanumericId('VS', 8);
        const ticketImageUrls = await uploadTickets(user.uid, submissionId, ticketFiles, ticketFileNames);

        const docRef = doc(firestore, "vehicleSubmissions", submissionId);

        const submissionData = {
            id: submissionId,
            userId: user.uid,
            contactName,
            contactMobile,
            coordinatorName,
            bookingType: bookingType === 'private' ? "Private Bus" : "MSRTC Bus",
            busRegistration,
            operatorName: bookingType === 'private' ? operatorName : 'MSRTC',
            journeyDate,
            returnDate,
            passengerCount: parseInt(passengerCount),
            ticketImageUrls,
            createdAt: serverTimestamp(),
        };

        await setDoc(docRef, submissionData);
        setShowSuccessDialog(true);
    } catch (err: any) {
        console.error("Submission error:", err);
        setError(t('submissionError', { error: err.message }));
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
              {/* Coordinator Info */}
              <fieldset className="space-y-4 border-b pb-6">
                <legend className="text-lg font-semibold text-slate-700 mb-4">{t('yourInfo')}</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="contactName">{t('contactName')}</Label>
                        <Input id="contactName" value={contactName} onChange={e => setContactName(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="contactMobile">{t('contactMobile')}</Label>
                        <Input id="contactMobile" type="tel" value={contactMobile} onChange={e => setContactMobile(e.target.value)} required />
                    </div>
                     <div className="md:col-span-2 space-y-1">
                        <Label htmlFor="coordinatorName">{t('coordinatorName')}</Label>
                        <Input id="coordinatorName" placeholder={t('coordinatorPlaceholder')} value={coordinatorName} onChange={e => setCoordinatorName(e.target.value)} required />
                    </div>
                 </div>
              </fieldset>

              {/* Booking Details */}
              <fieldset className="space-y-4 border-b pb-6">
                 <legend className="text-lg font-semibold text-slate-700 mb-4">{t('bookingDetails')}</legend>
                 <RadioGroup value={bookingType} onValueChange={(v) => setBookingType(v as 'private' | 'msrtc')} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="private" id="private"/>
                        <Label htmlFor="private">{t('privateBus')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="msrtc" id="msrtc"/>
                        <Label htmlFor="msrtc">{t('msrtcBus')}</Label>
                    </div>
                 </RadioGroup>

                {bookingType === 'private' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div className="space-y-1">
                            <Label htmlFor="operatorName">{t('operatorName')}</Label>
                            <Input id="operatorName" value={operatorName} onChange={e => setOperatorName(e.target.value)} placeholder={t('operatorPlaceholder')} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="busRegistration">{t('busRegNo')}</Label>
                            <Input id="busRegistration" value={busRegistration} onChange={e => setBusRegistration(e.target.value)} placeholder={t('busRegPlaceholder')} />
                        </div>
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="space-y-1">
                        <Label htmlFor="journeyDate">{t('journeyStartDate')}</Label>
                        <Input id="journeyDate" type="date" value={journeyDate} onChange={e => setJourneyDate(e.target.value)} required/>
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="returnDate">{t('returnDate')}</Label>
                        <Input id="returnDate" type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} required/>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="passengerCount">{t('passengerCount')}</Label>
                        <Input id="passengerCount" type="number" value={passengerCount} onChange={e => setPassengerCount(e.target.value)} required/>
                    </div>
                </div>
              </fieldset>

              {/* Ticket Upload */}
              <fieldset className="space-y-4">
                <legend className="text-lg font-semibold text-slate-700 mb-4">{t('uploadTickets')}</legend>
                <div className="p-4 border-2 border-dashed rounded-lg">
                    {ticketFiles.length > 0 && (
                        <div className="mb-4 space-y-2">
                             <h4 className="font-medium text-sm">{t('selectedFiles', { count: ticketFiles.length })}</h4>
                             <div className="grid grid-cols-2 gap-2">
                                {ticketFileNames.map((name, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm bg-slate-100 p-2 rounded-md">
                                        <span className="truncate">{name}</span>
                                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveFile(index)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {ticketFiles.length < 10 ? (
                        <div className="space-y-2 text-center">
                             <p className="text-xs text-muted-foreground">{t('uploadHint')}</p>
                             <div className="flex justify-center gap-4">
                                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                    <FileUp className="mr-2 h-4 w-4" /> {t('selectFiles')}
                                </Button>
                                <Button type="button" onClick={handleCameraOpen}>
                                    <Camera className="mr-2 h-4 w-4" /> {t('useCamera')}
                                </Button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,application/pdf" className="hidden" multiple />
                            </div>
                        </div>
                    ) : (
                         <p className="text-center text-sm font-medium text-green-600">{t('maxFilesReached')}</p>
                    )}
                </div>
              </fieldset>

              {error && <p className="text-center text-sm text-destructive py-2 bg-destructive/10 rounded-md">{error}</p>}

              <div className="mt-8">
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> {t('submitting')}</> : t('submitInfo')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      <AlertDialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('captureTicketTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('captureTicketDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="relative">
            <video ref={videoRef} className="w-full aspect-video rounded-md bg-slate-900" autoPlay muted playsInline></video>
            <canvas ref={canvasRef} className="hidden"></canvas>
          </div>
          <AlertDialogFooter>
            <Button variant="secondary" onClick={handleCameraClose}>{t('cancel')}</Button>
            <Button onClick={handleCapture}>{t('capturePhoto')}</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{t('successTitle')}</AlertDialogTitle>
                <AlertDialogDescription>{t('successDesc')}</AlertDialogDescription>
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
