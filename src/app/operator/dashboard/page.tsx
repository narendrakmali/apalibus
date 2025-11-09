
'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import { useFirebase } from '@/firebase';
  import { useUserRole } from '@/hooks/use-user-role';
  import { Bus, PlusCircle, CalendarDays } from 'lucide-react';
  import Link from 'next/link';
  import { useRouter } from 'next/navigation';
  import { useEffect } from 'react';
  
  const operatorSections = [
    {
      title: 'Manage Fleet',
      description: 'View bus schedules and manage your fleet.',
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
      title: 'Manage Bookings',
      description: 'Review and respond to booking requests.',
      icon: <CalendarDays className="h-8 w-8 text-primary" />,
      href: '/operator/bookings',
    },
  ];
  
  export default function OperatorDashboardPage() {
    const { user, isUserLoading } = useFirebase();
    const { role, isLoading: isRoleLoading } = useUserRole();
    const router = useRouter();
  
    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/operator-login');
            return;
        }
        if (!isRoleLoading && role && role !== 'operator') {
            router.push('/');
        }
    }, [isUserLoading, user, isRoleLoading, role, router]);

    if (isUserLoading || isRoleLoading || !user || !role) {
      return (
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
            <p>Loading and verifying access...</p>
        </div>
      );
    }
    
    if (role !== 'operator') {
        return (
             <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
                <p>Access Denied. Redirecting...</p>
            </div>
        );
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
              <Card className="hover:border8-primary hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
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
              </Header>
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
