"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type SeriesFormState = {
  title: string;
  description: string;
  type: string;
  isAdult: boolean;
};

interface SeriesResponse {
  id: string;
  title: string;
  description: string | null;
  type: string;
  isAdult: boolean;
  status: string;
}

export default function EditSeriesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [series, setSeries] = useState<SeriesFormState>({
    title: "",
    description: "",
    type: "MANGA",
    isAdult: false,
  });
  const [status, setStatus] = useState("DRAFT");

  useEffect(() => {
    const loadSeries = async () => {
      try {
        const response = await fetch(`/api/series/${id}`);
        if (!response.ok) {
          throw new Error("Error al obtener serie");
        }
        const data = await response.json();
        const item: SeriesResponse = data.series;

        setSeries({
          title: item.title || "",
          description: item.description || "",
          type: item.type || "MANGA",
          isAdult: item.isAdult ?? false,
        });
        setStatus(item.status || "DRAFT");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al obtener serie");
      } finally {
        setLoading(false);
      }
    };

    loadSeries();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/series/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(series),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al actualizar serie");
      }

      setSuccess("Serie actualizada correctamente");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar serie");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 dark:bg-black px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href={`/creator/series/${id}`}
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            ← Volver al detalle
          </Link>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-4">
            Editar serie
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            Cambia el título, descripción y clasificación de tu serie.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-950 p-4 text-sm text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg bg-green-50 dark:bg-green-950 p-4 text-sm text-green-800 dark:text-green-200">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
            >
              Título *
            </label>
            <input
              id="title"
              type="text"
              required
              value={series.title}
              onChange={(e) => setSeries({ ...series, title: e.target.value })}
              className="block w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
            >
              Descripción
            </label>
            <textarea
              id="description"
              rows={4}
              value={series.description}
              onChange={(e) =>
                setSeries({ ...series, description: e.target.value })
              }
              className="block w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
            />
          </div>

          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
            >
              Tipo
            </label>
            <select
              id="type"
              value={series.type}
              onChange={(e) => setSeries({ ...series, type: e.target.value })}
              className="block w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            >
              <option value="MANGA">Manga</option>
              <option value="COMIC">Cómic</option>
              <option value="MANHUA">Manhua</option>
              <option value="VISUAL_NOVEL">Novela Visual</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
            <input
              id="isAdult"
              type="checkbox"
              checked={series.isAdult}
              onChange={(e) =>
                setSeries({ ...series, isAdult: e.target.checked })
              }
              className="mt-1 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
            />
            <label
              htmlFor="isAdult"
              className="text-sm text-zinc-700 dark:text-zinc-300"
            >
              <span className="block font-medium text-zinc-900 dark:text-zinc-50">
                Contenido adulto (+18)
              </span>
              <span className="block mt-1 text-zinc-600 dark:text-zinc-400">
                Si lo activas, la serie quedará oculta para usuarios que no permitan contenido adulto.
              </span>
            </label>
          </div>

          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 p-4 text-sm text-zinc-600 dark:text-zinc-400">
            Estado actual: <span className="font-medium text-zinc-900 dark:text-zinc-50">{status}</span>
          </div>

          <div className="flex gap-4 pt-4">
            <Link
              href={`/creator/series/${id}`}
              className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-center text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
