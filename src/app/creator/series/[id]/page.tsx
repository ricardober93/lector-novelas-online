"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

interface Series {
  id: string;
  title: string;
  description: string | null;
  type: string;
  isAdult: boolean;
  status: string;
  createdAt: string;
  volumes: Volume[];
  _count: {
    volumes: number;
  };
}

interface Volume {
  id: string;
  number: number;
  title: string | null;
  _count: {
    chapters: number;
  };
}

export default function SeriesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showVolumeForm, setShowVolumeForm] = useState(false);
  const [volumeNumber, setVolumeNumber] = useState("");
  const [volumeTitle, setVolumeTitle] = useState("");
  const [volumeLoading, setVolumeLoading] = useState(false);

  useEffect(() => {
    fetchSeries();
  }, [id]);

  const fetchSeries = async () => {
    try {
      const response = await fetch(`/api/series/${id}`);
      if (!response.ok) {
        throw new Error("Error al obtener serie");
      }
      const data = await response.json();
      setSeries(data.series);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener serie");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVolume = async (e: React.FormEvent) => {
    e.preventDefault();
    setVolumeLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/volumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seriesId: id,
          number: parseInt(volumeNumber),
          title: volumeTitle || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al crear volumen");
      }

      setShowVolumeForm(false);
      setVolumeNumber("");
      setVolumeTitle("");
      fetchSeries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear volumen");
    } finally {
      setVolumeLoading(false);
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
            Serie no encontrada
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
            href="/creator"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            ← Volver al panel
          </Link>
          <div className="flex items-start justify-between mt-4">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {series.title}
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-2">
                {series.description || "Sin descripción"}
              </p>
              <div className="flex gap-4 mt-4 text-sm">
                <span className="px-3 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50">
                  {series.type}
                </span>
                {series.isAdult && (
                  <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100">
                    +18
                  </span>
                )}
                <span className="px-3 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50">
                  {series.status}
                </span>
              </div>
            </div>
            <button
              onClick={() => router.push(`/creator/series/${id}/edit`)}
              className="rounded-lg bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:hover:bg-zinc-200"
            >
              Editar
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-950 p-4 text-sm text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Volúmenes ({series._count.volumes})
            </h2>
            <button
              onClick={() => setShowVolumeForm(true)}
              className="rounded-lg bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:hover:bg-zinc-200"
            >
              + Agregar volumen
            </button>
          </div>

          {showVolumeForm && (
            <div className="mb-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                Nuevo Volumen
              </h3>
              <form onSubmit={handleCreateVolume} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Número *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={volumeNumber}
                    onChange={(e) => setVolumeNumber(e.target.value)}
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
                    value={volumeTitle}
                    onChange={(e) => setVolumeTitle(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    placeholder="Ej: El comienzo"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVolumeForm(false);
                      setVolumeNumber("");
                      setVolumeTitle("");
                    }}
                    className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={volumeLoading}
                    className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    {volumeLoading ? "Creando..." : "Crear"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {(series.volumes?.length ?? 0) === 0 ? (
            <div className="text-center py-12 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-600 dark:text-zinc-400">
                No hay volúmenes aún
              </p>
              <button
                onClick={() => setShowVolumeForm(true)}
                className="mt-4 text-zinc-900 dark:text-zinc-50 font-medium hover:underline"
              >
                Agregar el primer volumen
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {series.volumes?.map((volume) => (
                <Link
                  key={volume.id}
                  href={`/creator/volumes/${volume.id}`}
                  className="block rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                        Vol. {volume.number}
                        {volume.title && ` - ${volume.title}`}
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        {volume._count.chapters} capítulo
                        {volume._count.chapters !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className="text-zinc-400">→</span>
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
