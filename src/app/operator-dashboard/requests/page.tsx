'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useOperatorData } from '@/hooks/use-operator-data';
import { RequestsTable } from '@/components/admin/requests-table';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OperatorRequestsPage() {
  const auth = useAuth();
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/operator-login');
    }
  }, [user, authLoading, router]);

  const { requests, loading: requestsLoading } = useOperatorData(user?.uid);
  
  const isLoading = authLoading || requestsLoading;

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8">
        <Button asChild variant="outline" size="sm" className="mb-4">
            <Link href="/operator-dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Link>
        </Button>
        <h1 className="text-3xl font-bold font-display text-primary">Manage Booking Requests</h1>
        <p className="text-muted-foreground">Review, approve, or reject incoming user requests.</p>
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle>All Requests</CardTitle>
              {isLoading ? (
                <Skeleton className="h-5 w-48 mt-1" />
              ) : (
                <CardDescription>
                  A total of {requests.length} requests found.
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
                <RequestsTable requests={requests} />
            )}
          </CardContent>
      </Card>
    </div>
  );
}
