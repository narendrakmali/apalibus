
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAdminData } from '@/hooks/use-admin-data';
import { OperatorsTable } from '@/components/admin/operators-table';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

export default function AdminOperatorsPage() {
  const auth = useAuth();
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  const [dataVersion, setDataVersion] = useState(0);
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  const { operators, loading: dataLoading } = useAdminData(dataVersion);
  
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
        <h1 className="text-3xl font-bold font-display text-primary">Manage Bus Operators</h1>
        <p className="text-muted-foreground">View and manage all registered bus operators.</p>
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle>All Operators</CardTitle>
              {isLoading ? (
                <Skeleton className="h-5 w-48 mt-1" />
              ) : (
                <CardDescription>
                  A total of {operators.length} operators found.
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
                <OperatorsTable operators={operators} onOperatorDeleted={handleDataChange}/>
            )}
          </CardContent>
      </Card>
    </div>
  );
}
