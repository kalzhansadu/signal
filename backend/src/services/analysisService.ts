import { indicatorService } from './indicators/indicatorService.js';
import { marketService } from './market/marketService.js';
import { settingsService } from './settingsService.js';
import { smcService } from './smc/smcService.js';
import { smcSignalService } from './smc/smcSignalService.js';
import type { Signal, Timeframe } from '../types/domain.js';

const signalMap = new Map<string, Signal>();

export const analysisService = {
  async analyze(symbol: string, timeframe: Timeframe) {
    const settings = settingsService.get();
    const candles = await marketService.fetchCandles(symbol, timeframe, 500);
    const indicators = indicatorService.calculate(candles, settings.rsiPeriod);
    const smc = smcService.analyze(candles, settings.swingLookback);
    const latestIndicator = indicators[indicators.length - 1];
    const latestCandle = candles[candles.length - 1];
    const signal = smcSignalService.generate(
      symbol,
      timeframe,
      latestCandle.close,
      latestIndicator,
      smc,
      settings.minQualityScore,
      settings.atrMultiplier,
      settings.riskRewardRatio,
    );
    if (signal) signalMap.set(signal.id, signal);
    return { candles, indicators, smc, signal };
  },

  async scanAll() {
    const settings = settingsService.get();
    const results = [];
    for (const symbol of settings.symbols) {
      for (const timeframe of settings.timeframes) {
        results.push(await this.analyze(symbol, timeframe));
      }
    }
    return results;
  },

  listSignals(filters: Partial<{ status: string; symbol: string; min_score: number; limit: number; offset: number }>) {
    const signals = [...signalMap.values()].sort((a, b) => b.createdAt - a.createdAt);
    return signals
      .filter((signal) => !filters.status || signal.status === filters.status)
      .filter((signal) => !filters.symbol || signal.symbol === filters.symbol)
      .filter((signal) => !filters.min_score || signal.qualityScore >= filters.min_score)
      .slice(filters.offset ?? 0, (filters.offset ?? 0) + (filters.limit ?? 50));
  },

  getStats() {
    const signals = [...signalMap.values()];
    const closed = signals.filter((signal) => signal.status === 'HIT_TP' || signal.status === 'HIT_SL');
    const wins = closed.filter((signal) => signal.status === 'HIT_TP').length;
    const active = signals.filter((signal) => signal.status === 'ACTIVE');
    return {
      totalSignals: signals.length,
      activeSignals: active.length,
      winRate: closed.length ? Math.round((wins / closed.length) * 100) : 0,
      averageQualityScore: active.length
        ? Math.round(active.reduce((sum, signal) => sum + signal.qualityScore, 0) / active.length)
        : 0,
      averagePnlPercent: signals.length
        ? Number((signals.reduce((sum, signal) => sum + (signal.pnlPercent ?? 0), 0) / signals.length).toFixed(2))
        : 0,
      bestSignal: signals.sort((a, b) => (b.pnlPercent ?? 0) - (a.pnlPercent ?? 0))[0] ?? null,
      signals,
    };
  },
};
