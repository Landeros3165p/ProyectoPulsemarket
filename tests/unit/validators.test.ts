import { describe, expect, it } from "vitest";
import {
  bulkUpdateCategorySchema,
  productSchema,
  updateTaskStatusSchema,
} from "@/lib/validators/schemas";

describe("validaciones Zod", () => {
  it("acepta un producto válido", () => {
    expect(
      productSchema.safeParse({
        name: 'Monitor Gaming 27"',
        category: "Electrónica",
        price: 350,
        stock: 15,
        sku: "MON-27-001",
      }).success,
    ).toBe(true);
  });

  it("rechaza nombres demasiado cortos", () => {
    expect(
      productSchema.safeParse({
        name: "A",
        category: "Electrónica",
        price: 10,
        stock: 1,
        sku: "ABC",
      }).success,
    ).toBe(false);
  });

  it("rechaza nombres de producto compuestos solo por números", () => {
    const result = productSchema.safeParse({
      name: "123456",
      category: "Electrónica",
      price: 10,
      stock: 1,
      sku: "ABC",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain(
        "debe incluir al menos una letra",
      );
    }
  });

  it("acepta nombres de producto con letras, números y tildes", () => {
    expect(
      productSchema.safeParse({
        name: "Cámara 4K edición básica",
        category: "Electrónica",
        price: 350,
        stock: 15,
        sku: "CAM-4K-01",
      }).success,
    ).toBe(true);
  });

  it("rechaza categorías vacías", () => {
    expect(
      productSchema.safeParse({
        name: "Teclado",
        category: " ",
        price: 10,
        stock: 1,
        sku: "ABC",
      }).success,
    ).toBe(false);
  });

  it("rechaza precios negativos", () => {
    expect(
      productSchema.safeParse({
        name: "Teclado Mecánico",
        category: "Electrónica",
        price: -50,
        stock: 10,
        sku: "TEC-001",
      }).success,
    ).toBe(false);
  });

  it("rechaza un precio igual a cero", () => {
    expect(
      productSchema.safeParse({
        name: "Teclado",
        category: "Electrónica",
        price: 0,
        stock: 1,
        sku: "ABC",
      }).success,
    ).toBe(false);
  });

  it("rechaza stock negativo", () => {
    expect(
      productSchema.safeParse({
        name: "Teclado",
        category: "Electrónica",
        price: 10,
        stock: -1,
        sku: "ABC",
      }).success,
    ).toBe(false);
  });

  it("rechaza stock fraccionario", () => {
    expect(
      productSchema.safeParse({
        name: "Teclado",
        category: "Electrónica",
        price: 10,
        stock: 1.5,
        sku: "ABC",
      }).success,
    ).toBe(false);
  });

  it("acepta un ajuste porcentual dentro de los límites", () => {
    expect(
      bulkUpdateCategorySchema.safeParse({
        category: "Ropa",
        percentageAdjustment: 15,
      }).success,
    ).toBe(true);
  });

  it("rechaza ajustes que exceden los límites permitidos", () => {
    expect(
      bulkUpdateCategorySchema.safeParse({
        category: "Ropa",
        percentageAdjustment: 301,
      }).success,
    ).toBe(false);
  });

  it("acepta estados Kanban y posición válidos", () => {
    expect(
      updateTaskStatusSchema.safeParse({
        taskId: "task-1",
        newStatus: "IN_PROGRESS",
        newPosition: 2,
      }).success,
    ).toBe(true);
  });
});
