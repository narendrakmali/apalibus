
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAdminData } from '@/hooks/use-admin-data';
import { MsrtcRequestsTable } from '@/components/admin/msrtc-requests-table';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

export default function AdminMsrtcRequestsPage() {
  const auth = useAuth();
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  
  // A simple state to trigger re-fetch in the hook
  const [dataVersion, setDataVersion] = useState(0);
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  const { msrtcBookings, loading: dataLoading } = useAdminData(dataVersion);
  
  const isLoading = authLoading || dataLoading;
  
  const handleDataChange = useCallback(() => {
    setDataVersion(v => v + 1);
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8">
        <Button asChild variant="outline" size="sm" className="mb-4">
            <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Link>
        </Button>
        <h1 className="text-3xl font-bold font-display text-primary">Manage MSRTC Group Requests</h1>
        <p className="text-muted-foreground">Review and manage all MSRTC group booking requests.</p>
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle>All MSRTC Requests</CardTitle>
              {isLoading ? (
                <Skeleton className="h-5 w-48 mt-1" />
              ) : (
                <CardDescription>
                  A total of {msrtcBookings.length} MSRTC requests found.
                </CardDescription>
              )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : (
                <MsrtcRequestsTable requests={msrtcBookings} onStatusChange={handleDataChange} />
            )}
          </CardContent>
      </Card>
    </div>
  );
}
