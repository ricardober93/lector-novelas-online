"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { fetcher } from "@/lib/fetcher";

type UserProfile = {
  name: string | null;
  email: string | null;
  image: string | null;
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile>({
    name: null,
    email: null,
    image: null,
  });

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const data = await fetcher<{
          name: string | null;
          email: string | null;
          image: string | null;
        }>("/api/user");

        console.log(data, "api/puser");
        setUser({
          name: data.name ?? null,
          email: data.email ?? null,
          image: data.image ?? null,
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Error desconocido";
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function save() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await fetcher("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: user.name }),
      });

      setSuccess("Perfil actualizado correctamente");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error desconocido";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">
          Cargando perfil...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 dark:bg-black px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">
          Perfil de usuario
        </h1>

        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20 text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-lg border border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20 text-green-700 dark:text-green-400">
            {success}
          </div>
        )}

        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
              {user.image ? (
                <Image
                  src={user.image}
                  alt="Avatar"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl text-zinc-400">
                  {user.name?.[0]?.toUpperCase() ||
                    user.email?.[0]?.toUpperCase() ||
                    "?"}
                </span>
              )}
            </div>
            <div>
              <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                {user.name || "Sin nombre"}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {user.email}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={user.name ?? ""}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Avatar URL
              </label>
              <input
                type="text"
                value={user.image ?? ""}
                onChange={(e) => setUser({ ...user, image: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                placeholder="https://example.com/avatar.jpg"
              />
              {user.image && (
                <div className="mt-3 w-20 h-20 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700">
                  <Image
                    src={user.image}
                    alt="Avatar preview"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={save}
                disabled={saving}
                className="w-full md:w-auto px-6 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
