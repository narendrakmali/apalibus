
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

export default function OperatorLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const handleLogin = async () => {
    setError(null);
    setIsLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password.");
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if the user is a registered operator in the 'busOperators' collection
      const operatorDocRef = doc(firestore, 'busOperators', user.uid);
      const operatorDoc = await getDoc(operatorDocRef);

      if (operatorDoc.exists()) {
        // User is a registered operator, proceed to dashboard
        router.push('/operator-dashboard');
      } else {
        // Not an operator
        await auth.signOut();
        setError("This account is not registered as an operator.");
      }

    } catch (err: any) {
      let errorMessage = "An unknown error occurred.";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password.";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      }
      console.error("Operator Login Error:", err);
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
          <CardDescription>Enter your credentials to access the operator dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="operator@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-center text-sm text-destructive">{error}</p>}
            <Button onClick={handleLogin} disabled={isLoading} className="w-full">
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
             <div className="text-center text-sm text-muted-foreground">
              Don't have an operator account?{' '}
              <Link href="/operator-register" className="underline hover:text-primary">
                Register here
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
