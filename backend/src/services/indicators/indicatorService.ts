import { round } from '../../lib/number.js';
import type { Candle, IndicatorSnapshot } from '../../types/domain.js';

const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

const ema = (values: number[], period: number): Array<number | null> => {
  const k = 2 / (period + 1);
  const output: Array<number | null> = Array(values.length).fill(null);
  if (values.length < period) return output;
  output[period - 1] = average(values.slice(0, period));
  for (let index = period; index < values.length; index += 1) {
    output[index] = values[index] * k + (output[index - 1] as number) * (1 - k);
  }
  return output;
};

const rsi = (closes: number[], period: number): Array<number | null> => {
  const output: Array<number | null> = Array(period).fill(null);
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i += 1) {
    const diff = closes[i] - closes[i - 1];
    gains += Math.max(diff, 0);
    losses += Math.max(-diff, 0);
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  output[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  for (let i = period + 1; i < closes.length; i += 1) {
    const diff = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(diff, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-diff, 0)) / period;
    output[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return output;
};

const atr = (candles: Candle[], period: number): Array<number | null> => {
  const trueRanges = candles.map((candle, index) => {
    if (index === 0) return candle.high - candle.low;
    const previousClose = candles[index - 1].close;
    return Math.max(
      candle.high - candle.low,
      Math.abs(candle.high - previousClose),
      Math.abs(candle.low - previousClose),
    );
  });
  return trueRanges.map((_, index) => {
    if (index < period - 1) return null;
    return average(trueRanges.slice(index - period + 1, index + 1));
  });
};

const bollinger = (closes: number[], period = 20, multiplier = 2) =>
  closes.map((_, index) => {
    if (index < period - 1) return { upper: null, middle: null, lower: null };
    const window = closes.slice(index - period + 1, index + 1);
    const middle = average(window);
    const variance = average(window.map((value) => (value - middle) ** 2));
    const deviation = Math.sqrt(variance);
    return { upper: middle + deviation * multiplier, middle, lower: middle - deviation * multiplier };
  });

export const indicatorService = {
  calculate(candles: Candle[], rsiPeriod = 14): IndicatorSnapshot[] {
    const closes = candles.map((candle) => candle.close);
    const volumes = candles.map((candle) => candle.volume);
    const ema20 = ema(closes, 20);
    const ema50 = ema(closes, 50);
    const ema12 = ema(closes, 12);
    const ema26 = ema(closes, 26);
    const macdLine = closes.map((_, index) =>
      ema12[index] !== null && ema26[index] !== null ? (ema12[index] as number) - (ema26[index] as number) : null,
    );
    const macdValues = macdLine.map((value) => value ?? 0);
    const macdSignal = ema(macdValues, 9);
    const rsiValues = rsi(closes, rsiPeriod);
    const atrValues = atr(candles, 14);
    const bands = bollinger(closes);

    return candles.map((_, index) => ({
      rsi: round(rsiValues[index], 2),
      macd: round(macdLine[index], 4),
      macdSignal: round(macdSignal[index], 4),
      ema20: round(ema20[index], 4),
      ema50: round(ema50[index], 4),
      bbUpper: round(bands[index].upper, 4),
      bbMiddle: round(bands[index].middle, 4),
      bbLower: round(bands[index].lower, 4),
      atr: round(atrValues[index], 4),
      volumeMa20: index < 19 ? null : round(average(volumes.slice(index - 19, index + 1)), 2),
    }));
  },
};
