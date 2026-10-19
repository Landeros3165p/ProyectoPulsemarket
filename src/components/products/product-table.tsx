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
      className="max-w-full overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm"
      role="region"
      tabIndex={0}
    >
      <table className="w-full min-w-[42rem] text-left text-xs text-slate-600">
        <thead className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wide text-slate-400">
          <tr>
            <th scope="col" className="px-4 py-3.5 sm:px-5">
              Nombre
            </th>
            <th scope="col" className="px-4 py-3.5 sm:px-5">
              Categoría
            </th>
            <th scope="col" className="px-4 py-3.5 sm:px-5">
              Precio
            </th>
            <th scope="col" className="px-4 py-3.5 sm:px-5">
              Stock
            </th>
            <th scope="col" className="px-4 py-3.5 sm:px-5">
              SKU
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-12 text-center text-sm text-slate-500"
              >
                No hay productos para mostrar.
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr
                key={product.id}
                className="transition hover:bg-indigo-50/30"
              >
                <td className="px-4 py-3.5 font-semibold text-slate-800 sm:px-5">
                  {product.name}
                </td>
                <td className="px-4 py-3.5 sm:px-5">
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">
                    {product.category}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-700 sm:px-5">
                  {formatCurrency(product.price)}
                </td>
                <td className="px-4 py-3.5 sm:px-5">
                  <span
                    className={`inline-flex min-w-8 justify-center rounded-full px-2 py-1 text-[10px] font-bold ${
                      product.stock < 10
                        ? product.stock === 0
                          ? "bg-rose-50 text-rose-700"
                          : "bg-amber-50 text-amber-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {product.stock}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[10px] text-slate-400 sm:px-5">
                  {product.sku}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3.5 sm:px-5">
        <span className="text-[11px] font-medium text-slate-400">
          Página {currentPage} de {totalPages}
        </span>
        <div className="flex gap-2">
          {currentPage <= 1 ? (
            <button
              type="button"
              disabled
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Anterior
            </button>
          ) : (
            <Link
              href={`/products?page=${currentPage - 1}`}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            >
              Anterior
            </Link>
          )}
          {currentPage >= totalPages ? (
            <button
              type="button"
              disabled
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Siguiente
            </button>
          ) : (
            <Link
              href={`/products?page=${currentPage + 1}`}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            >
              Siguiente
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
