import { id } from '../../lib/number.js';
import type { Bias, Candle, StructureEvent, SwingPoint } from '../../types/domain.js';

export const structureService = {
  findSwings(candles: Candle[], lookback = 3): SwingPoint[] {
    const swings: SwingPoint[] = [];
    for (let i = lookback; i < candles.length - lookback; i += 1) {
      const before = candles.slice(i - lookback, i);
      const after = candles.slice(i + 1, i + lookback + 1);
      const high = candles[i].high;
      const low = candles[i].low;
      if (before.every((c) => high > c.high) && after.every((c) => high > c.high)) {
        swings.push({ index: i, price: high, time: candles[i].time, type: 'HIGH' });
      }
      if (before.every((c) => low < c.low) && after.every((c) => low < c.low)) {
        swings.push({ index: i, price: low, time: candles[i].time, type: 'LOW' });
      }
    }
    return swings.slice(-200);
  },

  detectStructure(candles: Candle[], swings: SwingPoint[]): { bias: Bias; events: StructureEvent[] } {
    const events: StructureEvent[] = [];
    let bias: Bias = 'NEUTRAL';
    let lastHigh: SwingPoint | undefined;
    let lastLow: SwingPoint | undefined;

    for (let i = 1; i < candles.length; i += 1) {
      const newSwings = swings.filter((swing) => swing.index === i - 1);
      for (const swing of newSwings) {
        if (swing.type === 'HIGH') lastHigh = swing;
        if (swing.type === 'LOW') lastLow = swing;
      }

      const close = candles[i].close;
      if (lastHigh && close > lastHigh.price) {
        const type = bias === 'BEARISH' ? 'CHOCH_BULL' : 'BOS_BULL';
        bias = 'BULLISH';
        events.push({
          id: id('structure', [type, i, Math.round(lastHigh.price)]),
          type,
          priceLevel: lastHigh.price,
          candleIndex: i,
          timestamp: candles[i].time,
        });
        lastHigh = undefined;
      }
      if (lastLow && close < lastLow.price) {
        const type = bias === 'BULLISH' ? 'CHOCH_BEAR' : 'BOS_BEAR';
        bias = 'BEARISH';
        events.push({
          id: id('structure', [type, i, Math.round(lastLow.price)]),
          type,
          priceLevel: lastLow.price,
          candleIndex: i,
          timestamp: candles[i].time,
        });
        lastLow = undefined;
      }
    }

    return { bias, events: events.slice(-80) };
  },
};
