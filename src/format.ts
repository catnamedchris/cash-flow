export const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
