import { describe, expect, it } from "vitest";
import { cn, formatCurrency } from "@/lib/utils";

describe("utilidades de interfaz", () => {
  it("combina y resuelve clases Tailwind en conflicto", () => {
    expect(cn("px-2 text-sm", false && "hidden", "px-4")).toBe("text-sm px-4");
  });

  it("formatea montos en dólares para es-MX", () => {
    expect(formatCurrency(1_234.5)).toMatch(/USD.*1,234\.50/);
  });

  it("rechaza montos que no sean finitos", () => {
    expect(() => formatCurrency(Number.NaN)).toThrow(RangeError);
  });
});
