
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
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import OtpInput from 'react-otp-input';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function RegisterPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const router = useRouter();
  const { auth, firestore } = useFirebase();

  const handleSendOtp = async () => {
    setError(null);
    if (!auth || !firestore) {
      setError("Firebase is not initialized.");
      return;
    }
     if (phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    // reCAPTCHA setup
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
    const appVerifier = (window as any).recaptchaVerifier;

    try {
      const result = await signInWithPhoneNumber(auth, `+91${phone}`, appVerifier);
      setConfirmationResult(result);
      setIsOtpSent(true);
    } catch (err: any) {
      console.error(err);
      setError(`Failed to send OTP: ${err.message}`);
      // Reset reCAPTCHA
      if (appVerifier && typeof grecaptcha !== 'undefined' && grecaptcha.reset) {
        appVerifier.render().then((widgetId: any) => {
          grecaptcha.reset(widgetId);
        });
      }
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    if (!confirmationResult) {
      setError("Please request an OTP first.");
      return;
    }
     if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      // Create user document in Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      const userData = {
        id: user.uid,
        email: "",
        mobileNumber: user.phoneNumber,
        name: "",
        address: "",
        pincode: "",
      };
      setDocumentNonBlocking(userDocRef, userData, {});

      // Show success dialog
      setIsSuccess(true);

    } catch (err: any) {
      setError(`Failed to verify OTP: ${err.message}`);
    }
  };


  return (
    <>
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-12 bg-background">
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-display">Create a User Account</CardTitle>
            <CardDescription>
              {isOtpSent ? "Enter the OTP sent to your phone" : "Enter your phone number to receive an OTP"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {!isOtpSent ? (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex items-center">
                      <span className="p-2 border rounded-l-md bg-muted">+91</span>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="9876543210"
                        required
                        className="rounded-l-none"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        maxLength={10}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSendOtp} className="w-full bg-primary hover:bg-primary/90" disabled={phone.length !== 10}>
                    Send OTP
                  </Button>
                </>
              ) : (
                <>
                  <div className="grid gap-2 justify-center">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <OtpInput
                      value={otp}
                      onChange={setOtp}
                      numInputs={6}
                      containerStyle="gap-2"
                      renderInput={(props) => <Input {...props} type="text" />}
                    />
                  </div>
                  <Button onClick={handleVerifyOtp} className="w-full bg-primary hover:bg-primary/90" disabled={otp.length !== 6}>
                    Verify OTP & Register
                  </Button>
                </>
              )}
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            </div>

            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/user-login" className="underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

       <AlertDialog open={isSuccess} onOpenChange={setIsSuccess}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Registration Successful!</AlertDialogTitle>
            <AlertDialogDescription>
              Your account has been created successfully. Please log in to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => router.push('/user-login')}>
              Proceed to Login
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
