"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import useSWR from "swr";

import { authClient } from "@/lib/auth-client";
import { fetcher } from "@/lib/fetcher";
import { normalizeReadingHistory } from "@/utils/historyNormalizer";
import { SeriesCardSkeleton } from "@/components/skeletons/SeriesCardSkeleton";
import { HistoryItemSkeleton } from "@/components/skeletons/HistoryItemSkeleton";
import { SeriesErrorFallback } from "@/components/error-fallbacks/SeriesErrorFallback";
import { HistoryErrorFallback } from "@/components/error-fallbacks/HistoryErrorFallback";
import { SectionErrorBoundary } from "@/components/error-fallbacks/SectionErrorBoundary";

interface Series {
  id: string;
  title: string;
  description: string | null;
  type: string;
  isAdult: boolean;
  coverImage: string | null;
  _count: {
    volumes: number;
    chapters: number;
  };
}

export default function Home() {
  const { data: session } = authClient.useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const showAdult = session?.user?.showAdult ?? false;
  const searchQuery = searchTerm.trim();
  const seriesParams = new URLSearchParams({
    limit: "12",
    showAdult: showAdult ? "true" : "false",
  });

  if (searchQuery) {
    seriesParams.set("q", searchQuery);
  }

  const seriesKey = `/api/series?${seriesParams.toString()}`;
  const {
    data: seriesData,
    error: seriesError,
    isLoading,
    mutate: mutateSeries,
  } = useSWR<{ series: Series[] }>(seriesKey, fetcher);
  
  const { data: historyRaw } = useSWR<unknown>(
    session ? "/api/reading-history" : null,
    fetcher,
  );

  const series = (() => {
    if (Array.isArray(seriesData?.series)) {
      return seriesData.series.filter((item) => showAdult || !item.isAdult);
    }
    if (Array.isArray(seriesData)) {
      return seriesData.filter((item) => showAdult || !item.isAdult);
    }
    return [];
  })();

  const historyArray = normalizeReadingHistory(historyRaw);
  const readingHistory = Array.isArray(historyArray) ? historyArray.slice(0, 5) : [];

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 dark:bg-black">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
              Panels
            </h1>
            <p className="max-w-md mx-auto text-lg text-zinc-600 dark:text-zinc-400">
              Tu plataforma de mangas, cómics y novelas visuales para
              Latinoamérica
            </p>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">
              Continuar leyendo
            </h2>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <HistoryItemSkeleton key={i} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">
              Series populares
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <SeriesCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 dark:bg-black">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
            Panels
          </h1>
          <p className="max-w-md mx-auto text-lg text-zinc-600 dark:text-zinc-400">
            Tu plataforma de mangas, cómics y novelas visuales para
            Latinoamérica
          </p>
        </div>

        <div className="mb-10">
          <div className="mx-auto max-w-2xl">
            <label
              htmlFor="series-search"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
            >
              Buscar series
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3">
              <svg
                className="h-5 w-5 text-zinc-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35m1.85-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                id="series-search"
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none"
                placeholder="Busca por título o descripción"
              />
            </div>
          </div>
        </div>

        <SectionErrorBoundary fallback={<HistoryErrorFallback />}>
          {session && readingHistory.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">
                Continuar leyendo
              </h2>
              <div className="space-y-3">
                {readingHistory?.map((item) => (
                  <Link
                    key={item.id}
                    href={`/read/${item.chapter.id}?page=${item.lastPage}`}
                    className="block rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                          {item.chapter.volume.series.title}
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          Vol. {item.chapter.volume.number} - Cap.{" "}
                          {item.chapter.number}
                          {item.chapter.title && `: ${item.chapter.title}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="w-24 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mb-1">
                            <div
                              className="h-full bg-zinc-900 dark:bg-zinc-50"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            {Math.round(item.progress)}%
                          </p>
                        </div>
                        <span className="text-zinc-400">→</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </SectionErrorBoundary>

        <SectionErrorBoundary fallback={<SeriesErrorFallback onRetry={() => mutateSeries()} />}>
          <div>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">
              Series populares
            </h2>
            {series.length === 0 ? (
              <div className="text-center py-16 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-4">
                  {searchQuery
                    ? "No encontramos resultados para tu búsqueda"
                    : "No hay series disponibles aún"}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-500">
                  {searchQuery
                    ? "Prueba con otro término o borra el filtro de búsqueda"
                    : "¡Sé el primero en crear una serie!"}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {series.map((s, index) => (
                  <Link
                    key={s.id}
                    href={`/series/${s.id}`}
                    className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                  >
                    <div className="aspect-3/4 bg-zinc-100 dark:bg-zinc-800 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                      {s.coverImage ? (
                        <Image
                          src={s.coverImage}
                          alt={`Portada de ${s.title}`}
                          width={300}
                          height={400}
                          priority={index < 6}
                          loading={index < 6 ? "eager" : "lazy"}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-4xl">📖</span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                      {s.title}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
                      {s.description || "Sin descripción"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 text-xs">
                        {s.type}
                      </span>
                      <div className="flex gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                        <span>{s._count.volumes} vol.</span>
                        <span>{s._count.chapters} caps.</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </SectionErrorBoundary>
      </div>
    </div>
  );
}
