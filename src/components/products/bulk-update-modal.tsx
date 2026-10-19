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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onClose();
      }}
    >
      <section
        aria-labelledby="bulk-update-title"
        aria-modal="true"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-xl bg-white p-4 shadow-xl sm:p-6"
        role="dialog"
      >
        <h2
          id="bulk-update-title"
          className="text-xl font-bold text-slate-900"
        >
          Ajuste Masivo de Precios
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Modifica simultáneamente el precio de los productos de una categoría.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="bulk-category"
              className="block text-sm font-medium text-slate-700"
            >
              Categoría
            </label>
            <select
              id="bulk-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm"
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
              className="block text-sm font-medium text-slate-700"
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
              className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Aplicando..." : "Aplicar Cambios"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
