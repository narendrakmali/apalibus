"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ticket, User, LogOut, Phone } from 'lucide-react';
import Header from '@/components/common/header';
import { useAuth, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { EditProfileDialog } from '@/components/dashboard/edit-profile-dialog';

type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
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

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

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
    await signOut(auth);
    router.push('/');
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  if (isUserLoading || isProfileLoading || !user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
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
                          <div className="border rounded-lg p-4 text-center">
                              <p className="text-muted-foreground">You have no recent bookings.</p>
                              <Button className="mt-4" asChild>
                                <Link href="/">Book a Trip</Link>
                              </Button>
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
