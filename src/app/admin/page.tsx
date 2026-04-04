"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";
import { logger } from "@/lib/logger";

interface Moderation {
  id: string;
  status: string;
  notes: string | null;
  createdAt: string;
  reviewedAt: string | null;
  series: {
    id: string;
    title: string;
    type: string;
    isAdult: boolean;
    creator: {
      id: string;
      email: string;
    };
  } | null;
  chapter: {
    id: string;
    number: number;
    title: string | null;
    pageCount: number;
    volume: {
      number: number;
      series: {
        title: string;
      };
    };
  } | null;
  reviewer: {
    id: string;
    email: string;
  } | null;
}

export default function AdminPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [moderations, setModerations] = useState<Moderation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    } else if (session && session?.user?.role !== "ADMIN") {
      router.push("/");
    } else if (session?.user?.role === "ADMIN") {
      fetchModerations();
    }
  }, [isPending, session, router, filter]);

  const fetchModerations = async () => {
    try {
      const response = await fetch(`/api/admin/moderation?status=${filter}`);
      if (response.ok) {
        const data = await response.json();
        setModerations(data.moderations);
      }
    } catch (error) {
      logger.error("Error fetching moderations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModeration = async (
    moderationId: string,
    status: "APPROVED" | "REJECTED",
    notes?: string
  ) => {
    setActionLoading(moderationId);
    try {
      const response = await fetch(`/api/admin/moderation/${moderationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, notes }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al actualizar");
      }

      fetchModerations();
    } catch (error) {
      logger.error("Error updating moderation:", error);
      alert(error instanceof Error ? error.message : "Error al actualizar");
    } finally {
      setActionLoading(null);
    }
  };

  if (isPending || loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Cargando...</div>
      </div>
    );
  }

  if (!session || session?.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 dark:bg-black px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">
          Panel de Administración
        </h1>

        <div className="mb-6">
          <div className="flex gap-2">
            {["PENDING", "APPROVED", "REJECTED"].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilter(status);
                  setLoading(true);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900"
                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                {status === "PENDING"
                  ? "Pendientes"
                  : status === "APPROVED"
                  ? "Aprobados"
                  : "Rechazados"}
              </button>
            ))}
          </div>
        </div>

        {moderations.length === 0 ? (
          <div className="text-center py-12 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400">
              No hay contenido {filter.toLowerCase()}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {moderations.map((moderation) => (
              <div
                key={moderation.id}
                className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6"
              >
                {moderation.chapter ? (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {moderation.chapter.volume.series.title} - Vol.{" "}
                      {moderation.chapter.volume.number} - Cap.{" "}
                      {moderation.chapter.number}
                      {moderation.chapter.title &&
                        `: ${moderation.chapter.title}`}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                      {moderation.chapter.pageCount} páginas
                    </p>
                  </div>
                ) : moderation.series ? (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {moderation.series.title}
                    </h3>
                    <div className="flex gap-2 mt-1">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        {moderation.series.type}
                      </span>
                      {moderation.series.isAdult && (
                        <span className="text-sm text-red-600 dark:text-red-400">
                          +18
                        </span>
                      )}
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  <span>
                    Creador: {moderation.series?.creator.email || "N/A"}
                  </span>
                  <span>
                    {new Date(moderation.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {moderation.status === "PENDING" ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleModeration(moderation.id, "APPROVED")}
                      disabled={actionLoading === moderation.id}
                      className="flex-1 rounded-lg bg-green-600 text-white px-4 py-2 font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      {actionLoading === moderation.id
                        ? "Procesando..."
                        : "Aprobar"}
                    </button>
                    <button
                      onClick={() => {
                        const notes = prompt(
                          "Razón del rechazo (opcional):"
                        );
                        handleModeration(moderation.id, "REJECTED", notes || undefined);
                      }}
                      disabled={actionLoading === moderation.id}
                      className="flex-1 rounded-lg bg-red-600 text-white px-4 py-2 font-medium hover:bg-red-700 disabled:opacity-50"
                    >
                      {actionLoading === moderation.id
                        ? "Procesando..."
                        : "Rechazar"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          moderation.status === "APPROVED"
                            ? "bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100"
                            : "bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100"
                        }`}
                      >
                        {moderation.status === "APPROVED"
                          ? "Aprobado"
                          : "Rechazado"}
                      </span>
                      {moderation.reviewer && (
                        <span className="text-sm text-zinc-600 dark:text-zinc-400 ml-2">
                          por {moderation.reviewer.email}
                        </span>
                      )}
                    </div>
                    {moderation.notes && (
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        Nota: {moderation.notes}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
