
'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import { useFirebase } from '@/firebase';
  import { Bus, PlusCircle, CalendarDays } from 'lucide-react';
  import Link from 'next/link';
  import { useRouter } from 'next/navigation';
  
  const operatorSections = [
    {
      title: 'Manage Fleet',
      description: 'View, edit, and manage all your buses.',
      icon: <Bus className="h-8 w-8 text-primary" />,
      href: '/operator/fleet',
    },
    {
      title: 'Add New Bus',
      description: 'Add a new bus to your fleet.',
      icon: <PlusCircle className="h-8 w-8 text-primary" />,
      href: '/operator/add-bus',
    },
    {
      title: 'View Bookings',
      description: 'See all upcoming and past bookings.',
      icon: <CalendarDays className="h-8 w-8 text-primary" />,
      href: '/operator/bookings',
    },
  ];
  
  export default function OperatorDashboardPage() {
    const { user, isUserLoading } = useFirebase();
    const router = useRouter();
  
    if (isUserLoading) {
      return <div>Loading...</div>;
    }
  
    if (!user) {
        router.push('/operator-login');
        return null;
    }

    return (
      <div className="container mx-auto py-12 px-4 md:px-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Operator Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user.displayName || user.email}. Manage your operations from here.
          </p>
        </header>
  
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {operatorSections.map((section) => (
            <Link href={section.href} key={section.title}>
              <Card className="hover:border-primary hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-medium">{section.title}</CardTitle>
                  {section.icon}
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
  
         <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Journeys</CardTitle>
                <CardDescription>A summary of trips scheduled for the next 24 hours.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-12">
                  <p>Upcoming journeys will be displayed here.</p>
                </div>
              </CardContent>
            </Card>
          </div>
      </div>
    );
  }
  