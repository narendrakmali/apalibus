
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OperatorRegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const handleRegister = async () => {
    setError(null);
    

    if (!name || !email || !password || !confirmPassword || !contactNumber) {
      setError("Please fill in all fields.");
      
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save operator details to the 'busOperators' collection
      await setDoc(doc(firestore, "busOperators", user.uid), {
        id: user.uid,
        name: name,
        email: user.email,
        contactNumber: contactNumber,
        busIds: [],
      });

      console.log("Operator registered successfully!");
      router.push('/operator-login'); // Redirect to login page after successful registration

    } catch (err: any) {
      console.error("Operator Registration Error:", err);
      let errorMessage = "An unknown error occurred during registration.";
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = "This email address is already registered. Please use a different email or log in.";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      } else if (err.code === 'auth/weak-password') {
        errorMessage = "The password is too weak. It must be at least 6 characters long.";
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
          <CardTitle className="text-2xl font-display">Operator Registration</CardTitle>
          <CardDescription>Create an account to manage your buses and bookings.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Operator Name</Label>
              <Input id="name" type="text" placeholder="Enter your business name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="contact-number">Contact Number</Label>
              <Input id="contact-number" type="tel" placeholder="Enter your contact number" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required />
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
            <Button onClick={handleRegister} disabled={isLoading} className="w-full">
              {isLoading ? 'Registering...' : 'Register as Operator'}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Already have an operator account?{' '}
              <Link href="/operator-login" className="underline hover:text-primary">
                Login here
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
