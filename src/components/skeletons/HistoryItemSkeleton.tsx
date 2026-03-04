export function HistoryItemSkeleton() {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-6 bg-zinc-100 dark:bg-zinc-800 rounded mb-2 w-3/4" />
          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-1/2" />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="w-24 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-1" />
            <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-12 ml-auto" />
          </div>
          <div className="h-4 w-4 bg-zinc-100 dark:bg-zinc-800 rounded" />
        </div>
      </div>
    </div>
  );
}
