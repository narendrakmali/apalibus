
'use client';

import Link from 'next/link';
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
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';


declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function OperatorRegisterPage() {
  const [operatorName, setOperatorName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);

  const router = useRouter();
  const { auth, firestore } = useFirebase();

  const setupRecaptcha = () => {
    if (!auth) return;
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
      });
    }
  };

  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!auth || !firestore) {
      setError("An error occurred. Please try again later.");
      return;
    }
    
    setupRecaptcha();
    
    try {
      const formattedPhoneNumber = `+91${phoneNumber}`;
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhoneNumber, window.recaptchaVerifier);
      window.confirmationResult = confirmationResult;
      setIsOtpSent(true);
    } catch (error: any) {
      setError(`Failed to send OTP: ${error.message}`);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!window.confirmationResult) {
      setError("OTP not sent or session expired. Please try again.");
      return;
    }

    try {
      const result = await window.confirmationResult.confirm(otp);
      const user = result.user;

      const operatorDocRef = doc(firestore, 'busOperators', user.uid);
      const operatorData = {
        id: user.uid,
        name: operatorName,
        contactNumber: user.phoneNumber,
        email: "", // Can be collected later
      };

      setDocumentNonBlocking(operatorDocRef, operatorData, {});

      router.push('/operator-login');
    } catch (error: any) {
      setError(`Failed to verify OTP: ${error.message}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-12 bg-secondary/50">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Create an Operator Account</CardTitle>
          <CardDescription>
             {isOtpSent ? 'Enter the OTP sent to your phone' : 'Enter your details to get an OTP'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isOtpSent ? (
            <form onSubmit={handleSendOtp}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="operator-name">Operator Name</Label>
                  <Input
                    id="operator-name"
                    placeholder="Sakpal Travels Inc."
                    required
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                  />
                </div>
                 <div className="grid gap-2">
                  <Label htmlFor="phone-number">Phone Number</Label>
                  <Input
                    id="phone-number"
                    placeholder="10-digit mobile number"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    type="tel"
                    pattern="[0-9]{10}"
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  Send OTP
                </Button>
              </div>
            </form>
          ) : (
             <form onSubmit={handleVerifyOtp}>
              <div className="grid gap-4">
                 <div className="grid gap-2">
                  <Label>Operator Name</Label>
                  <p className="text-sm font-medium">{operatorName}</p>
                 </div>
                  <div className="grid gap-2">
                  <Label>Phone Number</Label>
                  <p className="text-sm font-medium">{phoneNumber}</p>
                 </div>
                <div className="grid gap-2">
                  <Label htmlFor="otp">OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="6-digit code"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  Verify OTP & Register
                </Button>
              </div>
            </form>
          )}

          <div id="recaptcha-container"></div>
          
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/operator-login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    