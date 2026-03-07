"use client";

import { use } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { ChapterReader } from "@/components/reader";
import { fetcher } from "@/lib/fetcher";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface Chapter {
  id: string;
  number: number;
  title: string | null;
  pageCount: number;
  volume: {
    id: string;
    number: number;
    series: {
      id: string;
      title: string;
      isAdult: boolean;
    };
  };
  pages: Page[];
}

interface Page {
  id: string;
  number: number;
  imageUrl: string;
  width: number | null;
  height: number | null;
}

interface Navigation {
  previous: { id: string; number: number; title: string | null } | null;
  next: { id: string; number: number; title: string | null } | null;
}

export default function ReadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  
  const { data: chapterData, error: chapterError } = useSWR<{ chapter: Chapter }>(
    `/api/chapters/${id}`,
    fetcher
  );
  
  const { data: navigation } = useSWR<Navigation>(
    `/api/chapters/navigation?chapterId=${id}`,
    fetcher
  );

  const chapter = chapterData?.chapter || null;
  const loading = status === "loading" || (!chapterData && !chapterError);
  const error = chapterError ? "Error al cargar capítulo" : null;
  const nav = navigation || { previous: null, next: null };

  const prefetchChapter = async (chapterId: string) => {
    try {
      await fetch(`/api/chapters/${chapterId}`);
    } catch (err) {
      // Silently fail prefetch
    }
  };

  const prefetchSeries = async (seriesId: string) => {
    try {
      await fetch(`/api/series/${seriesId}`);
    } catch (err) {
      // Silently fail prefetch
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner className="text-zinc-900 dark:text-zinc-50" />
          <p className="text-zinc-600 dark:text-zinc-400">Cargando capítulo...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (error || !chapter) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-900 dark:text-zinc-50 mb-4">
            {error || "Capítulo no encontrado"}
          </p>
          <Link
            href="/"
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <ChapterReader
        chapterId={chapter.id}
        pages={chapter.pages || []}
      />

        <div className="max-w-4xl mx-auto px-4 pb-12">
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              {nav.previous ? (
                <Link
                  href={`/read/${nav.previous.id}`}
                  onMouseEnter={() => prefetchChapter(nav.previous!.id)}
                  className="flex-1 text-center py-3 px-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                    ← Capítulo anterior
                  </div>
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    Cap. {nav.previous.number}
                    {nav.previous.title && ` - ${nav.previous.title}`}
                  </div>
                </Link>
              ) : (
                <div className="flex-1" />
              )}

              <Link
                href={`/series/${chapter.volume.series.id}`}
                onMouseEnter={() => prefetchSeries(chapter.volume.series.id)}
                className="px-6 py-3 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
              >
                Ver serie
              </Link>

              {nav.next ? (
                <Link
                  href={`/read/${nav.next.id}`}
                  onMouseEnter={() => prefetchChapter(nav.next!.id)}
                  className="flex-1 text-center py-3 px-4 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
                >
                  <div className="text-xs opacity-80 mb-1">
                    Siguiente capítulo →
                  </div>
                  <div className="text-sm font-medium">
                    Cap. {nav.next.number}
                    {nav.next.title && ` - ${nav.next.title}`}
                  </div>
                </Link>
              ) : (
                <div className="flex-1 text-center py-3 px-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                    Serie completada
                  </div>
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    ✓
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  );
}
