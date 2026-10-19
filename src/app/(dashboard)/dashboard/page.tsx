import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { authOptions, requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateAverageOrderValue } from "@/lib/metrics";
import { cn, formatCurrency } from "@/lib/utils";
import {
  KPICards,
  KPICardsSkeleton,
  type KPICardData,
} from "@/components/dashboard/kpi-cards";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardMetrics } from "@/services/analytics";

export const dynamic = "force-dynamic";

const rangeOptions = [
  { value: 7, label: "7 días" },
  { value: 30, label: "30 días" },
  { value: 90, label: "90 días" },
] as const;

type RangeDays = (typeof rangeOptions)[number]["value"];

const numberFormatter = new Intl.NumberFormat("es-MX");
const compactCurrencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});
const dayFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

const categoryColors = [
  "bg-indigo-500",
  "bg-violet-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
];

interface DailyPoint {
  day: Date;
  total: number;
  orders: number;
}

interface CategoryRow {
  category: string;
  total: number;
  orders: number;
}

interface TopProductRow {
  id: string;
  name: string;
  sku: string;
  category: string;
  total: number;
  units: number;
}

interface DashboardPageProps {
  searchParams: Promise<{ range?: string }>;
}

function parseRange(value: string | undefined): RangeDays {
  const parsed = Number(value);
  return rangeOptions.find((option) => option.value === parsed)?.value ?? 30;
}

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

async function getRangeAnalytics(days: RangeDays) {
  await requireSession();

  const today = startOfUtcDay(new Date());
  const since = new Date(today);
  since.setUTCDate(since.getUTCDate() - (days - 1));

  const [dailyRows, categoryRows, topProducts, lowStock] = await Promise.all([
    db.$queryRaw<DailyPoint[]>(Prisma.sql`
      SELECT date_trunc('day', "createdAt" AT TIME ZONE 'UTC') AS day,
             COALESCE(SUM(amount), 0)::float8 AS total,
             COUNT(*)::int AS orders
      FROM "Sale"
      WHERE "createdAt" >= ${since}
      GROUP BY 1
      ORDER BY 1
    `),
    db.$queryRaw<CategoryRow[]>(Prisma.sql`
      SELECT p.category,
             COALESCE(SUM(s.amount), 0)::float8 AS total,
             COUNT(*)::int AS orders
      FROM "Sale" s
      JOIN "Product" p ON p.id = s."productId"
      WHERE s."createdAt" >= ${since}
      GROUP BY p.category
      ORDER BY total DESC
    `),
    db.$queryRaw<TopProductRow[]>(Prisma.sql`
      SELECT p.id, p.name, p.sku, p.category,
             COALESCE(SUM(s.amount), 0)::float8 AS total,
             COUNT(*)::int AS units
      FROM "Sale" s
      JOIN "Product" p ON p.id = s."productId"
      WHERE s."createdAt" >= ${since} AND p."deletedAt" IS NULL
      GROUP BY p.id
      ORDER BY total DESC
      LIMIT 5
    `),
    db.product.findMany({
      where: { deletedAt: null, stock: { lt: 10 } },
      orderBy: [{ stock: "asc" }, { name: "asc" }],
      take: 5,
      select: { id: true, name: true, sku: true, stock: true },
    }),
  ]);

  const totalsByDay = new Map(
    dailyRows.map((row) => [
      startOfUtcDay(new Date(row.day)).getTime(),
      { total: Number(row.total), orders: Number(row.orders) },
    ]),
  );

  const daily = Array.from({ length: days }, (_, index) => {
    const day = new Date(since);
    day.setUTCDate(since.getUTCDate() + index);
    const values = totalsByDay.get(day.getTime());
    return { day, total: values?.total ?? 0, orders: values?.orders ?? 0 };
  });

  return {
    daily,
    categories: categoryRows.map((row) => ({
      category: row.category,
      total: Number(row.total),
      orders: Number(row.orders),
    })),
    topProducts: topProducts.map((row) => ({
      ...row,
      total: Number(row.total),
      units: Number(row.units),
    })),
    lowStock,
  };
}

