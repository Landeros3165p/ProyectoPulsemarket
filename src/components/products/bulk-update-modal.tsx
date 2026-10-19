"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { bulkUpdateCategoryPrice } from "@/app/(dashboard)/products/actions";
import { bulkUpdateCategorySchema } from "@/lib/validators/schemas";
import { cn, formatCurrency } from "@/lib/utils";
import { showErrorAlert, showToast } from "@/lib/alerts";

interface BulkUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: string[];
  onSuccess?: (result: { category: string; count: number; percentage: number }) => void;
}

const defaultCategories = ["Electrónica", "Muebles", "Ropa", "Hogar", "Deportes"];
const presets = [-10, 5, 10, 15];

type FieldErrors = Partial<Record<"category" | "percentageAdjustment", string>>;

export function BulkUpdateModal({
  isOpen,
  onClose,
  categories = defaultCategories,
  onSuccess,
}: BulkUpdateModalProps) {
  const router = useRouter();
  const options = categories.length > 0 ? categories : defaultCategories;
  const [category, setCategory] = useState(options[0] ?? "");
  const [percentage, setPercentage] = useState("10");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!isOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !loading) onClose();
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const numericPercentage = percentage.trim() === "" ? Number.NaN : Number(percentage);
  const previewBase = 100;
  const previewValue = Number.isFinite(numericPercentage)
    ? previewBase * (1 + numericPercentage / 100)
    : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const result = bulkUpdateCategorySchema.safeParse({
      category,
      percentageAdjustment: numericPercentage,
    });

    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field === "category" && !errors.category) {
          errors.category = issue.message;
        }
        if (field === "percentageAdjustment" && !errors.percentageAdjustment) {
          errors.percentageAdjustment =
            issue.code === "invalid_type"
              ? "Ingresa un porcentaje válido."
              : "El ajuste debe estar entre -90% y 300%.";
        }
      }
      setFieldErrors(errors);
      setErrorMessage(
        errors.percentageAdjustment ?? errors.category ?? "Verifica los datos ingresados.",
      );
      showErrorAlert(
        "Revisa el ajuste de precios",
        errors.percentageAdjustment ?? errors.category ?? "Verifica los datos ingresados.",
      );
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      const response = await bulkUpdateCategoryPrice(result.data);
      onSuccess?.({
        category: result.data.category,
        count: response.count,
        percentage: result.data.percentageAdjustment,
      });
      router.refresh();
      onClose();
      showToast(
        response.count > 0 ? "success" : "info",
        response.count > 0
          ? `Se actualizaron ${response.count} productos`
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

  return createPortal(
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onClose();
      }}
    >
      <section
        aria-labelledby="bulk-update-title"
        aria-modal="true"
        className="animate-scale-in max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl"
        role="dialog"
      >
        <div className="flex items-start gap-4 border-b border-slate-100 p-5 sm:p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M19 5 5 19" />
              <circle cx="6.5" cy="6.5" r="2.5" />
              <circle cx="17.5" cy="17.5" r="2.5" />
            </svg>
          </span>
          <div className="flex-1">
            <h2 id="bulk-update-title" className="text-lg font-bold text-slate-900">
              Ajuste Masivo de Precios
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Modifica simultáneamente el precio de los productos de una categoría.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5 p-5 sm:p-6">
          <div>
            <label htmlFor="bulk-category" className="block text-sm font-medium text-slate-700">
              Categoría
            </label>
            <select
              id="bulk-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              aria-invalid={Boolean(fieldErrors.category)}
              aria-describedby={fieldErrors.category ? "bulk-category-error" : undefined}
              className="field-input"
            >
              {options.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {fieldErrors.category && (
              <p id="bulk-category-error" className="mt-1.5 text-xs font-medium text-rose-600">
                {fieldErrors.category}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="bulk-percentage" className="block text-sm font-medium text-slate-700">
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
              aria-invalid={Boolean(fieldErrors.percentageAdjustment)}
              aria-describedby={
                fieldErrors.percentageAdjustment ? "bulk-percentage-error" : "bulk-percentage-hint"
              }
              className="field-input"
            />
            {fieldErrors.percentageAdjustment ? (
              <p id="bulk-percentage-error" className="mt-1.5 text-xs font-medium text-rose-600">
                {fieldErrors.percentageAdjustment}
              </p>
            ) : (
              <p id="bulk-percentage-hint" className="mt-1.5 text-xs text-slate-500">
                Usa valores negativos para descuentos (mín. -90%, máx. 300%).
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setPercentage(String(preset))}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-semibold transition",
                    Number(percentage) === preset
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                  )}
                >
                  {preset > 0 ? `+${preset}` : preset}%
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Vista previa
            </p>
            <p className="mt-1 text-slate-700">
              Un producto de{" "}
              <span className="font-semibold">{formatCurrency(previewBase)}</span> pasará a{" "}
              <span
                className={cn(
                  "font-semibold",
                  previewValue !== null && previewValue < previewBase
                    ? "text-rose-600"
                    : "text-emerald-600",
                )}
              >
                {previewValue !== null && previewValue >= 0
                  ? formatCurrency(previewValue)
                  : "—"}
              </span>{" "}
              en <span className="font-semibold">{category}</span>.
            </p>
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
            >
              {errorMessage}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={loading} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {loading ? "Aplicando..." : "Aplicar Cambios"}
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body,
  );
}
