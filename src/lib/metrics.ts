export function roundCurrency(amount: number): number {
  if (!Number.isFinite(amount)) {
    throw new RangeError("El monto debe ser un número finito.");
  }

  return Number(amount.toFixed(2));
}

export function calculateTotalRevenue(
  amounts: readonly (number | null)[],
): number {
  return roundCurrency(
    amounts.reduce<number>((total, amount) => total + (amount ?? 0), 0),
  );
}

export function calculateRevenueGrowth(
  currentRevenue: number,
  previousRevenue: number,
): number {
  if (!Number.isFinite(currentRevenue) || !Number.isFinite(previousRevenue)) {
    throw new RangeError("Los ingresos deben ser números finitos.");
  }

  if (previousRevenue < 0 || currentRevenue < 0) {
    throw new RangeError("Los ingresos no pueden ser negativos.");
  }

  if (previousRevenue === 0) {
    return 0;
  }

  return Number(
    (((currentRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1),
  );
}

export function calculateAverageOrderValue(
  totalRevenue: number,
  totalOrders: number,
): number {
  if (!Number.isInteger(totalOrders) || totalOrders < 0) {
    throw new RangeError("El número de órdenes debe ser un entero no negativo.");
  }

  if (totalOrders === 0) {
    return 0;
  }

  return roundCurrency(totalRevenue / totalOrders);
}
