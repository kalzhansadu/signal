import { id } from '../../lib/number.js';
import type { Candle, FairValueGapZone } from '../../types/domain.js';

export const fvgService = {
  find(candles: Candle[]): FairValueGapZone[] {
    const gaps: FairValueGapZone[] = [];
    for (let i = 2; i < candles.length; i += 1) {
      const first = candles[i - 2];
      const third = candles[i];
      if (first.high < third.low) {
        gaps.push({
          id: id('fvg', ['bull', third.time]),
          type: 'BULL',
          high: third.low,
          low: first.high,
          timestamp: third.time,
          status: 'OPEN',
        });
      }
      if (first.low > third.high) {
        gaps.push({
          id: id('fvg', ['bear', third.time]),
          type: 'BEAR',
          high: first.low,
          low: third.high,
          timestamp: third.time,
          status: 'OPEN',
        });
      }
    }
    return this.updateStatus(candles, gaps).slice(-40);
  },

  updateStatus(candles: Candle[], gaps: FairValueGapZone[]): FairValueGapZone[] {
    return gaps.map((gap) => {
      const later = candles.filter((candle) => candle.time > gap.timestamp);
      const entered = later.some((candle) => candle.high >= gap.low && candle.low <= gap.high);
      const filled = later.some((candle) =>
        gap.type === 'BULL' ? candle.low <= gap.low : candle.high >= gap.high,
      );
      return { ...gap, status: filled ? 'FILLED' : entered ? 'PARTIAL' : 'OPEN' };
    });
  },
};
