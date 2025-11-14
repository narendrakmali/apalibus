
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
import { Bus, PlusCircle, Calendar, TrendingUp, Users } from 'lucide-react';

export default function OperatorDashboardPage() {
  const { auth, firestore } = initializeFirebase();
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  const [operatorName, setOperatorName] = useState('');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  
  useEffect(() => {
    // Redirect unauthenticated users immediately
    if (!authLoading && !user) {
      router.push('/operator-login');
      return;
    }

    const fetchOperatorData = async () => {
        if (!user) return; // Wait for user object
        try {
            const operatorDocRef = doc(firestore, "busOperators", user.uid);
            const operatorDoc = await getDoc(operatorDocRef);
            if (operatorDoc.exists()) {
                setOperatorName(operatorDoc.data().name);
            } else {
                // Handle case where user is authenticated but not an operator
                setVerificationError("This account is not registered as an operator.");
                await auth.signOut();
                router.push('/operator-login');
            }
        } catch (error) {
             console.error("Error fetching operator data:", error);
             setVerificationError("An error occurred while verifying your operator status.");
        }
    };

    if(user) {
      fetchOperatorData();
    }

  }, [user, authLoading, router, auth, firestore]);
  
  const handleLogout = async () => {
    await auth.signOut();
    router.push('/operator-login');
  };
  
  const isLoading = authLoading || (!!user && !operatorName && !verificationError);

  if (isLoading) {
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
    );
  }

  if (verificationError) {
      return (
        <div className="container mx-auto py-8 px-4 md:px-6 text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
            <p className="text-muted-foreground">{verificationError}</p>
            <Button asChild className="mt-4">
                <Link href="/operator-login">Go to Login</Link>
            </Button>
        </div>
      )
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <header className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold font-display text-primary">Operator Dashboard</h1>
            <div className="text-muted-foreground">
                Welcome back, {operatorName ? <strong>{operatorName}</strong> : user?.email}. Manage your operations from here.
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
             <Button asChild className="mt-4">
                <Link href="/operator-dashboard/add-bus">Add Bus</Link>
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
             <Button asChild className="mt-4">
                <Link href="/operator-dashboard/requests">Manage Bookings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

        <Card className="mb-12">
            <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
                <CardDescription>A quick overview of today's booking activity.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                    <Bus className="h-8 w-8 text-primary" />
                    <div>
                        <p className="text-sm text-muted-foreground">Buses Booked Today</p>
                        <p className="text-2xl font-bold">5</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                    <Users className="h-8 w-8 text-primary" />
                    <div>
                        <p className="text-sm text-muted-foreground">Total Seats Booked</p>
                        <p className="text-2xl font-bold">128</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-primary" />
                    <div>
                        <p className="text-sm text-muted-foreground">Revenue Estimate</p>
                        <p className="text-2xl font-bold">85,000</p>
                    </div>
                </div>
            </CardContent>
        </Card>

       <Card>
          <CardHeader>
            <CardTitle>Upcoming Journeys</CardTitle>
            <CardDescription>A summary of trips scheduled for the next 24 hours.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
                Upcoming journeys will be be displayed here.
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
