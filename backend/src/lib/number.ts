export const round = (value: number | null | undefined, precision = 4): number | null => {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const id = (prefix: string, parts: Array<string | number>) => `${prefix}_${parts.join('_')}`;
