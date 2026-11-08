import { Spinner } from '@/components/spinner';

// Shown by Next while a dashboard route's server data is loading.
export default function Loading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading">
      <div className="h-8 w-48 rounded-lg bg-secondary animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-32 rounded-xl bg-card border border-border animate-pulse" />
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-4">
        <Spinner /> Loading...
      </div>
    </div>
  );
}
