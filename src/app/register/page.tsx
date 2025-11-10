'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import PinInput from 'react-otp-input';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const { auth, firestore } = initializeFirebase();
  const router = useRouter();


  const handleSendOtp = async () => {
    setError(null);
    if (!auth) {
        setError("Firebase Auth is not initialized.");
        return;
    }
     if (!phone || phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    try {
      // Use a fresh verifier each time to avoid "DUPE" errors
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
      const result = await signInWithPhoneNumber(auth, `+91${phone}`, recaptchaVerifier);
      setConfirmationResult(result);
      setIsOtpSent(true);
    } catch (err: any) {
      console.error("OTP Send Error:", err);
      let errorMessage = "Failed to send OTP. Please ensure your domain is authorized in the Firebase console and try again.";
       if (err.code === 'auth/invalid-phone-number') {
        errorMessage = "The phone number is not valid.";
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "You've requested an OTP too many times. Please try again later.";
      } else if (err.code === 'auth/captcha-check-failed') {
        errorMessage = "reCAPTCHA verification failed. Please make sure this app's domain is authorized in the Firebase console for Authentication.";
      }
      setError(errorMessage);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    if (!name || !email) {
      setError("Please fill in your name and email.");
      return;
    }

    if (!confirmationResult) {
      setError("Something went wrong. Please try sending the OTP again.");
      return;
    }

    try {
      const userCredential = await confirmationResult.confirm(otp);
      const user = userCredential.user;

      // Save user details to Firestore
      await setDoc(doc(firestore, "users", user.uid), {
        id: user.uid,
        name: name,
        email: email,
        mobileNumber: user.phoneNumber,
        address: "", // Can be collected later
        pincode: "", // Can be collected later
        isAdmin: false, // Default to not admin
      });

      console.log("User registered successfully!");
      router.push('/'); // Redirect to home page after successful registration

    } catch (err: any) {
      console.error("OTP Verification Error:", err);
       let errorMessage = "Failed to verify OTP. Please check the code and try again.";
      if (err.code === 'auth/invalid-verification-code') {
        errorMessage = "The OTP you entered is incorrect.";
      } else if (err.code === 'auth/code-expired') {
        errorMessage = "The OTP has expired. Please send a new one.";
      }
      setError(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-secondary/50 py-12 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-display">Create an Account</CardTitle>
          <CardDescription>Sign up to start booking your trips.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!isOtpSent ? (
              <>
                 <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" type="text" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                   <div className="flex items-center gap-2">
                      <span className="p-2 bg-muted rounded-md text-sm">+91</span>
                      <Input id="phone" type="tel" placeholder="10-digit mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={10} required />
                   </div>
                </div>
                <Button onClick={handleSendOtp} className="w-full">Send OTP</Button>
              </>
            ) : (
              <>
                <div className="space-y-2 text-center">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <p className="text-sm text-muted-foreground">An OTP has been sent to +91 {phone}</p>
                   <PinInput
                        value={otp}
                        onChange={setOtp}
                        length={6}
                        inputStyle={{
                            width: '2.5rem',
                            height: '2.5rem',
                            margin: '0 0.25rem',
                            fontSize: '1.25rem',
                            borderRadius: '4px',
                            border: '1px solid hsl(var(--border))',
                            textAlign: 'center',
                            backgroundColor: 'hsl(var(--background))',
                            color: 'hsl(var(--foreground))'
                        }}
                        containerStyle={{
                            justifyContent: 'center'
                        }}
                        focusStyle={{
                            border: '1px solid hsl(var(--ring))',
                            outline: 'none'
                        }}
                    />
                </div>
                <Button onClick={handleVerifyOtp} className="w-full">Verify OTP & Register</Button>
                <Button variant="link" onClick={() => setIsOtpSent(false)} className="w-full">
                  Change Number
                </Button>
              </>
            )}
            {error && <p className="text-center text-sm text-destructive">{error}</p>}
            <div id="recaptcha-container" className="flex justify-center mt-4"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
