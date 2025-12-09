
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import placeholderImages from '@/lib/placeholder-images.json';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().isAdmin) {
        router.push('/admin');
      } else {
        await auth.signOut();
        setError("You do not have administrative privileges.");
      }

    } catch (err: any) {
      let errorMessage = "An unknown error occurred during login.";
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = "Invalid email or password.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid email address.";
          break;
        default:
          console.error("Admin Login Error:", err);
          break;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4">
       <Image
          src={placeholderImages.busTerminal.src}
          alt={placeholderImages.busTerminal.alt}
          data-ai-hint={placeholderImages.busTerminal.hint}
          fill
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-black/60 z-10" />

      <Card className="w-full max-w-md z-20 bg-background/80 backdrop-blur-sm border-white/20 text-foreground">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-display text-primary">Admin Access</CardTitle>
          <CardDescription className="text-muted-foreground/90">Please sign in to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/10 border-white/20 focus:bg-white/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                 className="bg-white/10 border-white/20 focus:bg-white/20"
              />
            </div>
            {error && <p className="text-center text-sm text-destructive bg-destructive/20 p-2 rounded-md">{error}</p>}
            <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base">
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
