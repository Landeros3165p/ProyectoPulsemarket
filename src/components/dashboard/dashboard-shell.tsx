"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { LogoutButton } from "@/components/auth/logout-button";

interface DashboardShellProps {
  children: ReactNode;
}

const navigationLinks = [
  {
    href: "/dashboard",
    label: "Métricas",
    icon: (
      <path d="M4 19V5m0 14h16M7 15l4-4 3 2 5-6" />
    ),
  },
  {
    href: "/kanban",
    label: "Kanban (Tareas)",
    icon: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M9 4v16m6-16v16" />
      </>
    ),
  },
  {
    href: "/products",
    label: "Productos",
    icon: (
      <>
        <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
        <path d="m4.5 7.7 7.5 4.4 7.5-4.4M12 12.1V21" />
      </>
    ),
  },
];

function PulseMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-violet-200 ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M3 12h4l3-7 4 14 3-7h4" />
      </svg>
    </span>
  );
}

function SidebarContent({
  pathname,
  closeMenu,
}: {
  pathname: string;
  closeMenu: () => void;
}) {
  return (
    <>
      <Link
        href="/dashboard"
        onClick={closeMenu}
        className="flex items-center gap-3 px-1 py-2"
      >
        <PulseMark className="h-9 w-9" />
        <span className="text-lg font-extrabold tracking-tight text-slate-900">
          PulseMarket
        </span>
      </Link>

      <p className="mb-3 mt-9 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        General
      </p>
      <nav aria-label="Navegación principal" className="space-y-1.5">
        {navigationLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              aria-current={isActive ? "page" : undefined}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[18px] w-[18px] shrink-0"
              >
                {link.icon}
              </svg>
              <span className="flex-1">{link.label}</span>
              {isActive && (
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-indigo-500"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-100 pt-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
            PM
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-bold text-slate-800">
              PulseMarket
            </span>
            <span className="block truncate text-[11px] text-slate-500">
              Espacio de trabajo
            </span>
          </span>
        </div>
        <LogoutButton />
      </div>
    </>
  );
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsMenuOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isMenuOpen]);

  const pageLabel =
    navigationLinks.find((link) => link.href === pathname)?.label ??
    "Panel de analítica";

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <aside
        aria-label="Menú principal"
        className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-slate-200/80 bg-white px-4 py-4 md:flex"
      >
        <SidebarContent pathname={pathname} closeMenu={closeMenu} />
      </aside>

      {isMenuOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 cursor-default bg-slate-950/40 md:hidden"
          onClick={closeMenu}
        />
      )}
      <aside
        id="dashboard-navigation"
        aria-label="Menú principal"
        aria-hidden={!isMenuOpen}
        inert={!isMenuOpen}
        className={`fixed inset-y-0 left-0 z-50 flex w-60 max-w-[85vw] flex-col border-r border-slate-200 bg-white px-4 py-4 shadow-xl transition-transform duration-200 md:hidden ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={closeMenu}
            aria-label="Cerrar menú"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
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
        <SidebarContent pathname={pathname} closeMenu={closeMenu} />
      </aside>

      <main id="main-content" className="min-h-screen min-w-0 md:ml-60">
        <header className="sticky top-0 z-20 flex h-[58px] items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-controls="dashboard-navigation"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 md:hidden"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="h-5 w-5"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="min-w-0">
              <p className="truncate text-[10px] leading-tight text-slate-400">
                PulseMarket
              </p>
              <p className="truncate text-xs font-bold text-slate-800">
                {pageLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              En línea
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white shadow-sm shadow-indigo-200">
              PM
            </span>
          </div>
        </header>
        <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-7">
          {children}
        </div>
      </main>
    </div>
  );
}
