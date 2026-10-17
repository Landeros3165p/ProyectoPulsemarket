import Link from "next/link";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-900">PulseMarket</h2>
        <nav aria-label="Navegación principal" className="mt-8 space-y-2">
          <Link
            href="/"
            className="block rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900"
          >
            Métricas
          </Link>
          <Link
            href="/kanban"
            className="block rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Kanban (Tareas)
          </Link>
          <Link
            href="/products"
            className="block rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Productos
          </Link>
        </nav>
      </aside>

      <main className="min-w-0 flex-1 bg-slate-50 p-8">{children}</main>
    </div>
  );
}
