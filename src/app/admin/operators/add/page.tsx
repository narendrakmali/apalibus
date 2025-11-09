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
import { createOperatorWithEmail } from '@/firebase/non-blocking-updates';
import { useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AddOperatorPage() {
  const [operatorName, setOperatorName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { auth, firestore } = useFirebase();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!auth || !firestore) {
      setError('Firebase is not initialized.');
      return;
    }
    if (!operatorName || !email || !password) {
        setError("All fields are required.");
        return;
    }

    try {
        await createOperatorWithEmail(auth, firestore, { operatorName, email, password });
        setSuccess('Operator created successfully! Redirecting...');
        setTimeout(() => router.push('/admin/operators'), 2000);
    } catch (err: any) {
        setError(err.message);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Operator</CardTitle>
          <CardDescription>
            Use this form to create a new bus operator account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="operator-name">Operator Name</Label>
                <Input
                  id="operator-name"
                  placeholder="e.g., Happy Travels"
                  required
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Operator Email</Label>
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
              
              <div className="mt-4">
                 {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                 {success && <p className="text-green-500 text-sm mb-4">{success}</p>}
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  Create Operator
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
