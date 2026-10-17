import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "USD",
});

export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) {
    throw new RangeError("El monto debe ser un número finito.");
  }

  return currencyFormatter.format(amount);
}
