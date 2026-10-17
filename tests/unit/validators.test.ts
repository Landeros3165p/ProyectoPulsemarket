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
