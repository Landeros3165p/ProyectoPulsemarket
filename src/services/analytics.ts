import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import {
  calculateRevenueGrowth,
  roundCurrency,
} from "@/lib/metrics";

export interface AnalyticsMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  revenueGrowth: number;
}

export async function getDashboardMetrics(): Promise<AnalyticsMetrics> {
  await requireSession();

  const now = new Date();
  const currentPeriodStart = new Date(now);
  currentPeriodStart.setDate(currentPeriodStart.getDate() - 30);
  const previousPeriodStart = new Date(currentPeriodStart);
  previousPeriodStart.setDate(previousPeriodStart.getDate() - 30);

  const [
    salesAggregate,
    currentSalesAggregate,
    previousSalesAggregate,
    totalCustomers,
    totalOrders,
  ] = await Promise.all([
    db.sale.aggregate({
      _sum: { amount: true },
    }),
    db.sale.aggregate({
      where: { createdAt: { gte: currentPeriodStart } },
      _sum: { amount: true },
    }),
    db.sale.aggregate({
      where: {
        createdAt: {
          gte: previousPeriodStart,
          lt: currentPeriodStart,
        },
      },
      _sum: { amount: true },
    }),
    db.customer.count(),
    db.sale.count(),
  ]);

  const totalRevenue = salesAggregate._sum.amount ?? 0;
  const currentRevenue = currentSalesAggregate._sum.amount ?? 0;
  const previousRevenue = previousSalesAggregate._sum.amount ?? 0;

  return {
    totalRevenue: roundCurrency(totalRevenue),
    totalOrders,
    totalCustomers,
    revenueGrowth: calculateRevenueGrowth(currentRevenue, previousRevenue),
  };
}
