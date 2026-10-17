import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  category: z.string().trim().min(1, "La categoría es requerida"),
  price: z.number().positive("El precio debe ser un número positivo"),
  stock: z.number().int().nonnegative("El stock no puede ser negativo"),
  sku: z.string().trim().min(3, "SKU inválido"),
});

export const bulkUpdateCategorySchema = z.object({
  category: z.string().trim().min(1, "Categoría requerida"),
  percentageAdjustment: z.number().min(-90).max(300),
});

export const updateTaskStatusSchema = z.object({
  taskId: z.string().min(1),
  newStatus: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
  newPosition: z.number().int().nonnegative(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type BulkUpdateCategoryInput = z.infer<typeof bulkUpdateCategorySchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
