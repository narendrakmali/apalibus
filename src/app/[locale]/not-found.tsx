
// src/app/[locale]/not-found.tsx
'use client';

import { Link } from '@/navigation';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center px-4">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-slate-800">Page Not Found</h2>
      <p className="mt-2 text-slate-500">
        Sorry, we couldn’t find the page you’re looking for.
      </p>
      <div className="mt-6">
        <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          <ArrowLeft className="mr-2 h-4 w-4"/>
          Go back home
        </Link>
      </div>
    </div>
  );
}
