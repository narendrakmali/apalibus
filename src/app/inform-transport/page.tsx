
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Camera, FileUp, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { useAuth, useFirestore } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { useRouter } from 'next/navigation';

export default function InformTransportPage() {
  const [bookingType, setBookingType] = useState<'private' | 'msrtc'>('private');
  const [contactName, setContactName] = useState('');
  const [contactMobile, setContactMobile] = useState('');
  const [coordinatorName, setCoordinatorName] = useState('');
  const [journeyDate, setJourneyDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengerCount, setPassengerCount] = useState('');
  const [busRegistration, setBusRegistration] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [ticketFile, setTicketFile] = useState<string | null>(null); // Store as data URL
  const [ticketFileName, setTicketFileName] = useState('');

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
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setIsCameraOpen(true);
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setError("Camera access was denied. Please enable camera permissions in your browser settings.");
      }
    } else {
      setError("Camera is not supported on this device.");
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
      setTicketFile(dataUrl);
      setTicketFileName('capture.jpg');
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
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTicketFile(e.target?.result as string);
        setTicketFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadTicket = async (userId: string, submissionId: string, dataUrl: string): Promise<string> => {
      const storage = getStorage();
      const filePath = `ticketSubmissions/${userId}/${submissionId}-${ticketFileName}`;
      const storageRef = ref(storage, filePath);
      
      const uploadResult = await uploadString(storageRef, dataUrl, 'data_url');
      const downloadURL = await getDownloadURL(uploadResult.ref);
      return downloadURL;
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
    if (!contactName || !contactMobile || !coordinatorName || !journeyDate || !returnDate || !passengerCount || !ticketFile) {
      setError("Please fill out all required fields and upload a ticket.");
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
            throw new Error("Could not authenticate user.");
        }

        const submissionId = generateAlphanumericId('VS', 8);
        const ticketImageUrl = await uploadTicket(user.uid, submissionId, ticketFile);

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
            ticketImageUrl,
            createdAt: serverTimestamp(),
        };

        await setDoc(docRef, submissionData);
        setShowSuccessDialog(true);
    } catch (err: any) {
        console.error("Submission error:", err);
        setError(`Failed to submit information: ${err.message}`);
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
              <h1 className="text-3xl font-bold text-slate-800">Inform Transport Dept.</h1>
              <p className="text-slate-500 mt-2">Submit details of your pre-booked bus for Samagam coordination.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Coordinator Info */}
              <fieldset className="space-y-4 border-b pb-6">
                <legend className="text-lg font-semibold text-slate-700 mb-4">Your Information</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="contactName">Contact Person Name</Label>
                        <Input id="contactName" value={contactName} onChange={e => setContactName(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="contactMobile">Contact Mobile No.</Label>
                        <Input id="contactMobile" type="tel" value={contactMobile} onChange={e => setContactMobile(e.target.value)} required />
                    </div>
                     <div className="md:col-span-2 space-y-1">
                        <Label htmlFor="coordinatorName">Branch Coordinator Name (Branch/Zone)</Label>
                        <Input id="coordinatorName" placeholder="e.g., Ramesh Kumar (Chembur)" value={coordinatorName} onChange={e => setCoordinatorName(e.target.value)} required />
                    </div>
                 </div>
              </fieldset>

              {/* Booking Details */}
              <fieldset className="space-y-4 border-b pb-6">
                 <legend className="text-lg font-semibold text-slate-700 mb-4">Booking Details</legend>
                 <RadioGroup value={bookingType} onValueChange={(v) => setBookingType(v as 'private' | 'msrtc')} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="private" id="private"/>
                        <Label htmlFor="private">Private Bus</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="msrtc" id="msrtc"/>
                        <Label htmlFor="msrtc">MSRTC Bus</Label>
                    </div>
                 </RadioGroup>

                {bookingType === 'private' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div className="space-y-1">
                            <Label htmlFor="operatorName">Bus Operator Name</Label>
                            <Input id="operatorName" value={operatorName} onChange={e => setOperatorName(e.target.value)} placeholder="e.g., Sharma Travels" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="busRegistration">Bus Registration No. (Optional)</Label>
                            <Input id="busRegistration" value={busRegistration} onChange={e => setBusRegistration(e.target.value)} placeholder="e.g., MH 01 AB 1234" />
                        </div>
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="space-y-1">
                        <Label htmlFor="journeyDate">Journey Start Date</Label>
                        <Input id="journeyDate" type="date" value={journeyDate} onChange={e => setJourneyDate(e.target.value)} required/>
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="returnDate">Return Date</Label>
                        <Input id="returnDate" type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} required/>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="passengerCount">Total No. of Passengers</Label>
                        <Input id="passengerCount" type="number" value={passengerCount} onChange={e => setPassengerCount(e.target.value)} required/>
                    </div>
                </div>
              </fieldset>

              {/* Ticket Upload */}
              <fieldset className="space-y-4">
                <legend className="text-lg font-semibold text-slate-700 mb-4">Upload Ticket</legend>
                <div className="p-4 border-2 border-dashed rounded-lg text-center">
                    {ticketFile ? (
                        <div>
                            <p className="font-medium text-green-600">File Ready: {ticketFileName}</p>
                            <Button variant="link" onClick={() => { setTicketFile(null); setTicketFileName(''); }}>Remove</Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                             <p className="text-sm text-muted-foreground">Upload an image or PDF of your ticket/booking confirmation.</p>
                             <div className="flex justify-center gap-4">
                                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                    <FileUp className="mr-2 h-4 w-4" /> Select File
                                </Button>
                                <Button type="button" onClick={handleCameraOpen}>
                                    <Camera className="mr-2 h-4 w-4" /> Use Camera
                                </Button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,application/pdf" className="hidden" />
                            </div>
                        </div>
                    )}
                </div>
              </fieldset>

              {error && <p className="text-center text-sm text-destructive py-2 bg-destructive/10 rounded-md">{error}</p>}

              <div className="mt-8">
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Submitting...</> : 'Submit Information'}
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
            <AlertDialogTitle>Capture Ticket</AlertDialogTitle>
            <AlertDialogDescription>Position your ticket in the frame and click capture.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="relative">
            <video ref={videoRef} className="w-full aspect-video rounded-md bg-slate-900" autoPlay muted playsInline></video>
            <canvas ref={canvasRef} className="hidden"></canvas>
          </div>
          <AlertDialogFooter>
            <Button variant="secondary" onClick={handleCameraClose}>Cancel</Button>
            <Button onClick={handleCapture}>Capture Photo</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Information Submitted Successfully!</AlertDialogTitle>
                <AlertDialogDescription>
                    Thank you for providing your travel details. This will help us coordinate arrivals smoothly.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => router.push('/')}>
                    Back to Dashboard
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    