async function KPISection() {
  const metrics = await getDashboardMetrics();
  const growthTrend =
    metrics.revenueGrowth > 0 ? "up" : metrics.revenueGrowth < 0 ? "down" : "neutral";

  const kpiData: KPICardData[] = [
    {
      title: "Ventas Totales",
      value: formatCurrency(metrics.totalRevenue),
      change: `${metrics.revenueGrowth >= 0 ? "+" : ""}${metrics.revenueGrowth}% vs. 30 días previos`,
      trend: growthTrend,
      icon: "revenue",
    },
    {
      title: "Órdenes",
      value: numberFormatter.format(metrics.totalOrders),
      change: "Total acumulado",
      icon: "orders",
    },
    {
      title: "Clientes",
      value: numberFormatter.format(metrics.totalCustomers),
      change: "Total registrados",
      icon: "customers",
    },
    {
      title: "Ticket Promedio",
      value: formatCurrency(
        calculateAverageOrderValue(metrics.totalRevenue, metrics.totalOrders),
      ),
      change: "Por orden",
      icon: "ticket",
    },
  ];

  return <KPICards data={kpiData} />;
}

function RevenueChart({
  daily,
}: {
  daily: { day: Date; total: number; orders: number }[];
}) {
  const width = 640;
  const height = 220;
  const maxValue = Math.max(...daily.map((point) => point.total), 1);
  const step = daily.length > 1 ? width / (daily.length - 1) : width;
  const points = daily.map((point, index) => ({
    x: index * step,
    y: height - (point.total / maxValue) * (height - 12),
    ...point,
  }));
  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  const total = daily.reduce((sum, point) => sum + point.total, 0);
  const orders = daily.reduce((sum, point) => sum + point.orders, 0);
  const labelEvery = Math.ceil(daily.length / 6);
  const gridValues = [1, 0.75, 0.5, 0.25, 0];

  return (
    <div>
      <div className="flex flex-wrap items-end gap-x-8 gap-y-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Ingresos del periodo
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {formatCurrency(total)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Órdenes
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {numberFormatter.format(orders)}
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <div className="flex h-56 flex-col justify-between py-0.5 text-right text-[11px] text-slate-400">
          {gridValues.map((ratio) => (
            <span key={ratio}>{compactCurrencyFormatter.format(maxValue * ratio)}</span>
          ))}
        </div>
        <div className="relative h-56 min-w-0 flex-1">
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
            {gridValues.map((ratio) => (
              <span key={ratio} className="border-t border-dashed border-slate-200" />
            ))}
          </div>
          <svg
            role="img"
            aria-label="Gráfico de ingresos diarios"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full overflow-visible"
          >
            <defs>
              <linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgb(99 102 241)" stopOpacity="0.28" />
                <stop offset="100%" stopColor="rgb(99 102 241)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#revenue-fill)" />
            <path
              d={line}
              fill="none"
              stroke="rgb(79 70 229)"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            {points.map((point) => (
              <g key={point.day.toISOString()} className="group">
                <rect
                  x={point.x - step / 2}
                  y={0}
                  width={step}
                  height={height}
                  fill="transparent"
                />
                <line
                  x1={point.x}
                  x2={point.x}
                  y1={point.y}
                  y2={height}
                  stroke="rgb(99 102 241)"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                  className="opacity-0 transition group-hover:opacity-100"
                />
                <title>
                  {`${dayFormatter.format(point.day)}: ${formatCurrency(point.total)} · ${point.orders} órdenes`}
                </title>
              </g>
            ))}
          </svg>
        </div>
      </div>
      <div className="mt-2 flex justify-between pl-14 text-[11px] text-slate-400">
        {daily
          .filter((_, index) => index % labelEvery === 0 || index === daily.length - 1)
          .map((point, index, labels) => (
            <span
              key={point.day.toISOString()}
              className={index % 2 === 1 && index !== labels.length - 1 ? "hidden sm:inline" : undefined}
            >
              {dayFormatter.format(point.day)}
            </span>
          ))}
      </div>
    </div>
  );
}

function CategoryBreakdown({ categories }: { categories: CategoryRow[] }) {
  const total = categories.reduce((sum, row) => sum + row.total, 0);

  if (categories.length === 0) {
    return <EmptyState message="Sin ventas en este periodo." />;
  }

  return (
    <div className="space-y-5">
      <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
        {categories.map((row, index) => (
          <span
            key={row.category}
            title={row.category}
            className={categoryColors[index % categoryColors.length]}
            style={{ width: `${total ? (row.total / total) * 100 : 0}%` }}
          />
        ))}
      </div>
      <ul className="space-y-4">
        {categories.map((row, index) => {
          const share = total ? (row.total / total) * 100 : 0;
          return (
            <li key={row.category}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      categoryColors[index % categoryColors.length],
                    )}
                  />
                  {row.category}
                </span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(row.total)}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn("h-full rounded-full", categoryColors[index % categoryColors.length])}
                    style={{ width: `${share}%` }}
                  />
                </div>
                <span className="w-24 text-right text-xs text-slate-500">
                  {share.toFixed(1)}% · {numberFormatter.format(row.orders)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
      {message}
    </div>
  );
}

function Panel({
  title,
  description,
  action,
  className,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("card animate-slide-up p-5 sm:p-6", className)}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

async function AnalyticsSection({ days }: { days: RangeDays }) {
  const { daily, categories, topProducts, lowStock } = await getRangeAnalytics(days);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel
          title="Tendencia de ingresos"
          description={`Ventas diarias de los últimos ${days} días`}
          className="xl:col-span-2"
        >
          <RevenueChart daily={daily} />
        </Panel>
        <Panel title="Ventas por categoría" description="Participación en ingresos">
          <CategoryBreakdown categories={categories} />
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel
          title="Productos más vendidos"
          description="Top 5 por ingresos en el periodo"
          className="xl:col-span-2"
          action={
            <Link
              href="/products"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Ver catálogo →
            </Link>
          }
        >
          {topProducts.length === 0 ? (
            <EmptyState message="Sin ventas en este periodo." />
          ) : (
            <div className="-mx-5 overflow-x-auto sm:-mx-6">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <thead className="border-y border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-medium sm:px-6">Producto</th>
                    <th scope="col" className="px-5 py-3 font-medium">Categoría</th>
                    <th scope="col" className="px-5 py-3 text-right font-medium">Unidades</th>
                    <th scope="col" className="px-5 py-3 text-right font-medium sm:px-6">Ingresos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topProducts.map((product, index) => (
                    <tr key={product.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-3 sm:px-6">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">{product.name}</p>
                            <p className="text-xs text-slate-500">{product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{product.category}</td>
                      <td className="px-5 py-3 text-right text-slate-600">
                        {numberFormatter.format(product.units)}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-slate-900 sm:px-6">
                        {formatCurrency(product.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Alertas de inventario" description="Productos con menos de 10 unidades">
          {lowStock.length === 0 ? (
            <EmptyState message="Todo el inventario está en niveles saludables." />
          ) : (
            <ul className="space-y-3">
              {lowStock.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.sku}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                      product.stock === 0
                        ? "bg-rose-50 text-rose-700"
                        : "bg-amber-50 text-amber-700",
                    )}
                  >
                    {product.stock === 0 ? "Agotado" : `${product.stock} uds.`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}

function AnalyticsSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="card p-6 xl:col-span-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
          <Skeleton className="mt-6 h-8 w-40" />
          <Skeleton className="mt-6 h-56 w-full rounded-xl" />
        </div>
        <div className="card space-y-5 p-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-full rounded-full" />
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-9 w-full" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="card space-y-3 p-6 xl:col-span-2">
          <Skeleton className="h-5 w-48" />
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
        <div className="card space-y-3 p-6">
          <Skeleton className="h-5 w-40" />
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </>
  );
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const { range } = await searchParams;
  const days = parseRange(range);
  const firstName = session.user.name?.split(" ")[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Panel de Analítica
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {firstName ? `Hola, ${firstName}. ` : ""}Resumen del rendimiento de tu tienda.
          </p>
        </div>
        <nav
          aria-label="Rango de fechas"
          className="inline-flex self-start rounded-xl border border-slate-200 bg-white p-1 shadow-sm sm:self-auto"
        >
          {rangeOptions.map((option) => (
            <Link
              key={option.value}
              href={`/dashboard?range=${option.value}`}
              scroll={false}
              aria-current={option.value === days ? "page" : undefined}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition",
                option.value === days
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              {option.label}
            </Link>
          ))}
        </nav>
      </div>

      <Suspense fallback={<KPICardsSkeleton />}>
        <KPISection />
      </Suspense>

      <Suspense key={days} fallback={<AnalyticsSkeleton />}>
        <AnalyticsSection days={days} />
      </Suspense>
    </div>
  );
}
