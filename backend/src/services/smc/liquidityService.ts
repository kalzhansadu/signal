import { id } from '../../lib/number.js';
import type { Candle, LiquidityZone, SwingPoint } from '../../types/domain.js';

const tolerance = 0.001;

export const liquidityService = {
  find(candles: Candle[], swings: SwingPoint[]): LiquidityZone[] {
    const zones: LiquidityZone[] = [];
    for (const swing of swings.slice(-80)) {
      const similar = swings.filter(
        (other) =>
          other.type === swing.type &&
          other.index !== swing.index &&
          Math.abs(other.price - swing.price) / swing.price <= tolerance,
      );
      if (similar.length > 0) {
        zones.push({
          id: id('liq', [swing.type, Math.round(swing.price * 100), swing.time]),
          type: swing.type === 'HIGH' ? 'BSL' : 'SSL',
          priceLevel: swing.price,
          swept: false,
        });
      }
    }

    return zones
      .map((zone) => {
        const sweep = candles.find((candle) =>
          zone.type === 'BSL'
            ? candle.high > zone.priceLevel && candle.close < zone.priceLevel
            : candle.low < zone.priceLevel && candle.close > zone.priceLevel,
        );
        return sweep ? { ...zone, swept: true, sweptAt: sweep.time } : zone;
      })
      .slice(-30);
  },
};
