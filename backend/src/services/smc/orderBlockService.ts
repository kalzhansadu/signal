import { id } from '../../lib/number.js';
import type { Candle, OrderBlockZone, StructureEvent } from '../../types/domain.js';

const overlaps = (candle: Candle, low: number, high: number) => candle.high >= low && candle.low <= high;

export const orderBlockService = {
  find(candles: Candle[], structure: StructureEvent[]): OrderBlockZone[] {
    const zones: OrderBlockZone[] = [];

    for (const event of structure) {
      const isBull = event.type.endsWith('BULL');
      for (let i = event.candleIndex - 1; i >= Math.max(0, event.candleIndex - 12); i -= 1) {
        const candle = candles[i];
        const bearish = candle.close < candle.open;
        const bullish = candle.close > candle.open;
        if ((isBull && bearish) || (!isBull && bullish)) {
          zones.push({
            id: id('ob', [event.type, candle.time]),
            type: isBull ? 'BULL' : 'BEAR',
            high: candle.high,
            low: candle.low,
            timestamp: candle.time,
            status: 'UNMITIGATED',
          });
          break;
        }
      }
    }

    return this.updateStatus(candles, zones).slice(-30);
  },

  updateStatus(candles: Candle[], zones: OrderBlockZone[]): OrderBlockZone[] {
    return zones.map((zone) => {
      const start = candles.findIndex((candle) => candle.time > zone.timestamp);
      const later = start === -1 ? [] : candles.slice(start);
      const touched = later.some((candle) => overlaps(candle, zone.low, zone.high));
      const broken = later.some((candle) =>
        zone.type === 'BULL' ? candle.close < zone.low : candle.close > zone.high,
      );
      return { ...zone, status: broken ? 'BROKEN' : touched ? 'MITIGATED' : 'UNMITIGATED' };
    });
  },
};
