"use client";

import { useCallback, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/app/(dashboard)/products/actions";
import { BulkUpdateModal } from "@/components/products/bulk-update-modal";
import { productSchema } from "@/lib/validators/schemas";
import { cn } from "@/lib/utils";
import { showErrorAlert, showToast } from "@/lib/alerts";

type ProductField = "name" | "category" | "price" | "stock" | "sku";
type FieldErrors = Partial<Record<ProductField, string>>;

interface ProductManagementProps {
  categories?: string[];
}

const defaultCategories = ["Electrónica", "Muebles", "Ropa", "Hogar", "Deportes"];
const productFields: readonly ProductField[] = ["name", "category", "price", "stock", "sku"];

function isProductField(value: PropertyKey | undefined): value is ProductField {
  return productFields.some((field) => field === value);
}

function toNumber(value: FormDataEntryValue | null): number | undefined {
  const text = typeof value === "string" ? value.trim() : "";
  return text === "" ? undefined : Number(text);
}

function validationMessage(field: ProductField, code: string, message: string): string {
  if (code !== "invalid_type") return message;
  if (field === "price" || field === "stock") return "Ingresa un número válido.";
  return "Este campo es obligatorio.";
}

function FieldError({ field, error }: { field: ProductField; error?: string }) {
  if (!error) return null;

  return (
    <span
      id={`product-${field}-error`}
      className="animate-fade-in mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="h-3.5 w-3.5 shrink-0"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      {error}
    </span>
  );
}

export function ProductManagement({ categories = defaultCategories }: ProductManagementProps) {
  const router = useRouter();
  const options = categories.length > 0 ? categories : defaultCategories;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  function clearFieldError(field: ProductField) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setMessage(null);
    setErrorMessage(null);

    const result = productSchema.safeParse({
      name: String(formData.get("name") ?? ""),
      category: String(formData.get("category") ?? ""),
      price: toNumber(formData.get("price")),
      stock: toNumber(formData.get("stock")),
      sku: String(formData.get("sku") ?? ""),
    });

    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (isProductField(field) && !errors[field]) {
          errors[field] = validationMessage(field, issue.code, issue.message);
        }
      }
      setFieldErrors(errors);
      const firstInvalid = productFields.find((field) => errors[field]);
      setErrorMessage("Corrige los campos marcados antes de continuar.");
      showErrorAlert(
        "Revisa los datos del producto",
        firstInvalid ? errors[firstInvalid] : "Verifica los campos e inténtalo de nuevo.",
      );
      if (firstInvalid) {
        const element = form.elements.namedItem(firstInvalid);
        if (element instanceof HTMLElement) element.focus();
      }
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await createProduct(result.data);
      form.reset();
      setMessage("Producto creado correctamente.");
      showToast("success", "Producto creado correctamente");
      router.refresh();
    } catch {
      setErrorMessage("No se pudo crear el producto. Revisa que el SKU sea único.");
      showErrorAlert(
        "No se pudo crear el producto",
        "Comprueba que el SKU sea único y que los datos sean válidos.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function fieldProps(field: ProductField) {
    return {
      name: field,
      "aria-invalid": Boolean(fieldErrors[field]),
      "aria-describedby": fieldErrors[field] ? `product-${field}-error` : undefined,
      onChange: () => clearFieldError(field),
      className: "field-input",
    };
  }

  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Administración de productos</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Registra un nuevo producto. Los datos se validan antes de enviarse.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn-secondary w-full sm:w-auto"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="h-4 w-4 text-slate-500"
          >
            <path d="M19 5 5 19" />
            <circle cx="6.5" cy="6.5" r="2.5" />
            <circle cx="17.5" cy="17.5" r="2.5" />
          </svg>
          Ajuste masivo de precios
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12"
      >
        <label className="text-sm font-medium text-slate-700 sm:col-span-2 lg:col-span-4">
          Nombre
          <input
            {...fieldProps("name")}
            aria-label="Nombre del producto"
            placeholder="Ej. Audífonos inalámbricos"
            minLength={2}
            required
          />
          <FieldError field="name" error={fieldErrors.name} />
        </label>
        <label className="text-sm font-medium text-slate-700 lg:col-span-2">
          Categoría
          <select {...fieldProps("category")} aria-label="Categoría del producto" required>
            {options.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
          <FieldError field="category" error={fieldErrors.category} />
        </label>
        <label className="text-sm font-medium text-slate-700 lg:col-span-2">
          Precio
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 text-sm text-slate-400">
              $
            </span>
            <input
              {...fieldProps("price")}
              className={cn(fieldProps("price").className, "pl-7")}
              aria-label="Precio del producto"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
            />
          </div>
          <FieldError field="price" error={fieldErrors.price} />
        </label>
        <label className="text-sm font-medium text-slate-700 lg:col-span-2">
          Stock
          <input
            {...fieldProps("stock")}
            aria-label="Stock del producto"
            type="number"
            inputMode="numeric"
            placeholder="0"
            min="0"
            step="1"
            required
          />
          <FieldError field="stock" error={fieldErrors.stock} />
        </label>
        <label className="text-sm font-medium text-slate-700 lg:col-span-2">
          SKU
          <input
            {...fieldProps("sku")}
            aria-label="SKU del producto"
            placeholder="ABC-123"
            minLength={3}
            required
          />
          <FieldError field="sku" error={fieldErrors.sku} />
        </label>
        <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center lg:col-span-12">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="h-4 w-4"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            )}
            {isSubmitting ? "Creando..." : "Crear producto"}
          </button>
          {message && (
            <p
              role="status"
              className="animate-slide-up rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700"
            >
              {message}
            </p>
          )}
          {errorMessage && (
            <p
              role="alert"
              className="animate-slide-up rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700"
            >
              {errorMessage}
            </p>
          )}
        </div>
      </form>

      <BulkUpdateModal
        isOpen={isModalOpen}
        onClose={closeModal}
        categories={options}
        onSuccess={({ category, count, percentage }) => {
          setErrorMessage(null);
          setMessage(
            `Se actualizaron ${count} productos de ${category} (${percentage > 0 ? "+" : ""}${percentage}%).`,
          );
        }}
      />
    </section>
  );
}
