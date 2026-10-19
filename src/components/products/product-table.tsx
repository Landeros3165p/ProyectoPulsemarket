"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { softDeleteProduct } from "@/app/(dashboard)/products/actions";
import { cn, formatCurrency } from "@/lib/utils";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
}

export type ProductSortField = "createdAt" | "name" | "price" | "stock";
export type SortOrder = "asc" | "desc";

export interface ProductFilters {
  q: string;
  category: string;
  sort: ProductSortField;
  order: SortOrder;
}

interface ProductTableProps {
  products: Product[];
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  filters?: ProductFilters;
  categories?: string[];
}

const defaultFilters: ProductFilters = {
  q: "",
  category: "",
  sort: "createdAt",
  order: "desc",
};

const numberFormatter = new Intl.NumberFormat("es-MX");

const sortableColumns: { field: ProductSortField | null; label: string; align?: "right" }[] = [
  { field: "name", label: "Nombre" },
  { field: null, label: "Categoría" },
  { field: "price", label: "Precio", align: "right" },
  { field: "stock", label: "Stock", align: "right" },
  { field: null, label: "SKU" },
];

function buildQuery(filters: ProductFilters, page: number): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (filters.sort !== defaultFilters.sort) params.set("sort", filters.sort);
  if (filters.order !== defaultFilters.order) params.set("order", filters.order);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `?${query}` : "";
}

function getPageNumbers(currentPage: number, totalPages: number): (number | "gap")[] {
  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
  const result: (number | "gap")[] = [];

  sorted.forEach((page, index) => {
    const previous = sorted[index - 1];
    if (previous !== undefined && page - previous > 1) result.push("gap");
    result.push(page);
  });

  return result;
}

function StockBadge({ stock }: { stock: number }) {
  const tone =
    stock === 0
      ? "bg-rose-50 text-rose-700 ring-rose-200"
      : stock < 10
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : "bg-emerald-50 text-emerald-700 ring-emerald-200";

  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ring-1", tone)}>
      {stock === 0 ? "Agotado" : numberFormatter.format(stock)}
    </span>
  );
}

