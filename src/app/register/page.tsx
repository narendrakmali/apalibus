
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
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import OtpInput from 'react-otp-input';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function RegisterPage() {
  const [name, setName] = useState('');
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

  const handleSendOtp = async () => {
    setError(null);
    if (!name || !email || !password) {
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
      // Ensure the container is clean before rendering a new verifier
      const recaptchaContainer = document.getElementById('recaptcha-container');
      if (recaptchaContainer) {
        recaptchaContainer.innerHTML = '';
      }

      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'normal',
        'callback': () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
        'expired-callback': () => {
          setError("reCAPTCHA has expired. Please try again.");
        }
      });
      
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
      // Confirm the OTP to get the phone credential
      const phoneCredential = await confirmationResult.confirm(otp);
      
      // Create the user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Link the phone credential to the newly created user account
      // This is a placeholder for a more complex account linking flow if needed,
      // for now, we will store the phone number in the user's document.
      await updateProfile(user, { displayName: name });
      
      const userDocRef = doc(firestore, 'users', user.uid);
      const userData = {
        id: user.uid,
        email: user.email,
        mobileNumber: phoneCredential.user.phoneNumber || `+91${phone}`, // Use the verified phone number
        name: name,
        address: "",
        pincode: "",
        isAdmin: false,
      };

      setDocumentNonBlocking(userDocRef, userData, {});

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
            <CardTitle className="text-2xl font-display">Create a User Account</CardTitle>
            <CardDescription>
              {isOtpSent ? "Enter the OTP sent to your phone" : "Enter your details to receive an OTP"}
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
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                   <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
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
                  <Button onClick={handleSendOtp} className="w-full bg-primary hover:bg-primary/90" disabled={phone.length !== 10 || !name || !email || !password}>
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
