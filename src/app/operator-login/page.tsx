
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
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function OperatorLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { auth, firestore } = useFirebase();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!auth || !firestore) {
        setError("Firebase is not initialized.");
        return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if the user is an operator
      const operatorDocRef = doc(firestore, 'busOperators', user.uid);
      const operatorDocSnap = await getDoc(operatorDocRef);

      if (operatorDocSnap.exists()) {
        // User is an operator, redirect to operator dashboard
        router.push('/operator/dashboard');
      } else {
        // Not an operator, sign them out and show an error
        await signOut(auth);
        setError('This account does not have operator privileges. Please use the user login.');
      }
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else {
        setError(error.message);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-12 bg-background">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-display">Operator Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your operator account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="#"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Login
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Not an operator?{' '}
            <Link href="/user-login" className="underline">
              User Login
            </Link>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an operator account?{' '}
            <Link href="/operator-register" className="underline">
              Register as an operator
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
