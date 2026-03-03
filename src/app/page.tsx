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
  coverImage: string | null;
  _count: {
    volumes: number;
    chapters: number;
  };
}

interface ReadingHistory {
  id: string;
  chapter: {
    id: string;
    number: number;
    title: string | null;
    volume: {
      number: number;
      series: {
        id: string;
        title: string;
      };
    };
  };
  lastPage: number;
  progress: number;
  updatedAt: string;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [series, setSeries] = useState<Series[]>([]);
  const [readingHistory, setReadingHistory] = useState<ReadingHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSeries();
    if (session) {
      fetchReadingHistory();
    }
  }, [session]);

  const fetchSeries = async () => {
    try {
      const response = await fetch("/api/series?limit=12");
      if (response.ok) {
        const data = await response.json();
        setSeries(data.series);
      }
    } catch (error) {
      console.error("Error fetching series:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReadingHistory = async () => {
    try {
      const response = await fetch("/api/reading-history");
      if (response.ok) {
        const data = await response.json();
        setReadingHistory(data.history.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching reading history:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Cargando...</div>
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
            Tu plataforma de mangas, cómics y novelas visuales para Latinoamérica
          </p>
        </div>

        {session && readingHistory.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">
              Continuar leyendo
            </h2>
            <div className="space-y-3">
              {readingHistory.map((item) => (
                <Link
                  key={item.id}
                  href={`/read/${item.chapter.id}`}
                  className="block rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                        {item.chapter.volume.series.title}
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Vol. {item.chapter.volume.number} - Cap. {item.chapter.number}
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

        <div>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">
            Series populares
          </h2>

          {series.length === 0 ? (
            <div className="text-center py-12 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                No hay series disponibles aún
              </p>
              {session?.user?.role === "CREATOR" && (
                <Link
                  href="/creator"
                  className="text-zinc-900 dark:text-zinc-50 font-medium hover:underline"
                >
                  Crear la primera serie
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {series.map((s) => (
                <Link
                  key={s.id}
                  href={`/series/${s.id}`}
                  className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                  <div className="aspect-[3/4] bg-zinc-100 dark:bg-zinc-800 rounded-lg mb-4 flex items-center justify-center">
                    {s.coverImage ? (
                      <img
                        src={s.coverImage}
                        alt={s.title}
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
      </div>
    </div>
  );
}
