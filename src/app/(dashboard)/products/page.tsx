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
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900 sm:text-3xl">
        Catálogo de Productos
      </h1>
      <ProductManagement />
      <ProductTable
        products={result.products}
        currentPage={result.currentPage}
        totalPages={result.totalPages}
      />
    </div>
  );
}
