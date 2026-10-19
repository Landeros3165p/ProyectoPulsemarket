import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type KPITrend = "up" | "down" | "neutral";
export type KPIIcon = "revenue" | "orders" | "customers" | "ticket";

export interface KPICardData {
  title: string;
  value: string;
  change: string;
  trend?: KPITrend;
  icon?: KPIIcon;
}

interface KPICardsProps {
  data?: KPICardData[];
  isLoading?: boolean;
}

const iconStyles: Record<KPIIcon, string> = {
  revenue: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  orders: "bg-sky-50 text-sky-600 ring-sky-100",
  customers: "bg-violet-50 text-violet-600 ring-violet-100",
  ticket: "bg-amber-50 text-amber-600 ring-amber-100",
};

const iconPaths: Record<KPIIcon, ReactNode> = {
  revenue: (
    <>
      <path d="M12 2v20" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </>
  ),
  orders: (
    <>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
    </>
  ),
  customers: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  ticket: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </>
  ),
};

const trendStyles: Record<KPITrend, string> = {
  up: "bg-emerald-50 text-emerald-700",
  down: "bg-rose-50 text-rose-700",
  neutral: "bg-slate-100 text-slate-600",
};

function TrendArrow({ trend }: { trend: KPITrend }) {
  if (trend === "neutral") return null;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-3.5 w-3.5", trend === "down" && "rotate-180")}
    >
      <path d="m7 17 10-10M7 7h10v10" />
    </svg>
  );
}

export function KPICardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="card p-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
          <Skeleton className="mt-4 h-8 w-36" />
          <Skeleton className="mt-3 h-5 w-28 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function KPICards({ data, isLoading = false }: KPICardsProps) {
  if (isLoading || !data) {
    return <KPICardsSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {data.map((kpi, index) => {
        const trend = kpi.trend ?? "neutral";
        const icon = kpi.icon ?? "revenue";

        return (
          <section
            key={kpi.title}
            aria-label={kpi.title}
            style={{ animationDelay: `${index * 60}ms` }}
            className="card animate-slide-up group p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-sm font-medium text-slate-500">{kpi.title}</h2>
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1",
                  iconStyles[icon],
                )}
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
                  {iconPaths[icon]}
                </svg>
              </span>
            </div>
            <p className="mt-3 break-words text-2xl font-bold tabular-nums tracking-tight text-slate-900 lg:text-xl 2xl:text-2xl">
              {kpi.value}
            </p>
            <span
              className={cn(
                "mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                trendStyles[trend],
              )}
            >
              <TrendArrow trend={trend} />
              {kpi.change}
            </span>
          </section>
        );
      })}
    </div>
  );
}
