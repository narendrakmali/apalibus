
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ticket, User, LogOut, Clock, CheckCircle, XCircle } from 'lucide-react';
import Header from '@/components/common/header';
import { useAuth, useFirestore, useUser, useMemoFirebase, useDoc, useCollection } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc, collection, query, where } from 'firebase/firestore';
import { EditProfileDialog } from '@/components/dashboard/edit-profile-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
}

type Booking = {
    id: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    journeyDate: { toDate: () => Date };
    busDetails: {
        operatorName: string;
        registrationNumber: string;
    };
    startLocation: string;
    destination: string;
}

export default function DashboardPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);
  
  const adminRoleRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [firestore, user?.uid]);

  const { data: adminRole, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);
  
  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'bookings'), where('userId', '==', user.uid));
  }, [firestore, user?.uid]);

  const { data: bookings, isLoading: areBookingsLoading } = useCollection<Booking>(bookingsQuery);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (!isAdminRoleLoading && adminRole) {
        router.push('/admin/dashboard');
    }
  }, [adminRole, isAdminRoleLoading, router]);


  useEffect(() => {
    if (userDocRef) {
      setIsProfileLoading(true);
      getDoc(userDocRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else if(user) {
            // Create profile if it doesn't exist, happens for users created before profile storage
            const newProfile: UserProfile = {
                id: user.uid,
                name: user.displayName || 'New User',
                email: user.email || '',
                phone: user.phoneNumber || ''
            };
            setDoc(userDocRef, newProfile).then(() => setProfile(newProfile));
          }
        })
        .catch((error) => {
          console.error("Error fetching user profile:", error);
          toast({ variant: 'destructive', title: "Error", description: "Could not fetch your profile." });
        })
        .finally(() => {
          setIsProfileLoading(false);
        });
    } else if (!user) {
        setIsProfileLoading(false);
    }
  }, [userDocRef, user, toast]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle className="mr-1 h-3 w-3" />Confirmed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };


  if (isUserLoading || isProfileLoading || isAdminRoleLoading || areBookingsLoading || !user || !profile || adminRole) {
    return (
       <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col min-h-screen bg-secondary">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
          <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary">
                  Welcome, {profile.name || 'User'}!
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
                          {areBookingsLoading ? (
                             <Skeleton className="h-24 w-full" />
                          ) : bookings && bookings.length > 0 ? (
                            <div className="space-y-4">
                                {bookings.map(booking => (
                                    <Card key={booking.id}>
                                        <CardContent className="p-4 flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold">{booking.busDetails.operatorName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {booking.startLocation} to {booking.destination}
                                                </p>
                                                <p className="text-sm font-medium">
                                                    On: {format(booking.journeyDate.toDate(), 'PPP')}
                                                </p>
                                            </div>
                                            {getStatusBadge(booking.status)}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                          ) : (
                            <div className="border rounded-lg p-4 text-center">
                                <p className="text-muted-foreground">You have no recent bookings.</p>
                                <Button className="mt-4" asChild>
                                    <Link href="/">Book a Trip</Link>
                                </Button>
                            </div>
                          )}
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
                                  <p className="text-muted-foreground">{profile.name}</p>
                             </div>
                             <div>
                                  <p className="font-semibold">Email</p>
                                  <p className="text-muted-foreground">{profile.email}</p>
                             </div>
                             <div>
                                  <p className="font-semibold">Phone</p>
                                  <p className="text-muted-foreground">{profile.phone || "Not provided"}</p>
                             </div>
                              <Button variant="outline" className="w-full" onClick={() => setIsEditDialogOpen(true)}>Edit Profile</Button>
                          </div>
                      </CardContent>
                  </Card>
              </div>
          </div>
        </main>
      </div>
      <EditProfileDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        userProfile={profile}
        onProfileUpdate={handleProfileUpdate}
       />
    </>
  );
}
