"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { LogoutButton } from "@/components/auth/logout-button";

interface DashboardShellProps {
  children: ReactNode;
}

const navigationLinks = [
  { href: "/dashboard", label: "Métricas" },
  { href: "/kanban", label: "Kanban (Tareas)" },
  { href: "/products", label: "Productos" },
];

export function DashboardShell({ children }: DashboardShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsMenuOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isMenuOpen]);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <div className="min-h-screen">
      {isMenuOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 cursor-default bg-slate-950/40"
          onClick={closeMenu}
        />
      )}

      <aside
        id="dashboard-navigation"
        aria-label="Menú principal"
        aria-hidden={!isMenuOpen}
        inert={!isMenuOpen}
        className={`fixed bottom-0 left-0 top-16 z-50 flex w-72 max-w-[85vw] flex-col border-r border-slate-200 bg-white p-5 shadow-xl transition-transform duration-200 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">PulseMarket</h2>
          <button
            type="button"
            onClick={closeMenu}
            aria-label="Cerrar menú"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <nav aria-label="Navegación principal" className="mt-8 space-y-2">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-8">
          <LogoutButton />
        </div>
      </aside>

      <main id="main-content" className="min-h-screen min-w-0">
        <header className="sticky top-0 z-[45] flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-3 backdrop-blur sm:px-6">
          <button
            type="button"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-controls="dashboard-navigation"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-6 w-6"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="truncate text-base font-semibold text-slate-900 sm:text-lg">
            PulseMarket
          </span>
        </header>
        <div className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
