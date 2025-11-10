'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import PinInput from 'react-otp-input';

export default function OperatorLoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { auth, firestore } = initializeFirebase();
  const router = useRouter();

  const handleSendOtp = async () => {
    setError(null);
    setIsLoading(true);

    if (!phone || phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      setIsLoading(false);
      return;
    }

    // For development, you can use test numbers
    if (phone === '9999999999' && process.env.NODE_ENV === 'development') {
      console.log("Using test phone number. OTP will be '123456'.");
      setIsOtpSent(true);
      setIsLoading(false);
      return; // Skip sending OTP for test number
    }

    try {
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
      const result = await signInWithPhoneNumber(auth, `+91${phone}`, recaptchaVerifier);
      setConfirmationResult(result);
      setIsOtpSent(true);
    } catch (err: any) {
      console.error("OTP Send Error:", err);
      let errorMessage = "Failed to send OTP. Please try again.";
       if (err.code === 'auth/invalid-phone-number') {
        errorMessage = "The phone number is not valid.";
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "You've requested an OTP too many times. Please try again later.";
      }
      setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    setIsLoading(true);

    // Handle test number verification
    if (phone === '9999999999' && otp === '123456' && process.env.NODE_ENV === 'development') {
        // In a real scenario, you'd look up a test user. For now, we'll just redirect.
        console.log("Test operator logged in successfully.");
        router.push('/operator-dashboard');
        return;
    }

    if (!confirmationResult) {
      setError("Something went wrong. Please try sending the OTP again.");
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await confirmationResult.confirm(otp);
      const user = userCredential.user;

      // Check if user is a registered operator
      const operatorDocRef = doc(firestore, "busOperators", user.uid);
      const operatorDoc = await getDoc(operatorDocRef);

      if (operatorDoc.exists()) {
        console.log("Operator logged in successfully!");
        router.push('/operator-dashboard');
      } else {
        setError("This phone number is not registered as an operator.");
        await auth.signOut(); // Sign out the user if they are not an operator
      }

    } catch (err: any) {
      console.error("OTP Verification Error:", err);
      let errorMessage = "Failed to verify OTP. Please check the code and try again.";
      if (err.code === 'auth/invalid-verification-code') {
        errorMessage = "The OTP you entered is incorrect.";
      } else if (err.code === 'auth/code-expired') {
        errorMessage = "The OTP has expired. Please send a new one.";
      }
      setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-secondary/50 py-12 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-display">Operator Login</CardTitle>
          <CardDescription>Enter your registered phone number to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!isOtpSent ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                   <div className="flex items-center gap-2">
                      <span className="p-2 bg-muted rounded-md text-sm">+91</span>
                      <Input id="phone" type="tel" placeholder="10-digit mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={10} required />
                   </div>
                   <p className="text-xs text-muted-foreground">For dev, use 9999999999 (OTP: 123456)</p>
                </div>
                <Button onClick={handleSendOtp} disabled={isLoading} className="w-full">
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
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
                <Button onClick={handleVerifyOtp} disabled={isLoading} className="w-full">
                  {isLoading ? 'Verifying...' : 'Verify OTP & Login'}
                </Button>
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
