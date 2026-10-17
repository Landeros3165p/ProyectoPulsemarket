import { KPICards, type KPICardData } from "@/components/dashboard/kpi-cards";
import { getDashboardMetrics } from "@/services/analytics";

export const dynamic = "force-dynamic";

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});
const numberFormatter = new Intl.NumberFormat("es-MX");

export default async function DashboardPage() {
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
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">
        Panel de Analítica
      </h1>
      <KPICards data={kpiData} />
    </div>
  );
}
