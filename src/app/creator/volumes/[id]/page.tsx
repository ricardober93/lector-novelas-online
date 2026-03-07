"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Volume {
  id: string;
  number: number;
  title: string | null;
  series: {
    id: string;
    title: string;
  };
  chapters: Chapter[];
  _count: {
    chapters: number;
  };
}

interface Chapter {
  id: string;
  number: number;
  title: string | null;
  pageCount: number;
  status: string;
}

export default function VolumeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [volume, setVolume] = useState<Volume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showChapterForm, setShowChapterForm] = useState(false);
  const [chapterNumber, setChapterNumber] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterLoading, setChapterLoading] = useState(false);

  useEffect(() => {
    fetchVolume();
  }, [id]);

  const fetchVolume = async () => {
    try {
      const response = await fetch(`/api/volumes/${id}`);
      if (!response.ok) {
        throw new Error("Error al obtener volumen");
      }
      const data = await response.json();
      setVolume(data.volume);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener volumen");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    setChapterLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chapters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          volumeId: id,
          number: parseInt(chapterNumber),
          title: chapterTitle || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al crear capítulo");
      }

      setShowChapterForm(false);
      setChapterNumber("");
      setChapterTitle("");
      fetchVolume();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear capítulo");
    } finally {
      setChapterLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Cargando...</div>
      </div>
    );
  }

  if (!volume) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-900 dark:text-zinc-50 mb-4">
            Volumen no encontrado
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
            href={`/creator/series/${volume.series.id}`}
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            ← Volver a {volume.series.title}
          </Link>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-4">
            Vol. {volume.number}
            {volume.title && ` - ${volume.title}`}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            {volume.series.title}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-950 p-4 text-sm text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Capítulos ({volume._count.chapters})
            </h2>
            <button
              onClick={() => setShowChapterForm(true)}
              className="rounded-lg bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:hover:bg-zinc-200"
            >
              + Agregar capítulo
            </button>
          </div>

          {showChapterForm && (
            <div className="mb-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                Nuevo Capítulo
              </h3>
              <form onSubmit={handleCreateChapter} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Número *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={chapterNumber}
                    onChange={(e) => setChapterNumber(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Título (opcional)
                  </label>
                  <input
                    type="text"
                    value={chapterTitle}
                    onChange={(e) => setChapterTitle(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    placeholder="Ej: El encuentro"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowChapterForm(false);
                      setChapterNumber("");
                      setChapterTitle("");
                    }}
                    className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={chapterLoading}
                    className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    {chapterLoading ? "Creando..." : "Crear"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {volume.chapters?.length === 0 ? (
            <div className="text-center py-12 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-600 dark:text-zinc-400">
                No hay capítulos aún
              </p>
              <button
                onClick={() => setShowChapterForm(true)}
                className="mt-4 text-zinc-900 dark:text-zinc-50 font-medium hover:underline"
              >
                Agregar el primer capítulo
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {volume.chapters?.map((chapter) => (
                <div
                  key={chapter.id}
                  className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                        Cap. {chapter.number}
                        {chapter.title && ` - ${chapter.title}`}
                      </h3>
                      <div className="flex gap-2 mt-2">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          {chapter.pageCount} páginas
                        </span>
                        <span className="px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 text-xs">
                          {chapter.status}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/creator/chapters/${chapter.id}`}
                      className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    >
                      Gestionar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
