'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void; }) {
  return (
    <div role="alert" className="flex items-center justify-center min-h-[calc(100vh-8rem)] bg-background p-4">
      <Card className="w-full max-w-lg text-center shadow-lg border-destructive">
        <CardHeader>
          <CardTitle className="text-2xl text-destructive">Application Error</CardTitle>
          <CardDescription>We're sorry, but something went wrong.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            An unexpected error occurred. You can try to reload the page.
          </p>
          <pre className="text-xs text-left bg-secondary p-2 rounded-md overflow-x-auto mb-6">
            {error.message}
          </pre>
          <Button onClick={resetErrorBoundary} className="w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
