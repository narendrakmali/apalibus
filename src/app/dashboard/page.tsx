"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ticket, User, LogOut } from 'lucide-react';
import Header from '@/components/common/header';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };
  
  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-secondary">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary">
                Welcome, {user.displayName || 'User'}!
            </h1>
            <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Ticket className="mr-3 text-accent" />
                            My Recent Bookings
                        </CardTitle>
                        <CardDescription>
                            Here are the details of your recent bus bookings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg p-4 text-center">
                            <p className="text-muted-foreground">You have no recent bookings.</p>
                            <Button className="mt-4">Book a Trip</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="md:col-span-1">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <User className="mr-3 text-accent" />
                            My Profile
                        </CardTitle>
                         <CardDescription>
                            Manage your account details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                           <div>
                                <p className="font-semibold">Name</p>
                                <p className="text-muted-foreground">{user.displayName}</p>
                           </div>
                           <div>
                                <p className="font-semibold">Email</p>
                                <p className="text-muted-foreground">{user.email}</p>
                           </div>
                            <Button variant="outline" className="w-full">Edit Profile</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
    </div>
  );
}
