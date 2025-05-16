/**
 * Format a number with proper suffixes for large values
 */
export function formatNumber(num: number, precision = 1): string {
  if (num === 0) return '0';
  
  // For numbers less than 1000, show full number with no decimal places
  if (num < 1000) {
    return Math.floor(num).toString();
  }
  
  const abbrev = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  const unrangifiedOrder = Math.floor(Math.log10(Math.abs(num)) / 3);
  const order = Math.max(0, Math.min(unrangifiedOrder, abbrev.length - 1));
  const suffix = abbrev[order];
  
  return (num / Math.pow(10, order * 3)).toFixed(precision) + suffix;
}

/**
 * Format a currency amount
 */
export function formatCurrency(num: number): string {
  return formatNumber(num);
}

/**
 * Format a rate (per second or per click)
 */
export function formatRate(num: number): string {
  if (num < 0.1) {
    return num.toFixed(2);
  }
  if (num < 10) {
    return num.toFixed(1);
  }
  return formatNumber(num, 1);
}
