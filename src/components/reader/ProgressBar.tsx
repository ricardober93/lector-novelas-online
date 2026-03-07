"use client";

import { useState, useEffect, useRef } from "react";

interface ProgressBarProps {
  progress: number;
  currentPage: number;
  totalPages: number;
  showOnMobile?: boolean;
}

export function ProgressBar({ 
  progress, 
  currentPage, 
  totalPages,
  showOnMobile = true 
}: ProgressBarProps) {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    let timeout: NodeJS.Timeout;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setVisible(currentScrollY < lastScrollY.current || currentScrollY < 100);
      lastScrollY.current = currentScrollY;

      clearTimeout(timeout);
      timeout = setTimeout(() => setVisible(true), 2000);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      {/* Mobile progress bar - bottom overlay */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 md:hidden
          bg-black/80 backdrop-blur-sm 
          border-t border-zinc-700
          transition-all duration-300 
          ${visible && showOnMobile ? "translate-y-0" : "translate-y-full"}`}
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      >
        <div className="px-4 py-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-300">
              {currentPage} / {totalPages}
            </span>
            <span className="text-xs font-medium text-white">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full h-1 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Desktop/Tablet progress bar - top fixed */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 
          bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 
          transition-transform duration-300 
          ${visible ? "translate-y-0" : "-translate-y-full"}
          hidden md:block`}
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Página {currentPage} de {totalPages}
            </span>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-zinc-900 dark:bg-zinc-50 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
