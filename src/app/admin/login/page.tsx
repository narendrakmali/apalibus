
'use client';

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
import { signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { auth, firestore } = useFirebase();

  const handleAdminCheck = (user: User) => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', user.uid);
      
    getDoc(userDocRef).then(userDocSnap => {
       if (userDocSnap.exists() && userDocSnap.data()?.isAdmin === true) {
        // User is an admin, proceed to dashboard
        router.push('/admin/dashboard');
      } else {
        // Not an admin, sign out and show an error
        signOut(auth);
        setError('You do not have administrative privileges.');
      }
    }).catch(err => {
        // Create and emit the detailed permission error
        const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        
        // Also sign the user out and show a generic message in the UI
        signOut(auth);
        setError('A permission error occurred while verifying your admin status.');
    });
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!auth || !firestore) {
      setError("Firebase not initialized. Please try again.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // On successful login, proceed to check for admin status
      handleAdminCheck(userCredential.user);
    } catch (err: any) {
      setError('Invalid credentials.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-12">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-display">Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin dashboard.
            <br /><br />
            <strong className="font-semibold">How to become an admin:</strong> Register a normal user, then go to your Firestore `users` collection and manually set the `isAdmin` field to `true` for that user's document.
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
                  placeholder="admin@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
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
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
