"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { bulkUpdateCategoryPrice } from "@/app/(dashboard)/products/actions";
import { showErrorAlert, showToast } from "@/lib/alerts";

interface BulkUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = ["Electrónica", "Muebles", "Ropa", "Hogar", "Deportes"];

export function BulkUpdateModal({ isOpen, onClose }: BulkUpdateModalProps) {
  const router = useRouter();
  const [category, setCategory] = useState(categories[0]);
  const [percentage, setPercentage] = useState("10");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const result = await bulkUpdateCategoryPrice({
        category,
        percentageAdjustment: Number(percentage),
      });
      router.refresh();
      onClose();
      showToast(
        result.count > 0 ? "success" : "info",
        result.count > 0
          ? `Se actualizaron ${result.count} productos`
          : "No hay productos en esa categoría",
      );
    } catch {
      showErrorAlert(
        "No se pudieron actualizar los precios",
        "Revisa los datos e inténtalo de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onClose();
      }}
    >
      <section
        aria-labelledby="bulk-update-title"
        aria-modal="true"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
        role="dialog"
      >
        <header className="flex items-start gap-3 border-b border-slate-100 pb-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-600">
            %
          </span>
          <div className="min-w-0 flex-1">
            <h2
              id="bulk-update-title"
              className="text-lg font-extrabold tracking-tight text-slate-900"
            >
              Ajuste Masivo de Precios
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Modifica simultáneamente el precio de los productos de una
              categoría.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Cerrar ventana"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="bulk-category"
              className="block text-xs font-semibold text-slate-600"
            >
              Categoría
            </label>
            <select
              id="bulk-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="bulk-percentage"
              className="block text-xs font-semibold text-slate-600"
            >
              Ajuste porcentual (%)
            </label>
            <input
              id="bulk-percentage"
              type="number"
              min="-90"
              max="300"
              step="0.1"
              required
              value={percentage}
              onChange={(event) => setPercentage(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Aplicando..." : "Aplicar Cambios"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
