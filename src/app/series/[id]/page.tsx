"use client";

import { use } from "react";
import Link from "next/link";
import useSWR from "swr";

import { authClient } from "@/lib/auth-client";
import { fetcher } from "@/lib/fetcher";

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

interface ReadingHistoryItem {
  chapterId: string;
  lastPage: number;
  progress: number;
}

export default function SeriesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session, isPending } = authClient.useSession();
  
  const { data: seriesData, error: seriesError } = useSWR<{ series: Series }>(
    `/api/series/${id}`,
    fetcher
  );
  
  const { data: historyData } = useSWR<{ history: ReadingHistoryItem[] }>(
    session ? "/api/reading-history" : null,
    fetcher
  );

  const series = seriesData?.series || null;
  const loading = !seriesData && !seriesError;
  const error = seriesError ? "Error al cargar serie" : null;
  const hasAdultAccess = session?.user?.showAdult ?? false;
  const isRestricted = !!series?.isAdult && !hasAdultAccess;
  const waitingForSession = !!series?.isAdult && isPending;

  const readingProgress: Record<string, ReadingProgress> = {};
  if (historyData?.history) {
    historyData.history.forEach((item) => {
      readingProgress[item.chapterId] = {
        chapterId: item.chapterId,
        lastPage: item.lastPage,
        progress: item.progress,
      };
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Cargando...</div>
      </div>
    );
  }

  if (waitingForSession) {
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

  if (isRestricted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 dark:bg-black flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
            Contenido no disponible
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Esta serie está marcada como contenido adulto. Activa la opción
            "Mostrar contenido adulto (+18)" desde tu perfil para verla.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href={session ? "/profile" : "/login"}
              className="rounded-lg bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-4 py-3 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200"
            >
              {session ? "Ir al perfil" : "Iniciar sesión"}
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Volver al inicio
            </Link>
          </div>
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
          {series.volumes?.map((volume) => (
            <div key={volume.id}>
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                Volumen {volume.number}
                {volume.title && ` - ${volume.title}`}
              </h2>

              <div className="space-y-3">
                {volume.chapters
                  ?.filter((ch) => ch.status === "APPROVED")
                  ?.map((chapter) => {
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
