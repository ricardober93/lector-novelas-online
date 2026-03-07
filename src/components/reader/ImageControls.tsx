"use client";

import { useState } from "react";

interface ImageControlsProps {
  onZoomChange: (zoomLevel: number) => void;
}

export function ImageControls({ onZoomChange }: ImageControlsProps) {
  const [zoomLevel, setZoomLevel] = useState(100);

  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel + 25, 200);
    setZoomLevel(newZoom);
    onZoomChange(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 25, 50);
    setZoomLevel(newZoom);
    onZoomChange(newZoom);
  };

  const handleReset = () => {
    setZoomLevel(100);
    onZoomChange(100);
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 md:hidden flex flex-col gap-2">
      <button
        onClick={handleZoomIn}
        disabled={zoomLevel >= 200}
        className="min-h-[44px] min-w-[44px] w-11 h-11 rounded-full bg-zinc-900 dark:bg-zinc-50 
          text-white dark:text-zinc-900 
          hover:bg-zinc-700 dark:hover:bg-zinc-200 
          disabled:opacity-50 disabled:cursor-not-allowed
          active:scale-95 transition-all duration-100
          flex items-center justify-center shadow-lg"
        aria-label="Acercar"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      <button
        onClick={handleReset}
        className="min-h-[44px] min-w-[44px] w-11 h-11 rounded-full bg-zinc-100 dark:bg-zinc-800 
          text-zinc-900 dark:text-zinc-50 
          hover:bg-zinc-200 dark:hover:bg-zinc-700
          active:scale-95 transition-all duration-100
          flex items-center justify-center shadow-lg text-xs font-bold"
        aria-label="Restablecer zoom"
      >
        {zoomLevel}%
      </button>

      <button
        onClick={handleZoomOut}
        disabled={zoomLevel <= 50}
        className="min-h-[44px] min-w-[44px] w-11 h-11 rounded-full bg-zinc-900 dark:bg-zinc-50 
          text-white dark:text-zinc-900 
          hover:bg-zinc-700 dark:hover:bg-zinc-200 
          disabled:opacity-50 disabled:cursor-not-allowed
          active:scale-95 transition-all duration-100
          flex items-center justify-center shadow-lg"
        aria-label="Alejar"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
    </div>
  );
}
