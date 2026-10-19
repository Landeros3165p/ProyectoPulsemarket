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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  const accents = [
    {
      icon: (
        <>
          <path d="M12 3v18m5-13H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </>
      ),
      iconClass: "bg-indigo-50 text-indigo-600",
      label: "Ingresos acumulados",
    },
    {
      icon: (
        <>
          <rect x="4" y="5" width="16" height="16" rx="2" />
          <path d="M8 3v4m8-4v4M4 10h16" />
        </>
      ),
      iconClass: "bg-sky-50 text-sky-600",
      label: "Órdenes procesadas",
    },
    {
      icon: (
        <>
          <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m6-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm10 10v-2a4 4 0 0 0-3-3.87m-1-12a4 4 0 0 1 0 7.75" />
        </>
      ),
      iconClass: "bg-violet-50 text-violet-600",
      label: "Clientes registrados",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {data.map((kpi, index) => {
        const accent = accents[index % accents.length];
        return (
          <section
            key={kpi.title}
            className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-500">
                  {kpi.title}
                </h2>
                <p className="mt-3 break-words text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[1.75rem]">
                  {kpi.value}
                </p>
              </div>
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent.iconClass}`}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  {accent.icon}
                </svg>
              </span>
            </div>
            <span className="mt-4 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              {index === 0
                ? `${kpi.change} vs. periodo anterior`
                : accent.label}
            </span>
          </section>
        );
      })}
    </div>
  );
}
