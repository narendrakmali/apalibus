'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { initializeFirebase } from '@/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { Bus, PlusCircle, Calendar } from 'lucide-react';

export default function OperatorDashboardPage() {
  const { auth, firestore } = initializeFirebase();
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  const [operatorName, setOperatorName] = useState('');
  
  const isLoading = authLoading;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/operator-login');
      return;
    }

    const fetchOperatorData = async () => {
        const operatorDocRef = doc(firestore, "busOperators", user.uid);
        const operatorDoc = await getDoc(operatorDocRef);
        if (operatorDoc.exists()) {
            setOperatorName(operatorDoc.data().name);
        } else {
            // This user is not a registered operator, sign them out and redirect
            await auth.signOut();
            router.push('/operator-login');
        }
    };
    fetchOperatorData();

  }, [user, authLoading, router, auth, firestore]);
  
  const handleLogout = async () => {
    await auth.signOut();
    router.push('/operator-login');
  };

  if (isLoading || !user) {
    return (
        <div className="container mx-auto py-8 px-4 md:px-6">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-6 w-96 mb-10" />
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
             <Skeleton className="h-40 w-full mt-8" />
        </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <header className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold font-display text-primary">Operator Dashboard</h1>
            <div className="text-muted-foreground">
                Welcome back, {operatorName ? <strong>{operatorName}</strong> : user.email}. Manage your operations from here.
            </div>
        </div>
        <Button onClick={handleLogout} variant="outline">Logout</Button>
      </header>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Manage Fleet</CardTitle>
            <Bus className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <CardDescription>View bus schedules and manage your fleet.</CardDescription>
             <Button asChild className="mt-4" variant="secondary">
                <Link href="/operator-dashboard/fleet">Manage Fleet</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Add New Bus</CardTitle>
             <PlusCircle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>Add a new bus to your fleet.</CardDescription>
             <Button asChild className="mt-4" variant="secondary" disabled>
                <Link href="#">Coming Soon</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Manage Bookings</CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>Review and respond to booking requests.</CardDescription>
             <Button asChild className="mt-4" variant="secondary" disabled>
                <Link href="#">Manage Bookings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

       <Card>
          <CardHeader>
            <CardTitle>Upcoming Journeys</CardTitle>
            <CardDescription>A summary of trips scheduled for the next 24 hours.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
                Upcoming journeys will be displayed here.
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
