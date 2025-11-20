'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore } from '@/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, createUserWithEmailAndPassword, ConfirmationResult } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import OtpInput from 'react-otp-input';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function RegisterPage() {
  const [step, setStep] = useState(1); // 1 for details, 2 for OTP
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          console.log("reCAPTCHA verified");
        }
      });
    }
    return window.recaptchaVerifier;
  };

  const handleSendOtp = async () => {
    setError(null);
    setIsLoading(true);

    if (!name || !email || !password || !confirmPassword || !mobileNumber) {
      setError("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (!/^\+?[1-9]\d{1,14}$/.test(mobileNumber) && mobileNumber.length < 10) {
        setError("Please enter a valid mobile number.");
        setIsLoading(false);
        return;
    }
    
    // Format phone number for Firebase
    const formattedPhoneNumber = mobileNumber.startsWith('+') ? mobileNumber : `+91${mobileNumber}`;

    try {
      const recaptchaVerifier = setupRecaptcha();
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhoneNumber, recaptchaVerifier);
      window.confirmationResult = confirmationResult;
      setStep(2); // Move to OTP step
      
    } catch (err: any) {
      console.error("OTP Send Error:", err);
      let errorMessage = "Failed to send OTP. Please try again.";
      if (err.code === 'auth/invalid-phone-number') {
        errorMessage = "The phone number is not valid.";
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtpAndRegister = async () => {
    setError(null);
    setIsLoading(true);

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      setIsLoading(false);
      return;
    }

    if (!window.confirmationResult) {
       setError("Verification process expired. Please try again.");
       setIsLoading(false);
       setStep(1); // Go back to details step
       return;
    }

    try {
      await window.confirmationResult.confirm(otp);
      
      // OTP is correct, now create the user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user details to Firestore
      await setDoc(doc(firestore, "users", user.uid), {
        id: user.uid,
        name: name,
        email: user.email,
        mobileNumber: mobileNumber,
        address: "",
        pincode: "",
        isAdmin: false,
      });

      console.log("User registered and phone verified successfully!");
      alert("Registration successful! You will now be redirected to the login page.");
      router.push('/login');

    } catch (err: any) {
      console.error("Registration Error:", err);
      let errorMessage = "An unknown error occurred during registration.";
       if (err.code === 'auth/invalid-verification-code') {
        errorMessage = "The OTP you entered is incorrect. Please try again.";
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = "This email address is already registered.";
      } else if (err.code === 'auth/weak-password') {
        errorMessage = "The password is too weak. It must be at least 6 characters long.";
      }
      setError(errorMessage);
       if(err.code !== 'auth/invalid-verification-code'){
         setStep(1); // Go back to details if it's not an OTP error
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-secondary/50 py-12 px-4">
      <div id="recaptcha-container"></div>
      <Card className="w-full max-w-md shadow-xl">
        {step === 1 ? (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-display">Create an Account (Step 1/2)</CardTitle>
              <CardDescription>Sign up to start booking your trips.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" type="text" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input id="mobile" type="tel" placeholder="e.g., 9876543210" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" type="password" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
                {error && <p className="text-center text-sm text-destructive">{error}</p>}
                <Button onClick={handleSendOtp} disabled={isLoading} className="w-full">
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </div>
            </CardContent>
          </>
        ) : (
           <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-display">Verify Phone (Step 2/2)</CardTitle>
              <CardDescription>Enter the 6-digit OTP sent to {mobileNumber}.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="space-y-6">
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={6}
                    containerStyle="flex justify-center gap-2"
                    renderInput={(props) => <Input {...props} className="!w-12 text-center text-lg" />}
                    shouldAutoFocus
                  />
                  {error && <p className="text-center text-sm text-destructive">{error}</p>}
                  <Button onClick={handleVerifyOtpAndRegister} disabled={isLoading} className="w-full">
                    {isLoading ? 'Verifying...' : 'Verify & Register'}
                  </Button>
                   <div className="text-center text-sm">
                        <Button variant="link" onClick={() => { setStep(1); setError(null); }}>
                            Back to details
                        </Button>
                   </div>
               </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
