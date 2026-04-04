"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";
import { logger } from "@/lib/logger";

interface Series {
  id: string;
  title: string;
  description: string | null;
  type: string;
  isAdult: boolean;
  status: string;
  _count: {
    volumes: number;
    chapters: number;
  };
}

export default function CreatorPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    } else if (session && session.user?.role !== "CREATOR") {
      router.push("/");
    } else if (session?.user?.role === "CREATOR") {
      fetchSeries();
    }
  }, [isPending, session, router]);

  const fetchSeries = async () => {
    try {
      const response = await fetch(
        `/api/series?creatorId=${session?.user?.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setSeries(data.series);
      }
    } catch (error) {
      logger.error("Error fetching series:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Cargando...</div>
      </div>
    );
  }

  if (!session || session?.user?.role !== "CREATOR") {
    return null;
  }

  const totalChapters = series.reduce((acc, current) => acc + current._count.chapters, 0);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 dark:bg-black px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Panel de Creador
          </h1>
          <Link
            href="/creator/series/new"
            className="rounded-lg bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:hover:bg-zinc-200"
          >
            + Nueva serie
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {series.length}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Series</p>
          </div>
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {series.reduce((acc, s) => acc + s._count.volumes, 0)}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Volúmenes</p>
          </div>
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {totalChapters}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Capítulos</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Mis Series
          </h2>

          {series.length === 0 ? (
            <div className="text-center py-16 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="text-6xl mb-4">✨</div>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-4">
                No tienes series aún
              </p>
              <Link
                href="/creator/series/new"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
              >
                Crear mi primera serie
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {series.map((s) => (
                <Link
                  key={s.id}
                  href={`/creator/series/${s.id}`}
                  className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {s.title}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50">
                      {s.type}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
                    {s.description || "Sin descripción"}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {s._count.volumes} volúmenes
                    </span>
                    <div className="flex gap-2">
                      {s.isAdult && (
                        <span className="px-2 py-1 rounded bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 text-xs">
                          +18
                        </span>
                      )}
                      <span className="px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 text-xs">
                        {s.status}
                      </span>
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
