'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Book, Users, Bus } from 'lucide-react';
import { initializeFirebase } from '@/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardPage() {
  const { auth } = initializeFirebase();
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);


  if (loading || !user) {
    return (
        <div className="container mx-auto py-8 px-4 md:px-6">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-6 w-80 mb-10" />
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        </div>
    )
  }

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/admin/login');
  };
  
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
       <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.email}.</p>
        </div>
        <Button onClick={handleLogout} variant="outline">Logout</Button>
      </header>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Booking Requests</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <CardDescription>View and manage all user booking requests.</CardDescription>
             <Button asChild className="mt-4">
                <Link href="/admin/requests">Manage Requests</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Operators</CardTitle>
             <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>Manage bus operators and their fleets.</CardDescription>
             <Button asChild className="mt-4">
                <Link href="/admin/operators">Manage Operators</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>View and manage registered users.</CardDescription>
             <Button asChild className="mt-4">
                <Link href="/admin/users">Manage Users</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
