"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/app/(dashboard)/products/actions";
import { BulkUpdateModal } from "@/components/products/bulk-update-modal";

export function ProductManagement() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setIsSubmitting(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      await createProduct({
        name: String(formData.get("name")),
        category: String(formData.get("category")),
        price: Number(formData.get("price")),
        stock: Number(formData.get("stock")),
        sku: String(formData.get("sku")),
      });
      form.reset();
      setMessage("Producto creado correctamente.");
      router.refresh();
    } catch {
      setErrorMessage(
        "No se pudo crear el producto. Comprueba que el SKU sea único y que los datos sean válidos.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-lg font-semibold text-slate-900">
          Administración de productos
        </h2>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
        >
          Ajuste masivo de precios
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <label className="text-sm font-medium text-slate-700">
          Nombre
          <input
            name="name"
            aria-label="Nombre del producto"
            minLength={2}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 p-2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Categoría
          <select
            name="category"
            aria-label="Categoría del producto"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 p-2"
          >
            <option>Electrónica</option>
            <option>Muebles</option>
            <option>Ropa</option>
            <option>Hogar</option>
            <option>Deportes</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Precio
          <input
            name="price"
            aria-label="Precio del producto"
            type="number"
            min="0.01"
            step="0.01"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 p-2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Stock
          <input
            name="stock"
            aria-label="Stock del producto"
            type="number"
            min="0"
            step="1"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 p-2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          SKU
          <input
            name="sku"
            aria-label="SKU del producto"
            minLength={3}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 p-2"
          />
        </label>
        <div className="sm:col-span-2 lg:col-span-5">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Creando..." : "Crear producto"}
          </button>
        </div>
      </form>

      {message && (
        <p role="status" className="mt-3 text-sm text-emerald-700">
          {message}
        </p>
      )}
      {errorMessage && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <BulkUpdateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
