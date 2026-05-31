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
  XAUUSD: 2350,
};

const yahooSymbolMap: Record<string, string> = {
  XAUUSD: 'GC=F',
};

const yahooIntervals: Record<Timeframe, string> = {
  '5m': '5m',
  '15m': '15m',
  '1h': '60m',
  '4h': '60m',
  '1d': '1d',
};

const yahooRanges: Record<Timeframe, string> = {
  '5m': '5d',
  '15m': '1mo',
  '1h': '6mo',
  '4h': '6mo',
  '1d': '2y',
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

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: Array<number | null>;
          high?: Array<number | null>;
          low?: Array<number | null>;
          close?: Array<number | null>;
          volume?: Array<number | null>;
        }>;
      };
    }>;
    error?: { description?: string };
  };
};

const aggregateCandles = (candles: Candle[], size: number): Candle[] => {
  const result: Candle[] = [];
  for (let index = 0; index < candles.length; index += size) {
    const chunk = candles.slice(index, index + size);
    if (chunk.length < size) continue;
    result.push({
      time: chunk[0].time,
      open: chunk[0].open,
      high: Math.max(...chunk.map((candle) => candle.high)),
      low: Math.min(...chunk.map((candle) => candle.low)),
      close: chunk[chunk.length - 1].close,
      volume: chunk.reduce((sum, candle) => sum + candle.volume, 0),
    });
  }
  return result;
};

const fetchYahooCandles = async (symbol: string, timeframe: Timeframe, limit: number): Promise<Candle[]> => {
  const yahooSymbol = yahooSymbolMap[symbol];
  if (!yahooSymbol) throw new Error(`unsupported symbol ${symbol}`);

  const url = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}`);
  url.searchParams.set('range', yahooRanges[timeframe]);
  url.searchParams.set('interval', yahooIntervals[timeframe]);
  url.searchParams.set('includePrePost', 'true');

  const response = await fetch(url, { headers: { 'User-Agent': 'SMC Dashboard' } });
  if (!response.ok) throw new Error(`Yahoo Finance ${response.status}`);

  const payload = (await response.json()) as YahooChartResponse;
  const result = payload.chart?.result?.[0];
  const quote = result?.indicators?.quote?.[0];
  if (!result?.timestamp || !quote) {
    throw new Error(payload.chart?.error?.description ?? 'Yahoo Finance returned no candles');
  }

  const candles = result.timestamp
    .map((time, index) => ({
      time,
      open: quote.open?.[index],
      high: quote.high?.[index],
      low: quote.low?.[index],
      close: quote.close?.[index],
      volume: quote.volume?.[index] ?? 0,
    }))
    .filter((candle): candle is Candle =>
      typeof candle.open === 'number'
      && typeof candle.high === 'number'
      && typeof candle.low === 'number'
      && typeof candle.close === 'number'
    );

  const normalized = timeframe === '4h' ? aggregateCandles(candles, 4) : candles;
  return normalized.slice(-limit);
};

export const marketService = {
  async fetchCandles(symbol: string, timeframe: Timeframe, limit = 500): Promise<Candle[]> {
    try {
      if (symbol === 'XAUUSD') return fetchYahooCandles(symbol, timeframe, limit);
      throw new Error(`unsupported symbol ${symbol}`);
    } catch (error) {
      await logger.error(`market fetch failed ${symbol} ${timeframe}: ${(error as Error).message}`);
      return makeMockCandles(symbol, timeframe, limit);
    }
  },

  mockCandles: makeMockCandles,
};
