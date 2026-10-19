import { z } from "zod";

/**
 * Nombre: permite letras, números, tildes y símbolos comunes de producto.
 * Debe comenzar con letra o número. Máx. 120 caracteres.
 */
const productNamePattern =
  /^[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N}\p{Zs}''"".,&()\/:+#%\-]{1,119}$/u;

/**
 * Categoría: letras, números, espacios y algunos separadores. Máx. 50 caracteres.
 */
const categoryPattern =
  /^[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N}\p{Zs}&''().,+/\-]{0,49}$/u;

/**
 * SKU: letras y dígitos, con guiones o guiones bajos como separadores.
 * Ejemplos válidos: ABC-123, PROD_01, XYZ123, A1-B2-C3
 * Mín. 3 / Máx. 50 caracteres.
 */
const skuPattern = /^[A-Za-z0-9][A-Za-z0-9_\-]{1,48}[A-Za-z0-9]$|^[A-Za-z0-9]{3,50}$/;

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(120, "El nombre no puede exceder 120 caracteres.")
    .regex(
      productNamePattern,
      "El nombre solo puede contener letras, números y los símbolos: . , & ( ) / : + # % - '",
    ),
  category: z
    .string()
    .trim()
    .min(1, "La categoría es obligatoria.")
    .max(50, "La categoría no puede exceder 50 caracteres.")
    .regex(
      categoryPattern,
      "La categoría solo puede contener letras, números y los símbolos: & ( ) . , + / -",
    ),
  price: z
    .number({ invalid_type_error: "Ingresa un precio válido." })
    .positive("El precio debe ser mayor a cero.")
    .max(9_999_999, "El precio no puede exceder $9,999,999.")
    .refine(
      (value) => Math.round(value * 100) / 100 === value,
      "El precio solo puede tener hasta 2 decimales.",
    ),
  stock: z
    .number({ invalid_type_error: "Ingresa una cantidad de stock válida." })
    .int("El stock debe ser un número entero.")
    .nonnegative("El stock no puede ser negativo.")
    .max(999_999, "El stock no puede exceder 999,999 unidades."),
  sku: z
    .string()
    .trim()
    .min(3, "El SKU debe tener al menos 3 caracteres.")
    .max(50, "El SKU no puede exceder 50 caracteres.")
    .regex(
      skuPattern,
      "El SKU solo puede contener letras, números, guiones ( - ) y guiones bajos ( _ ), sin comenzar ni terminar con separadores.",
    ),
});

export const bulkUpdateCategorySchema = z.object({
  category: z
    .string()
    .trim()
    .min(1, "La categoría es obligatoria.")
    .max(50, "La categoría no puede exceder 50 caracteres.")
    .regex(
      categoryPattern,
      "La categoría contiene caracteres no permitidos.",
    ),
  percentageAdjustment: z
    .number({ invalid_type_error: "Ingresa un porcentaje válido (número)." })
    .min(-90, "El ajuste mínimo permitido es -90%.")
    .max(300, "El ajuste máximo permitido es 300%."),
});

export const updateTaskStatusSchema = z.object({
  taskId: z.string().min(1),
  newStatus: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
  newPosition: z.number().int().nonnegative(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type BulkUpdateCategoryInput = z.infer<typeof bulkUpdateCategorySchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
