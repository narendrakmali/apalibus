'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, Bus, BarChart3, Settings, CalendarCheck } from 'lucide-react';
import Link from 'next/link';
import { useAdminDashboardData } from '@/hooks/use-admin-dashboard-data';
import { Skeleton } from '@/components/ui/skeleton';

const adminSections = [
  {
    title: 'User Management',
    description: 'View, edit, and manage user accounts.',
    icon: <Users className="h-8 w-8 text-primary" />,
    href: '/admin/users',
  },
  {
    title: 'Operator Management',
    description: 'View, and manage bus operators and their fleet.',
    icon: <Bus className="h-8 w-8 text-primary" />,
    href: '/admin/operators',
  },
  {
    title: 'Booking Analytics',
    description: 'Platform-wide revenue and booking trends.',
    icon: <BarChart3 className="h-8 w-8 text-primary" />,
    href: '/admin/analytics',
  },
  {
    title: 'System Settings',
    description: 'Configure fare rules and platform parameters.',
    icon: <Settings className="h-8 w-8 text-primary" />,
    href: '/admin/settings',
  },
];

export default function AdminDashboardPage() {
  const { stats, isLoading } = useAdminDashboardData();

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Platform-wide overview of operators, users, and bookings.
        </p>
      </header>
      
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats.totalUsers}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Operators</CardTitle>
            <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats.totalOperators}</div>}
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Booking Requests</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats.totalBookingRequests}</div>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {adminSections.map((section) => (
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
              <CardTitle>Top Performing Operators</CardTitle>
              <CardDescription>A summary of operators by booking count will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-12">
                <p>Performance charts coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
