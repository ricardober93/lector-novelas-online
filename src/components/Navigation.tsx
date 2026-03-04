"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export function Navigation() {
  const { data: session, status } = useSession();

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
      <Link href="/" className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
        Panels
      </Link>

      <div className="flex items-center gap-4">
        {status === "loading" ? (
          <div className="h-8 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        ) : session ? (
          <>
            <Link
              href="/profile"
              className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            >
              Perfil
            </Link>
            {(session.user?.role === "CREATOR" || session.user?.role === "ADMIN") && (
              <Link
                href={session.user?.role === "ADMIN" ? "/admin" : "/creator"}
                className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                Administración
              </Link>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Ingresar
          </Link>
        )}
      </div>
    </nav>
  );
}
