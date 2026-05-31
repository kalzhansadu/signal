import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';
import type { Candle, Timeframe } from '../../types/domain.js';

const timeframeMinutes: Record<Timeframe, number> = {
  '5m': 5,
  '15m': 15,
  '1h': 60,
  '4h': 240,
  '1d': 1440,
};

const basePrices: Record<string, number> = {
  BTCUSDT: 68500,
  ETHUSDT: 3600,
  SOLUSDT: 165,
  BNBUSDT: 610,
  XRPUSDT: 0.62,
};

const makeMockCandles = (symbol: string, timeframe: Timeframe, limit: number): Candle[] => {
  const step = timeframeMinutes[timeframe] * 60;
  const now = Math.floor(Date.now() / 1000 / step) * step;
  let price = basePrices[symbol] ?? 100;

  return Array.from({ length: limit }, (_, index) => {
    const time = now - (limit - index) * step;
    const wave = Math.sin(index / 7) * price * 0.008 + Math.cos(index / 17) * price * 0.012;
    const drift = (index - limit / 2) * price * 0.00008;
    const open = price;
    const close = Math.max(0.0001, open + wave + drift);
    const high = Math.max(open, close) * (1 + 0.003 + Math.abs(Math.sin(index)) * 0.004);
    const low = Math.min(open, close) * (1 - 0.003 - Math.abs(Math.cos(index)) * 0.004);
    const volume = 1000 + Math.abs(Math.sin(index / 3)) * 4500;
    price = close;
    return { time, open, high, low, close, volume };
  });
};

const parseBinanceKline = (row: unknown[]): Candle => ({
  time: Number(row[0]) / 1000,
  open: Number(row[1]),
  high: Number(row[2]),
  low: Number(row[3]),
  close: Number(row[4]),
  volume: Number(row[5]),
});

export const marketService = {
  async fetchCandles(symbol: string, timeframe: Timeframe, limit = 500): Promise<Candle[]> {
    const url = `${env.binanceBaseUrl}/api/v3/klines?symbol=${symbol}&interval=${timeframe}&limit=${limit}`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Binance ${response.status}`);
      const raw = (await response.json()) as unknown[][];
      return raw.map(parseBinanceKline);
    } catch (error) {
      await logger.error(`market fetch failed ${symbol} ${timeframe}: ${(error as Error).message}`);
      return makeMockCandles(symbol, timeframe, limit);
    }
  },

  mockCandles: makeMockCandles,
};
