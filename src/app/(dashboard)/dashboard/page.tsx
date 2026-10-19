import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { KPICards, type KPICardData } from "@/components/dashboard/kpi-cards";
import { getDashboardMetrics } from "@/services/analytics";

export const dynamic = "force-dynamic";

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});
const numberFormatter = new Intl.NumberFormat("es-MX");

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const metrics = await getDashboardMetrics();
  const kpiData: KPICardData[] = [
    {
      title: "Ventas Totales",
      value: currencyFormatter.format(metrics.totalRevenue),
      change: `${metrics.revenueGrowth >= 0 ? "+" : ""}${metrics.revenueGrowth}%`,
    },
    {
      title: "Órdenes",
      value: numberFormatter.format(metrics.totalOrders),
      change: "Total acumulado",
    },
    {
      title: "Clientes",
      value: numberFormatter.format(metrics.totalCustomers),
      change: "Total registrados",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-500">
            Resumen de rendimiento
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Panel de Analítica
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Hola, PulseMarket. Resumen del rendimiento de tu tienda.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4 text-indigo-500"
          >
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 10h18" />
          </svg>
          Últimos 30 días
        </span>
      </div>
      <KPICards data={kpiData} />
    </div>
  );
}
