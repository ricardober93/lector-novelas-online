"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ProgressBar } from "./ProgressBar";
import { AdBanner } from "@/components/ads/AdBanner";
import { logger } from "@/lib/logger";

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
  onProgressUpdate?: (currentPage: number, progress: number) => void;
  showAds?: boolean;
  adFrequency?: number;
}

export function ChapterReader({
  chapterId,
  pages,
  onProgressUpdate,
  showAds = true,
  adFrequency = 5,
}: ChapterReaderProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [progress, setProgress] = useState(0);
  const lastSavedPage = useRef(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const pageRefs = useRef<Map<string, HTMLElement>>(new Map());

  const totalPages = pages.length;

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
    const handleBeforeUnload = () => {
      saveProgress(currentPage);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentPage, saveProgress]);

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

  return (
    <>
      <ProgressBar
        progress={progress}
        currentPage={currentPage}
        totalPages={totalPages}
      />

      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto">
          {pages.map((page, index) => (
            <div key={page.id}>
              <div 
                ref={setPageRef(page.id)}
                data-page={page.number} 
                className="mb-1"
              >
                <PageImage page={page} index={index} />
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
    </>
  );
}

function PageImage({ page, index }: { page: Page; index: number }) {
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
    <div className="relative w-full">
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
