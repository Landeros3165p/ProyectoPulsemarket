import { describe, expect, it } from "vitest";
import {
  calculateAverageOrderValue,
  calculateRevenueGrowth,
  calculateTotalRevenue,
  roundCurrency,
} from "@/lib/metrics";

describe("métricas financieras", () => {
  it("calcula el crecimiento porcentual", () => {
    expect(calculateRevenueGrowth(1_200, 1_000)).toBe(20);
  });

  it("calcula una caída de ingresos", () => {
    expect(calculateRevenueGrowth(750, 1_000)).toBe(-25);
  });

  it("redondea importes a dos decimales", () => {
    expect(roundCurrency(123.4567)).toBe(123.46);
  });

  it("conserva valores que ya tienen dos decimales", () => {
    expect(roundCurrency(10.25)).toBe(10.25);
  });

  it("trata una suma nula como cero", () => {
    expect(calculateTotalRevenue([null])).toBe(0);
  });

  it("ignora montos nulos al sumar ventas", () => {
    expect(calculateTotalRevenue([10.25, null, 5.1])).toBe(15.35);
  });

  it("devuelve cero cuando los ingresos del período anterior son cero", () => {
    expect(calculateRevenueGrowth(500, 0)).toBe(0);
  });

  it("calcula el valor promedio por orden", () => {
    expect(calculateAverageOrderValue(100, 4)).toBe(25);
  });

  it("devuelve cero cuando no hay órdenes", () => {
    expect(calculateAverageOrderValue(100, 0)).toBe(0);
  });

  it("rechaza ingresos negativos", () => {
    expect(() => calculateRevenueGrowth(-1, 10)).toThrow(RangeError);
  });
});
