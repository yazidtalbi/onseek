/**
 * Format budget range for display
 */
export function formatBudget(
  min: number | null | undefined,
  max: number | null | undefined,
  currency: string = "USD"
): string {
  const symbol = currency === "USD" ? "$" : currency;
  
  if (min && max) {
    return `${symbol}${min} - ${symbol}${max}`;
  } else if (min) {
    return `From ${symbol}${min}`;
  } else if (max) {
    return `Up to ${symbol}${max}`;
  }
  return "";
}