function SortIcon({ active, order }: { active: boolean; order: SortOrder }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        "h-3.5 w-3.5 transition",
        active ? "text-indigo-600" : "text-slate-300 group-hover:text-slate-400",
        active && order === "asc" && "rotate-180",
      )}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ProductTable({
  products,
  currentPage,
  totalPages,
  totalItems,
  pageSize = 15,
  filters = defaultFilters,
  categories = [],
}: ProductTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(filters.q);
  const [hiddenIds, setHiddenIds] = useState<ReadonlySet<string>>(() => new Set());
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const lastSubmittedSearch = useRef(filters.q);

  function navigate(nextFilters: ProductFilters, page = 1) {
    startTransition(() => {
      router.replace(`${pathname}${buildQuery(nextFilters, page)}`, { scroll: false });
    });
  }

  useEffect(() => {
    const term = search.trim();
    if (term === lastSubmittedSearch.current) return;

    const timeout = window.setTimeout(() => {
      lastSubmittedSearch.current = term;
      startTransition(() => {
        router.replace(`${pathname}${buildQuery({ ...filters, q: term }, 1)}`, {
          scroll: false,
        });
      });
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [search, filters, pathname, router]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function toggleSort(field: ProductSortField) {
    const order: SortOrder =
      filters.sort === field ? (filters.order === "asc" ? "desc" : "asc") : "asc";
    navigate({ ...filters, sort: field, order }, 1);
  }

  function clearFilters() {
    setSearch("");
    lastSubmittedSearch.current = "";
    navigate(defaultFilters, 1);
  }

  async function handleDelete(product: Product) {
    setConfirmingId(null);
    setErrorMessage(null);
    setDeletingId(product.id);
    setHiddenIds((current) => new Set(current).add(product.id));

    try {
      await softDeleteProduct(product.id);
      setNotice(`"${product.name}" se retiró del catálogo.`);
      startTransition(() => router.refresh());
    } catch {
      setHiddenIds((current) => {
        const next = new Set(current);
        next.delete(product.id);
        return next;
      });
      setErrorMessage(`No se pudo eliminar "${product.name}". Inténtalo de nuevo.`);
    } finally {
      setDeletingId(null);
    }
  }

  const visibleProducts = products.filter((product) => !hiddenIds.has(product.id));
  const total = totalItems ?? products.length;
  const firstItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, total);
  const hasFilters = Boolean(filters.q || filters.category);

  return (
    <section className="card relative overflow-hidden">
      {isPending && (
        <span className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-indigo-100">
          <span className="animate-progress block h-full w-1/3 bg-indigo-500" />
        </span>
      )}

      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Buscar productos</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre o SKU..."
            className="field-input mt-0 pl-9"
          />
        </label>
        <label className="sm:w-52">
          <span className="sr-only">Filtrar por categoría</span>
          <select
            value={filters.category}
            onChange={(event) => navigate({ ...filters, category: event.target.value }, 1)}
            className="field-input mt-0"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        {hasFilters && (
          <button type="button" onClick={clearFilters} className="btn-secondary">
            Limpiar
          </button>
        )}
      </div>

      {(errorMessage || notice) && (
        <div className="border-b border-slate-200 px-4 py-3">
          {errorMessage ? (
            <p role="alert" className="flex items-center justify-between gap-3 text-sm text-rose-700">
              {errorMessage}
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-xs font-semibold underline"
              >
                Cerrar
              </button>
            </p>
          ) : (
            <p aria-live="polite" className="animate-fade-in text-sm text-emerald-700">
              {notice}
            </p>
          )}
        </div>
      )}

      <div
        aria-label="Tabla de productos"
        aria-busy={isPending}
        className={cn(
          "scrollbar-thin max-w-full overflow-x-auto transition-opacity",
          isPending && "opacity-60",
        )}
        role="region"
        tabIndex={0}
      >
        <table className="w-full min-w-[48rem] text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {sortableColumns.map((column) => {
                const isActive = column.field !== null && filters.sort === column.field;
                return (
                  <th
                    key={column.label}
                    scope="col"
                    aria-sort={
                      isActive ? (filters.order === "asc" ? "ascending" : "descending") : undefined
                    }
                    className={cn("px-6 py-3 font-medium", column.align === "right" && "text-right")}
                  >
                    {column.field ? (
                      <button
                        type="button"
                        onClick={() => column.field && toggleSort(column.field)}
                        className={cn(
                          "group inline-flex items-center gap-1 uppercase tracking-wide hover:text-slate-900",
                          isActive && "text-slate-900",
                        )}
                      >
                        {column.label}
                        <SortIcon active={isActive} order={filters.order} />
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                );
              })}
              <th scope="col" className="px-6 py-3 text-right font-medium">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleProducts.map((product) => (
              <tr key={product.id} className="animate-fade-in transition-colors hover:bg-slate-50/80">
                <td className="max-w-xs px-6 py-3.5">
                  <p className="truncate font-medium text-slate-900">{product.name}</p>
                </td>
                <td className="px-6 py-3.5">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-right font-medium tabular-nums text-slate-900">
                  {formatCurrency(product.price)}
                </td>
                <td className="px-6 py-3.5 text-right">
                  <StockBadge stock={product.stock} />
                </td>
                <td className="px-6 py-3.5 font-mono text-xs text-slate-500">{product.sku}</td>
                <td className="whitespace-nowrap px-6 py-3.5 text-right">
                  {confirmingId === product.id ? (
                    <span className="inline-flex items-center gap-2 animate-fade-in">
                      <button
                        type="button"
                        onClick={() => void handleDelete(product)}
                        className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-700"
                      >
                        Confirmar
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        className="rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                      >
                        Cancelar
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={deletingId === product.id}
                      onClick={() => setConfirmingId(product.id)}
                      aria-label={`Eliminar ${product.name}`}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                      </svg>
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {visibleProducts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <p className="font-medium text-slate-900">No se encontraron productos</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {hasFilters
                      ? "Prueba con otros filtros o limpia la búsqueda."
                      : "Crea tu primer producto con el formulario superior."}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span className="text-xs text-slate-500">
          Mostrando <span className="font-semibold text-slate-700">{numberFormatter.format(firstItem)}</span>–
          <span className="font-semibold text-slate-700">{numberFormatter.format(lastItem)}</span> de{" "}
          <span className="font-semibold text-slate-700">{numberFormatter.format(total)}</span> ·
          Página {currentPage} de {totalPages}
        </span>
        <nav aria-label="Paginación" className="flex items-center gap-1">
          {currentPage <= 1 ? (
            <button
              type="button"
              disabled
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-400"
            >
              Anterior
            </button>
          ) : (
            <Link
              href={`${pathname}${buildQuery(filters, currentPage - 1)}`}
              scroll={false}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Anterior
            </Link>
          )}
          <span className="hidden items-center gap-1 sm:flex">
            {getPageNumbers(currentPage, totalPages).map((page, index) =>
              page === "gap" ? (
                <span key={`gap-${index}`} className="px-1 text-xs text-slate-400">
                  …
                </span>
              ) : (
                <Link
                  key={page}
                  href={`${pathname}${buildQuery(filters, page)}`}
                  scroll={false}
                  aria-current={page === currentPage ? "page" : undefined}
                  className={cn(
                    "min-w-[2rem] rounded-lg px-2 py-1.5 text-center text-xs font-medium transition",
                    page === currentPage
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 hover:bg-slate-100",
                  )}
                >
                  {page}
                </Link>
              ),
            )}
          </span>
          {currentPage >= totalPages ? (
            <button
              type="button"
              disabled
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-400"
            >
              Siguiente
            </button>
          ) : (
            <Link
              href={`${pathname}${buildQuery(filters, currentPage + 1)}`}
              scroll={false}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Siguiente
            </Link>
          )}
        </nav>
      </div>
    </section>
  );
}
