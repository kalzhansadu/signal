export const money = (value: number | null | undefined) =>
  value === null || value === undefined
    ? '-'
    : value.toLocaleString('en-US', { maximumFractionDigits: value > 100 ? 2 : 5 });

export const pct = (value: number | null | undefined) =>
  value === null || value === undefined ? '-' : `${value.toFixed(2)}%`;

export const dateTime = (value: number) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value > 10_000_000_000 ? value : value * 1000);
