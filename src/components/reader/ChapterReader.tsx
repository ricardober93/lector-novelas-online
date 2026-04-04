"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ProgressBar } from "./ProgressBar";
import { NavigationControls } from "./NavigationControls";
import { ImageControls } from "./ImageControls";
import { AdBanner } from "@/components/ads/AdBanner";
import { logger } from "@/lib/logger";
import { getDemoImages } from "@/lib/demoImages";

interface Page {
  id: string;
  number: number;
  imageUrl: string;
  width: number | null;
  height: number | null;
}

interface ChapterReaderProps {
  chapterId: string;
  pages: Page[];
  initialPage?: number;
  onProgressUpdate?: (currentPage: number, progress: number) => void;
  showAds?: boolean;
  adFrequency?: number;
}

export function ChapterReader({
  chapterId,
  pages: initialPages,
  initialPage = 1,
  onProgressUpdate,
  showAds = true,
  adFrequency = 5,
}: ChapterReaderProps) {
  const pages = initialPages.length > 0 ? initialPages : getDemoImages(20);
  const totalPages = pages.length;
  const normalizedInitialPage = Math.min(Math.max(initialPage, 1), totalPages);
  const [currentPage, setCurrentPage] = useState(normalizedInitialPage);
  const [progress, setProgress] = useState(
    () => (normalizedInitialPage / totalPages) * 100
  );
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showUI, setShowUI] = useState(true);
  const lastSavedPage = useRef(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const pageRefs = useRef<Map<string, HTMLElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const hasAppliedInitialScroll = useRef(false);

  const saveProgress = useCallback(
    async (page: number) => {
      if (page === lastSavedPage.current) return;
      lastSavedPage.current = page;

      try {
        await fetch("/api/reading-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chapterId,
            lastPage: page,
          }),
        });
      } catch (error) {
        logger.error("Error saving progress:", error);
      }
    },
    [chapterId]
  );

  const scrollToPage = useCallback((pageNumber: number) => {
    const pageElement = Array.from(pageRefs.current.values()).find(
      (el) => el.getAttribute("data-page") === String(pageNumber)
    );
    
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNumber = parseInt(
              entry.target.getAttribute("data-page") || "1"
            );
            setCurrentPage(pageNumber);

            const newProgress = (pageNumber / totalPages) * 100;
            setProgress(newProgress);

            if (onProgressUpdate) {
              onProgressUpdate(pageNumber, newProgress);
            }

            if (pageNumber % 3 === 0 || pageNumber === totalPages) {
              saveProgress(pageNumber);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    observerRef.current = observer;

    pageRefs.current.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [pages, totalPages, onProgressUpdate, saveProgress]);

  useEffect(() => {
    if (hasAppliedInitialScroll.current) return;
    if (normalizedInitialPage <= 1) {
      hasAppliedInitialScroll.current = true;
      return;
    }

    hasAppliedInitialScroll.current = true;
    requestAnimationFrame(() => {
      scrollToPage(normalizedInitialPage);
    });
  }, [normalizedInitialPage, scrollToPage]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      saveProgress(currentPage);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentPage, saveProgress]);

  // Touch gestures for mobile
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === "undefined") return;

    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
      const threshold = 50;

      // Only handle horizontal swipes (not vertical scrolls)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && currentPage > 1) {
          // Swipe right - previous page
          scrollToPage(currentPage - 1);
        } else if (deltaX < 0 && currentPage < totalPages) {
          // Swipe left - next page
          scrollToPage(currentPage + 1);
        }
      }

      touchStartRef.current = null;
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const zoneWidth = width / 3;

      // Tap zones
      if (x < zoneWidth) {
        // Left zone - previous page
        if (currentPage > 1) scrollToPage(currentPage - 1);
      } else if (x > zoneWidth * 2) {
        // Right zone - next page
        if (currentPage < totalPages) scrollToPage(currentPage + 1);
      } else {
        // Center zone - toggle UI
        setShowUI((prev) => !prev);
      }
    };

    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchend", handleTouchEnd);
    container.addEventListener("click", handleClick);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("click", handleClick);
    };
  }, [currentPage, totalPages, scrollToPage]);

  // Keyboard navigation for desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentPage > 1) {
        scrollToPage(currentPage - 1);
      } else if (e.key === "ArrowRight" && currentPage < totalPages) {
        scrollToPage(currentPage + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages, scrollToPage]);

  // Auto-hide UI on mobile
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    let timeout: NodeJS.Timeout;

    const handleScroll = () => {
      setShowUI(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowUI(false), 3000);
    };

    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeout);
    };
  }, []);

  const shouldShowAd = (pageIndex: number) => {
    return (
      showAds &&
      adFrequency > 0 &&
      (pageIndex + 1) % adFrequency === 0 &&
      pageIndex < pages.length - 1
    );
  };

  const setPageRef = useCallback((pageId: string) => (el: HTMLElement | null) => {
    if (el) {
      pageRefs.current.set(pageId, el);
    } else {
      pageRefs.current.delete(pageId);
    }
  }, []);

  const handleZoomChange = (newZoomLevel: number) => {
    setZoomLevel(newZoomLevel);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      scrollToPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      scrollToPage(currentPage + 1);
    }
  };

  return (
    <>
      <ProgressBar
        progress={progress}
        currentPage={currentPage}
        totalPages={totalPages}
        showOnMobile={showUI}
      />

      <div 
        ref={containerRef}
        className="pt-16 md:pt-20 pb-24 md:pb-12"
        style={{
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      >
        <div className="w-full md:max-w-3xl lg:max-w-4xl mx-auto px-4 md:px-6">
          {pages.map((page, index) => (
            <div key={page.id}>
              <div 
                ref={setPageRef(page.id)}
                data-page={page.number} 
                className="mb-1"
              >
                <PageImage 
                  page={page} 
                  index={index} 
                  zoomLevel={zoomLevel}
                />
              </div>

              {shouldShowAd(index) && (
                <div className="my-6">
                  <AdBanner format="horizontal" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <NavigationControls
        onPrevious={handlePrevious}
        onNext={handleNext}
        canGoPrevious={currentPage > 1}
        canGoNext={currentPage < totalPages}
        currentPage={currentPage}
        totalPages={totalPages}
      />

      <ImageControls onZoomChange={handleZoomChange} />
    </>
  );
}

function PageImage({ page, index, zoomLevel }: { page: Page; index: number; zoomLevel: number }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const isPriority = index < 3;

  if (error) {
    return (
      <div className="w-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 p-8 rounded-lg">
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          Error al cargar la página {page.number}
        </p>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full overflow-hidden"
      style={{
        transform: `scale(${zoomLevel / 100})`,
        transformOrigin: "top center",
        transition: "transform 0.3s ease",
      }}
    >
      {!loaded && (
        <div
          className="w-full bg-zinc-100 dark:bg-zinc-900 animate-pulse"
          style={{
            aspectRatio: page.width && page.height 
              ? `${page.width}/${page.height}` 
              : "3/4",
          }}
        />
      )}

      <Image
        src={page.imageUrl}
        alt={`Página ${page.number}`}
        width={page.width || 800}
        height={page.height || 1200}
        priority={isPriority}
        loading={isPriority ? "eager" : "lazy"}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className="w-full h-auto transition-opacity duration-300"
        style={{ opacity: loaded ? 1 : 0 }}
      />
    </div>
  );
}
