"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChapterUploadForm } from "@/components/upload";

interface Chapter {
  id: string;
  number: number;
  title: string | null;
  pageCount: number;
  status: string;
  volume: {
    id: string;
    number: number;
    series: {
      id: string;
      title: string;
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

export default function ChapterDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChapter();
  }, [params.id]);

  const fetchChapter = async () => {
    try {
      const response = await fetch(`/api/chapters/${params.id}`);
      if (!response.ok) {
        throw new Error("Error al obtener capítulo");
      }
      const data = await response.json();
      setChapter(data.chapter);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener capítulo");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Cargando...</div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-900 dark:text-zinc-50 mb-4">
            Capítulo no encontrado
          </p>
          <Link
            href="/creator"
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            ← Volver al panel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 dark:bg-black px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href={`/creator/volumes/${chapter.volume.id}`}
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            ← Volver al Vol. {chapter.volume.number}
          </Link>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-4">
            Cap. {chapter.number}
            {chapter.title && ` - ${chapter.title}`}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            {chapter.volume.series.title} - Vol. {chapter.volume.number}
          </p>
          <div className="flex gap-2 mt-4">
            <span className="px-3 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 text-sm">
              {chapter.pageCount} páginas
            </span>
            <span className="px-3 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 text-sm">
              {chapter.status}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-950 p-4 text-sm text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">
            Subir imágenes
          </h2>
          <ChapterUploadForm
            chapterId={chapter.id}
            onUploadComplete={fetchChapter}
          />
        </div>

        {chapter.pages.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Páginas ({chapter.pages.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {chapter.pages.map((page) => (
                <div
                  key={page.id}
                  className="aspect-[3/4] rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden relative group"
                >
                  <img
                    src={page.imageUrl}
                    alt={`Página ${page.number}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs py-1 px-2">
                    Pág. {page.number}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
