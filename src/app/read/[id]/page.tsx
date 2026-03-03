"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ChapterReader } from "@/components/reader";

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
      isAdult: true;
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
  params: { id: string };
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [navigation, setNavigation] = useState<Navigation>({ previous: null, next: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session === null) {
      router.push("/login");
    }
  }, [session, router]);

  useEffect(() => {
    fetchChapter();
  }, [params.id]);

  const fetchChapter = async () => {
    try {
      const response = await fetch(`/api/chapters/${params.id}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al obtener capítulo");
      }
      const data = await response.json();
      setChapter(data.chapter);

      const navResponse = await fetch(
        `/api/chapters/navigation?chapterId=${params.id}`
      );
      if (navResponse.ok) {
        const navData = await navResponse.json();
        setNavigation(navData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar capítulo");
    } finally {
      setLoading(false);
    }
  };

  if (session === undefined || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Cargando...</div>
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
        pages={chapter.pages}
      />

      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6">
          <div className="flex items-center justify-between">
            {navigation.previous ? (
              <Link
                href={`/read/${navigation.previous.id}`}
                className="flex-1 text-center py-3 px-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                  ← Capítulo anterior
                </div>
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Cap. {navigation.previous.number}
                  {navigation.previous.title && ` - ${navigation.previous.title}`}
                </div>
              </Link>
            ) : (
              <div className="flex-1" />
            )}

            <Link
              href={`/series/${chapter.volume.series.id}`}
              className="px-6 py-3 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              Ver serie
            </Link>

            {navigation.next ? (
              <Link
                href={`/read/${navigation.next.id}`}
                className="flex-1 text-center py-3 px-4 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
              >
                <div className="text-xs opacity-80 mb-1">
                  Siguiente capítulo →
                </div>
                <div className="text-sm font-medium">
                  Cap. {navigation.next.number}
                  {navigation.next.title && ` - ${navigation.next.title}`}
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
