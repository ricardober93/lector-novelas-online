"use client";

interface SeriesErrorFallbackProps {
  onRetry?: () => void;
}

export function SeriesErrorFallback({ onRetry }: SeriesErrorFallbackProps) {
  return (
    <div className="text-center py-16 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="text-6xl mb-4">😕</div>
      <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-4">
        No se pudieron cargar las series
      </p>
      <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-6">
        Verifica tu conexión e intenta de nuevo
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
