import type { MarketResponse, Settings, Signal, StatsResponse, Timeframe } from '../types/domain';

const API_URL = import.meta.env.VITE_API_URL ?? '';

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<T>;
};

export const api = {
  market: (symbol: string, timeframe: Timeframe) => request<MarketResponse>(`/api/market/${symbol}/${timeframe}`),
  signals: () => request<Signal[]>('/api/signals?limit=100'),
  stats: () => request<StatsResponse>('/api/stats'),
  scan: () => request<{ scanned: number; signals: Signal[] }>('/api/scan', { method: 'POST' }),
  settings: () => request<Settings>('/api/settings'),
  updateSettings: (settings: Partial<Settings>) =>
    request<Settings>('/api/settings', { method: 'PUT', body: JSON.stringify(settings) }),
};
