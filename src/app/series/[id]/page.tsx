"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Series {
  id: string;
  title: string;
  description: string | null;
  type: string;
  isAdult: boolean;
  status: string;
  coverImage: string | null;
  creator: {
    id: string;
    email: string;
  };
  volumes: Volume[];
}

interface Volume {
  id: string;
  number: number;
  title: string | null;
  chapters: Chapter[];
}

interface Chapter {
  id: string;
  number: number;
  title: string | null;
  pageCount: number;
  status: string;
}

interface ReadingProgress {
  chapterId: string;
  lastPage: number;
  progress: number;
}

export default function SeriesPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session } = useSession();
  const [series, setSeries] = useState<Series | null>(null);
  const [readingProgress, setReadingProgress] = useState<Record<string, ReadingProgress>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSeries();
    if (session) {
      fetchReadingProgress();
    }
  }, [params.id, session]);

  const fetchSeries = async () => {
    try {
      const response = await fetch(`/api/series/${params.id}`);
      if (!response.ok) {
        throw new Error("Error al obtener serie");
      }
      const data = await response.json();
      setSeries(data.series);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar serie");
    } finally {
      setLoading(false);
    }
  };

  const fetchReadingProgress = async () => {
    try {
      const response = await fetch("/api/reading-history");
      if (response.ok) {
        const data = await response.json();
        const progressMap: Record<string, ReadingProgress> = {};
        data.history.forEach((item: any) => {
          progressMap[item.chapterId] = {
            chapterId: item.chapterId,
            lastPage: item.lastPage,
            progress: item.progress,
          };
        });
        setReadingProgress(progressMap);
      }
    } catch (error) {
      console.error("Error fetching reading progress:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Cargando...</div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-900 dark:text-zinc-50 mb-4">
            {error || "Serie no encontrada"}
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
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 dark:bg-black">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            {series.title}
          </h1>

          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 text-sm">
              {series.type}
            </span>
            {series.isAdult && (
              <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 text-sm">
                +18
              </span>
            )}
            <span className="px-3 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 text-sm">
              {series.status}
            </span>
          </div>

          {series.description && (
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">
              {series.description}
            </p>
          )}
        </div>

        <div className="space-y-8">
          {series.volumes.map((volume) => (
            <div key={volume.id}>
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                Volumen {volume.number}
                {volume.title && ` - ${volume.title}`}
              </h2>

              <div className="space-y-3">
                {volume.chapters
                  .filter((ch) => ch.status === "APPROVED")
                  .map((chapter) => {
                    const progress = readingProgress[chapter.id];
                    const isComplete = progress && progress.progress >= 100;

                    return (
                      <Link
                        key={chapter.id}
                        href={`/read/${chapter.id}`}
                        className="block rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                              Cap. {chapter.number}
                              {chapter.title && ` - ${chapter.title}`}
                            </h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                              {chapter.pageCount} páginas
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            {progress && progress.progress > 0 && (
                              <div className="text-right">
                                <div className="w-32 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mb-1">
                                  <div
                                    className="h-full bg-zinc-900 dark:bg-zinc-50 transition-all"
                                    style={{ width: `${progress.progress}%` }}
                                  />
                                </div>
                                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                  {isComplete
                                    ? "Completado ✓"
                                    : `${Math.round(progress.progress)}%`}
                                </p>
                              </div>
                            )}

                            <span className="text-zinc-400">
                              {isComplete ? "✓" : "→"}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
