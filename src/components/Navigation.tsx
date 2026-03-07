"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const { data: session, status } = useSession();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPanelDropdownOpen, setIsPanelDropdownOpen] = useState(false);
  const pathname = usePathname();

  const hasPanelAccess =
    session?.user?.role === "CREATOR" || session?.user?.role === "ADMIN";
  const isAdmin = session?.user?.role === "ADMIN";

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDropdown = () => setIsPanelDropdownOpen(!isPanelDropdownOpen);
  const closeDropdown = () => setIsPanelDropdownOpen(false);

  const handleSignOut = () => {
    closeDrawer();
    signOut({ callbackUrl: "/" });
  };

  useEffect(() => {
    setIsDrawerOpen(false);
    setIsPanelDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDrawerOpen(false);
        setIsPanelDropdownOpen(false);
      }
    };

    if (isDrawerOpen || isPanelDropdownOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isDrawerOpen, isPanelDropdownOpen]);

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  return (
    <>
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <Link
          href="/"
          className="text-xl font-bold text-zinc-900 dark:text-zinc-50"
        >
          Panels
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-4">
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

              {hasPanelAccess && (
                <div className="relative">
                  <button
                    onClick={toggleDropdown}
                    onBlur={() => setTimeout(closeDropdown, 150)}
                    aria-expanded={isPanelDropdownOpen}
                    aria-haspopup="true"
                    className="flex items-center gap-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  >
                    Panel
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${isPanelDropdownOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isPanelDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-lg z-50">
                      <Link
                        href="/creator"
                        onClick={closeDropdown}
                        className="block px-4 py-2 text-sm text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-t-lg"
                      >
                        Creator Panel
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={closeDropdown}
                          className="block px-4 py-2 text-sm text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-b-lg"
                        >
                          Admin Panel
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleSignOut}
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

        {/* Mobile Hamburger Button */}
        <button
          onClick={openDrawer}
          className="lg:hidden p-2 rounded-lg text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          aria-label="Open navigation menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </nav>

      {/* Drawer - Only renders when open */}
      {isDrawerOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-in fade-in duration-200"
            onClick={closeDrawer}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div
            style={{ width: "256px" }}
            className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shadow-xl z-50 lg:hidden animate-in slide-in-from-left duration-300 transition-all"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
                <Link
                  href="/"
                  className="text-xl font-bold text-zinc-900 dark:text-zinc-50"
                  onClick={closeDrawer}
                >
                  Panels
                </Link>
                <button
                  onClick={closeDrawer}
                  className="p-2 rounded-lg text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  aria-label="Close navigation menu"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {status === "loading" ? (
                  <div className="h-8 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                ) : session ? (
                  <div className="space-y-2">
                    <Link
                      href="/profile"
                      onClick={closeDrawer}
                      className="block rounded-lg bg-zinc-100 dark:bg-zinc-800 px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    >
                      Perfil
                    </Link>

                    {hasPanelAccess && (
                      <div className="space-y-2 pt-2">
                        <div className="px-4 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                          Panel
                        </div>
                        <Link
                          href="/creator"
                          onClick={closeDrawer}
                          className="block rounded-lg bg-zinc-100 dark:bg-zinc-800 px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        >
                          Creator Panel
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={closeDrawer}
                            className="block rounded-lg bg-zinc-100 dark:bg-zinc-800 px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          >
                            Admin Panel
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={closeDrawer}
                    className="block rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white text-center hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Ingresar
                  </Link>
                )}
              </div>

              {/* Footer */}
              {session && (
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    onClick={handleSignOut}
                    className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
