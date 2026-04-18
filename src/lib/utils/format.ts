/**
 * Format budget for display (max only)
 */
export function formatBudget(
  min: number | string | null | undefined,
  max: number | string | null | undefined,
  currency: string = "USD"
): string {
  const symbol = currency === "USD" ? "$" : currency;
  
  if (max === "Negotiable" || (!max && max !== 0)) {
    return "Negotiable";
  }

  const numericMax = typeof max === "string" ? parseFloat(max.replace(/[^0-9.]/g, "")) : max;
  
  if (numericMax) {
    return `Up to ${symbol}${numericMax.toLocaleString()}`;
  }
  
  return "Negotiable";
}

