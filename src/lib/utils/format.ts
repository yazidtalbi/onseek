/**
 * Format budget for display (max only)
 */
export function formatBudget(
  min: number | null | undefined,
  max: number | null | undefined,
  currency: string = "USD"
): string {
  const symbol = currency === "USD" ? "$" : currency;
  
  if (max) {
    return `Up to ${symbol}${max}`;
  }
  return "";
}

