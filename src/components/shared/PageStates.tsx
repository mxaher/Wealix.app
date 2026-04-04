'use client';

import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardSkeleton } from './SkeletonLoaders';

export function SectionLoadingState() {
  return <DashboardSkeleton />;
}

export function SectionErrorState({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Wealix page error:', error);
  }, [error]);

  return (
    <Card className="border-destructive/20">
      <CardContent className="flex min-h-[320px] flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="rounded-full bg-destructive/10 p-3 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            This section ran into a problem. Your navigation is still available, and you can retry safely.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={reset} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Try again
          </Button>
          <Button asChild variant="outline">
            <a href="/dashboard">Go to dashboard</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
