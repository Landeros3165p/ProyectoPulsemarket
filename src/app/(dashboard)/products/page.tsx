import { Suspense } from "react";
import type { Prisma } from "@prisma/client";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  ProductTable,
  type ProductFilters,
  type ProductSortField,
} from "@/components/products/product-table";
import { ProductManagement } from "@/components/products/product-management";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

const pageSize = 15;
const defaultCategories = ["Electrónica", "Muebles", "Ropa", "Hogar", "Deportes"];
const sortFields: readonly ProductSortField[] = ["createdAt", "name", "price", "stock"];

type RawSearchParams = Record<string, string | string[] | undefined>;

interface ProductsPageProps {
  searchParams: Promise<RawSearchParams>;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseFilters(params: RawSearchParams): ProductFilters & { page: number } {
  const parsedPage = Number(firstValue(params.page) ?? "1");
  const sortParam = firstValue(params.sort);
  const orderParam = firstValue(params.order);

  return {
    page: Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
    q: (firstValue(params.q) ?? "").trim().slice(0, 100),
    category: (firstValue(params.category) ?? "").trim(),
    sort: sortFields.find((field) => field === sortParam) ?? "createdAt",
    order: orderParam === "asc" ? "asc" : "desc",
  };
}

async function getCategories() {
  await requireSession();
  const groups = await db.product.groupBy({
    by: ["category"],
    where: { deletedAt: null },
    orderBy: { category: "asc" },
  });

  return Array.from(
    new Set([...defaultCategories, ...groups.map((group) => group.category)]),
  );
}

async function ProductCatalog({
  filters,
  categories,
}: {
  filters: ProductFilters & { page: number };
  categories: string[];
}) {
  await requireSession();

  const where: Prisma.ProductWhereInput = {
    deletedAt: null,
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.q
      ? {
          OR: [
            { name: { contains: filters.q, mode: "insensitive" } },
            { sku: { contains: filters.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const totalItems = await db.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(filters.page, totalPages);
  const products = await db.product.findMany({
    where,
    take: pageSize,
    skip: (currentPage - 1) * pageSize,
    orderBy: [{ [filters.sort]: filters.order }, { id: "asc" }],
    select: {
      id: true,
      name: true,
      category: true,
      price: true,
      stock: true,
      sku: true,
    },
  });

  return (
    <ProductTable
      products={products}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      pageSize={pageSize}
      filters={{
        q: filters.q,
        category: filters.category,
        sort: filters.sort,
        order: filters.order,
      }}
      categories={categories}
    />
  );
}

function CatalogSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl sm:w-48" />
      </div>
      <div className="space-y-px">
        <Skeleton className="h-11 w-full rounded-none bg-slate-100" />
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="flex items-center gap-6 px-6 py-4">
            <Skeleton className="h-4 flex-[2]" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const filters = parseFilters(await searchParams);
  const categories = await getCategories();
  const suspenseKey = `${filters.q}|${filters.category}|${filters.sort}|${filters.order}|${filters.page}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Catálogo de Productos
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Crea, filtra y administra el inventario. Los datos se paginan y
          ordenan en el servidor.
        </p>
      </div>
      <ProductManagement categories={categories} />
      <Suspense key={suspenseKey} fallback={<CatalogSkeleton />}>
        <ProductCatalog filters={filters} categories={categories} />
      </Suspense>
    </div>
  );
}
