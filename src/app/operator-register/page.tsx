
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
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import OtpInput from 'react-otp-input';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function OperatorRegisterPage() {
  const [operatorName, setOperatorName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const router = useRouter();
  const { auth, firestore } = useFirebase();

  useEffect(() => {
    if (!auth) return;

    // Ensure this runs only once and the container exists.
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'normal',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
        'expired-callback': () => {
          setError("reCAPTCHA has expired. Please try again.");
        }
      });
    }

    // Cleanup on unmount
    return () => {
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
      }
    };
  }, [auth]);


  const handleSendOtp = async () => {
    setError(null);
    if (!operatorName || !email || !password) {
        setError("Please fill in all required fields.");
        return;
    }
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!auth || !firestore) {
      setError("Firebase is not initialized.");
      return;
    }

    try {
      const verifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, `+91${phone}`, verifier);
      setConfirmationResult(result);
      setIsOtpSent(true);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/captcha-check-failed') {
          setError("reCAPTCHA check failed. This usually means your app's domain is not authorized in the Firebase Console. Go to Authentication -> Settings -> Authorized Domains and add your development domain. For local development, this is often 'localhost'.");
      } else if (err.code === 'auth/too-many-requests') {
          setError("You've made too many requests. Please use a test number (e.g., '9999999999' with OTP '123456') for development or try again later.");
      } else {
        setError(`Failed to send OTP: ${err.message}`);
      }
    }
  };

  const handleVerifyOtpAndRegister = async () => {
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
      // First, create the user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with operator name
      await updateProfile(user, { displayName: operatorName });

      // After creating the user, confirm the OTP. This will link the phone number.
      await confirmationResult.confirm(otp);

      // Create operator document in Firestore
      const operatorDocRef = doc(firestore, 'busOperators', user.uid);
      const operatorData = {
        id: user.uid,
        name: operatorName,
        contactNumber: user.phoneNumber || `+91${phone}`, // Use verified number
        email: user.email,
      };

      setDocumentNonBlocking(operatorDocRef, operatorData, {});
      
      setIsSuccess(true);

    } catch (err: any) {
      setError(`Failed to register: ${err.message}`);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-12 bg-background">
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-display">Create an Operator Account</CardTitle>
            <CardDescription>
              {isOtpSent ? "Enter the OTP sent to your phone" : "Enter your details to get an OTP"}
            </CardDescription>
             <CardDescription className="text-xs text-blue-600 pt-2">
                <strong>Development Note:</strong> If you see a CAPTCHA error, authorize your domain in the Firebase Console or use a test number like <code className="font-mono">9999999999</code> with test OTP <code className="font-mono">123456</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {!isOtpSent ? (
                <>
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
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="operator@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                   <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
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
                  <div id="recaptcha-container" className="my-4 flex justify-center"></div>
                  <Button onClick={handleSendOtp} className="w-full bg-primary hover:bg-primary/90" disabled={phone.length !== 10 || !operatorName || !email || !password}>
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
                  <Button onClick={handleVerifyOtpAndRegister} className="w-full bg-primary hover:bg-primary/90" disabled={otp.length !== 6}>
                    Verify OTP & Register
                  </Button>
                </>
              )}
              {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
            </div>
            
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/operator-login" className="underline">
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
              Your operator account has been created. Please log in to access your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => router.push('/operator-login')}>
              Proceed to Login
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
