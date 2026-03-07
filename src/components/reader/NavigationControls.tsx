"use client";

interface NavigationControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  currentPage: number;
  totalPages: number;
}

export function NavigationControls({
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  currentPage,
  totalPages,
}: NavigationControlsProps) {
  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 md:hidden">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between gap-4 bg-black/80 backdrop-blur-sm rounded-lg p-2">
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="flex-1 min-h-[44px] min-w-[44px] px-4 py-2 rounded-lg border border-zinc-700 
              hover:bg-zinc-800 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              active:scale-95 transition-transform duration-100"
            aria-label="Página anterior"
          >
            <span className="text-sm font-medium text-white">
              ← Anterior
            </span>
          </button>

          <div className="text-center px-2">
            <span className="text-sm text-zinc-300 font-medium">
              {currentPage} / {totalPages}
            </span>
          </div>

          <button
            onClick={onNext}
            disabled={!canGoNext}
            className="flex-1 min-h-[44px] min-w-[44px] px-4 py-2 rounded-lg bg-white 
              text-zinc-900 
              hover:bg-zinc-200 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              active:scale-95 transition-transform duration-100"
            aria-label="Página siguiente"
          >
            <span className="text-sm font-medium">
              Siguiente →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
