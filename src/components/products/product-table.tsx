import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
}

interface ProductTableProps {
  products: Product[];
  currentPage: number;
  totalPages: number;
}

export function ProductTable({
  products,
  currentPage,
  totalPages,
}: ProductTableProps) {
  return (
    <div
      aria-label="Tabla de productos"
      className="max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm"
      role="region"
      tabIndex={0}
    >
      <table className="w-full min-w-[42rem] text-left text-sm text-slate-600">
        <thead className="bg-slate-50 text-xs uppercase text-slate-700">
          <tr>
            <th scope="col" className="px-6 py-3">
              Nombre
            </th>
            <th scope="col" className="px-6 py-3">
              Categoría
            </th>
            <th scope="col" className="px-6 py-3">
              Precio
            </th>
            <th scope="col" className="px-6 py-3">
              Stock
            </th>
            <th scope="col" className="px-6 py-3">
              SKU
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-medium text-slate-900">
                {product.name}
              </td>
              <td className="px-6 py-4">{product.category}</td>
              <td className="px-6 py-4">{formatCurrency(product.price)}</td>
              <td className="px-6 py-4">{product.stock}</td>
              <td className="px-6 py-4">{product.sku}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 sm:px-6">
        <span className="text-xs text-slate-500">
          Página {currentPage} de {totalPages}
        </span>
        <div className="flex gap-2">
          {currentPage <= 1 ? (
            <button
              type="button"
              disabled
              className="rounded border border-slate-300 px-3 py-1 text-xs disabled:opacity-50"
            >
              Anterior
            </button>
          ) : (
            <Link
              href={`/products?page=${currentPage - 1}`}
              className="rounded border border-slate-300 px-3 py-1 text-xs"
            >
              Anterior
            </Link>
          )}
          {currentPage >= totalPages ? (
            <button
              type="button"
              disabled
              className="rounded border border-slate-300 px-3 py-1 text-xs disabled:opacity-50"
            >
              Siguiente
            </button>
          ) : (
            <Link
              href={`/products?page=${currentPage + 1}`}
              className="rounded border border-slate-300 px-3 py-1 text-xs"
            >
              Siguiente
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
