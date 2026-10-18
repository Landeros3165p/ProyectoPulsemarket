import { Skeleton } from "@/components/ui/skeleton";

export interface KPICardData {
  title: string;
  value: string;
  change: string;
}

interface KPICardsProps {
  data?: KPICardData[];
  isLoading?: boolean;
}

export function KPICards({ data, isLoading = false }: KPICardsProps) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {data.map((kpi) => (
        <section
          key={kpi.title}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-sm font-medium text-slate-500">{kpi.title}</h2>
          <p className="mt-2 break-words text-2xl font-bold text-slate-900 sm:text-3xl">
            {kpi.value}
          </p>
          <span className="mt-2 inline-block text-xs font-semibold text-emerald-600">
            {kpi.change} vs. mes anterior
          </span>
        </section>
      ))}
    </div>
  );
}
