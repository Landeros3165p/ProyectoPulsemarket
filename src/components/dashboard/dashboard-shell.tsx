"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { cn } from "@/lib/utils";

export interface DashboardUser {
  name: string | null;
  email: string | null;
  image: string | null;
}

interface DashboardShellProps {
  children: ReactNode;
  user?: DashboardUser;
}

type IconName = "chart" | "kanban" | "box";

const navigationLinks: { href: string; label: string; icon: IconName }[] = [
  { href: "/dashboard", label: "Métricas", icon: "chart" },
  { href: "/kanban", label: "Kanban (Tareas)", icon: "kanban" },
  { href: "/products", label: "Productos", icon: "box" },
];

const pageTitles: Record<string, string> = {
  "/dashboard": "Panel de analítica",
  "/kanban": "Gestor Kanban",
  "/products": "Catálogo de productos",
};

function NavIcon({ name, className }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    chart: (
      <>
        <path d="M3 3v18h18" />
        <path d="m7 15 4-4 3 3 5-6" />
      </>
    ),
    kanban: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 3v18M15 3v18" />
      </>
    ),
    box: (
      <>
        <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
        <path d="m3 8 9 5 9-5M12 13v8" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}

function BrandMark() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M3 12h4l3-8 4 16 3-8h4" />
      </svg>
    </span>
  );
}

function getInitials(user?: DashboardUser): string {
  const source = user?.name ?? user?.email ?? "PM";
  const initials = source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "PM";
}

export function DashboardShell({ children, user }: DashboardShellProps) {
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

  function closeMenu() {
    setIsMenuOpen(false);
  }

  const currentTitle =
    Object.entries(pageTitles).find(
      ([href]) => pathname === href || pathname.startsWith(`${href}/`),
    )?.[1] ?? "PulseMarket";

  const sidebar = (
    <>
      <div className="flex h-16 items-center justify-between gap-3 px-5">
        <Link href="/dashboard" onClick={closeMenu} className="flex items-center gap-3">
          <BrandMark />
          <span className="text-lg font-bold tracking-tight text-slate-900">
            PulseMarket
          </span>
        </Link>
        <button
          type="button"
          onClick={closeMenu}
          aria-label="Cerrar menú"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
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

      <nav aria-label="Navegación principal" className="mt-4 flex-1 space-y-1 px-3">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          General
        </p>
        {navigationLinks.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <NavIcon
                name={link.icon}
                className={cn(
                  "h-5 w-5 transition",
                  isActive
                    ? "text-indigo-600"
                    : "text-slate-400 group-hover:text-slate-600",
                )}
              />
              {link.label}
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-semibold text-white">
            {getInitials(user)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {user?.name ?? "Usuario"}
            </p>
            <p className="truncate text-xs text-slate-500">
              {user?.email ?? "Sesión activa"}
            </p>
          </div>
        </div>
        <LogoutButton />
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <aside
        aria-label="Menú lateral"
        className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex"
      >
        {sidebar}
      </aside>

      {isMenuOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="animate-fade-in fixed inset-0 z-40 cursor-default bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={closeMenu}
        />
      )}

      <aside
        id="dashboard-navigation"
        aria-label="Menú principal"
        aria-hidden={!isMenuOpen}
        inert={!isMenuOpen}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden",
          isMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebar}
      </aside>

      <div className="min-w-0 lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <button
            type="button"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-controls="dashboard-navigation"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden"
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
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-400">PulseMarket</p>
            <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">
              {currentTitle}
            </p>
          </div>
          <span className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            En línea
          </span>
          <span
            title={user?.email ?? undefined}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white"
          >
            {getInitials(user)}
          </span>
        </header>

        <main id="main-content" className="min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
