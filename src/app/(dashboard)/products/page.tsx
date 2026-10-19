import { ProductTable } from "@/components/products/product-table";
import { ProductManagement } from "@/components/products/product-management";
import { getPaginatedProducts } from "./actions";

export const dynamic = "force-dynamic";

interface ProductsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const { page: pageParameter } = await searchParams;
  const parsedPage = Number(pageParameter ?? "1");
  const page =
    Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const result = await getPaginatedProducts(page);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-500">
          Gestión de inventario
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Catálogo de Productos
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Crea y administra tu inventario. Los datos se paginan en el servidor.
        </p>
      </div>
      <ProductManagement />
      <ProductTable
        products={result.products}
        currentPage={result.currentPage}
        totalPages={result.totalPages}
      />
    </div>
  );
}
