export function SeriesCardSkeleton() {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 animate-pulse">
      <div className="aspect-3/4 bg-zinc-100 dark:bg-zinc-800 rounded-lg mb-4" />
      <div className="h-6 bg-zinc-100 dark:bg-zinc-800 rounded mb-2 w-3/4" />
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-full" />
        <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-5/6" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-6 bg-zinc-100 dark:bg-zinc-800 rounded w-16" />
        <div className="flex gap-2">
          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-12" />
          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-12" />
        </div>
      </div>
    </div>
  );
}
