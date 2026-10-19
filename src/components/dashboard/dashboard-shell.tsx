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

<<<<<<< HEAD
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
=======
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
>>>>>>> 4076d47cc835c72beeea38bd38be7a0c237b5739
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
<<<<<<< HEAD
        strokeWidth="2.5"
=======
        strokeWidth="2"
>>>>>>> 4076d47cc835c72beeea38bd38be7a0c237b5739
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
<<<<<<< HEAD
        <path d="M3 12h4l3-8 4 16 3-8h4" />
=======
        <path d="M3 12h4l3-7 4 14 3-7h4" />
>>>>>>> 4076d47cc835c72beeea38bd38be7a0c237b5739
      </svg>
    </span>
  );
}

<<<<<<< HEAD
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
=======
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
>>>>>>> 4076d47cc835c72beeea38bd38be7a0c237b5739
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
<<<<<<< HEAD
        aria-label="Menú lateral"
        className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex"
      >
        {sidebar}
=======
        aria-label="Menú principal"
        className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-slate-200/80 bg-white px-4 py-4 md:flex"
      >
        <SidebarContent pathname={pathname} closeMenu={closeMenu} />
>>>>>>> 4076d47cc835c72beeea38bd38be7a0c237b5739
      </aside>

      {isMenuOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
<<<<<<< HEAD
          className="animate-fade-in fixed inset-0 z-40 cursor-default bg-slate-950/40 backdrop-blur-sm lg:hidden"
=======
          className="fixed inset-0 z-40 cursor-default bg-slate-950/40 md:hidden"
>>>>>>> 4076d47cc835c72beeea38bd38be7a0c237b5739
          onClick={closeMenu}
        />
      )}
      <aside
        id="dashboard-navigation"
        aria-label="Menú principal"
        aria-hidden={!isMenuOpen}
        inert={!isMenuOpen}
<<<<<<< HEAD
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
=======
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
>>>>>>> 4076d47cc835c72beeea38bd38be7a0c237b5739
    </div>
  );
}
