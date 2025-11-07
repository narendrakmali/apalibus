'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, Bus, BarChart3, Settings } from 'lucide-react';
import Link from 'next/link';

const adminSections = [
  {
    title: 'User Management',
    description: 'View, edit, and manage user accounts.',
    icon: <Users className="h-8 w-8 text-primary" />,
    href: '/admin/users',
  },
  {
    title: 'Operator Management',
    description: 'Approve, view, and manage bus operators.',
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
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, Admin. Here's an overview of the platform.
        </p>
      </header>

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

       {/* Placeholder for more detailed analytics */}
       <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>A log of recent platform events will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-12">
                <p>Activity feed coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
