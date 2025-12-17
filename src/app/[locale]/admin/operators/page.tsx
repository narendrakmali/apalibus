'use client';
import { Link } from '@/navigation';
import { Button } from "@/components/ui/button";
import { useAdminData } from '@/hooks/use-admin-data';
import { OperatorsTable } from '@/components/admin/operators-table';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

export default function OperatorsPage() {
    const [version, setVersion] = useState(0);
    const { operators, loading, error } = useAdminData(version);
    
    const refreshData = () => setVersion(v => v + 1);

    return (
        <div className="container mx-auto py-8 px-4 md:px-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Bus Operators</h1>
                <Button asChild>
                    <Link href="/admin">Back to Dashboard</Link>
                </Button>
            </div>
            
             <div className="border rounded-lg bg-white shadow-sm">
                {loading ? (
                    <div className="p-4 space-y-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : error ? (
                    <p className="text-destructive text-center p-8">Error loading operators: {error.message}</p>
                ) : (
                    <OperatorsTable operators={operators} onOperatorDeleted={refreshData} />
                )}
            </div>
        </div>
    );
}
