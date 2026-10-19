"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/app/(dashboard)/products/actions";
import { BulkUpdateModal } from "@/components/products/bulk-update-modal";
import { showErrorAlert, showToast } from "@/lib/alerts";

export function ProductManagement() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      await createProduct({
        name: String(formData.get("name")),
        category: String(formData.get("category")),
        price: Number(formData.get("price")),
        stock: Number(formData.get("stock")),
        sku: String(formData.get("sku")),
      });
      form.reset();
      setSuccessMessage("Producto creado correctamente.");
      showToast("success", "Producto creado correctamente");
      router.refresh();
    } catch {
      showErrorAlert(
        "No se pudo crear el producto",
        "Comprueba que el SKU sea único y que los datos sean válidos.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Administración de productos
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Registra un nuevo producto. Los datos se validan antes de enviarse.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 sm:w-auto"
        >
          <span aria-hidden="true" className="text-sm">%</span>
          Ajuste masivo de precios
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-5"
      >
        <label className="text-xs font-semibold text-slate-600">
          <span className="mb-1.5 block">Nombre</span>
          <input
            name="name"
            aria-label="Nombre del producto"
            minLength={2}
            required
            placeholder="Ej. Audífonos inalámbricos"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
          />
        </label>
        <label className="text-xs font-semibold text-slate-600">
          <span className="mb-1.5 block">Categoría</span>
          <select
            name="category"
            aria-label="Categoría del producto"
            required
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
          >
            <option>Electrónica</option>
            <option>Muebles</option>
            <option>Ropa</option>
            <option>Hogar</option>
            <option>Deportes</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-600">
          <span className="mb-1.5 block">Precio</span>
          <input
            name="price"
            aria-label="Precio del producto"
            type="number"
            min="0.01"
            step="0.01"
            required
            placeholder="0.00"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
          />
        </label>
        <label className="text-xs font-semibold text-slate-600">
          <span className="mb-1.5 block">Stock</span>
          <input
            name="stock"
            aria-label="Stock del producto"
            type="number"
            min="0"
            step="1"
            required
            placeholder="0"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
          />
        </label>
        <label className="text-xs font-semibold text-slate-600">
          <span className="mb-1.5 block">SKU</span>
          <input
            name="sku"
            aria-label="SKU del producto"
            minLength={3}
            required
            placeholder="ABC-123"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
          />
        </label>
        <div className="sm:col-span-2 lg:col-span-5">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span aria-hidden="true" className="text-base leading-none">
              +
            </span>
            {isSubmitting ? "Creando..." : "Crear producto"}
          </button>
        </div>
      </form>

      {successMessage && (
        <p role="status" className="sr-only">
          {successMessage}
        </p>
      )}

      <BulkUpdateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
