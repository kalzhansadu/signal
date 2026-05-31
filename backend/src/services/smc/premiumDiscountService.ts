import type { Candle, SmcSummary, SwingPoint } from '../../types/domain.js';

export const premiumDiscountService = {
  classify(candles: Candle[], swings: SwingPoint[]): Pick<SmcSummary, 'premiumDiscount' | 'equilibrium'> {
    const recentHigh = [...swings].reverse().find((swing) => swing.type === 'HIGH');
    const recentLow = [...swings].reverse().find((swing) => swing.type === 'LOW');
    const fallbackHigh = Math.max(...candles.slice(-80).map((candle) => candle.high));
    const fallbackLow = Math.min(...candles.slice(-80).map((candle) => candle.low));
    const high = recentHigh?.price ?? fallbackHigh;
    const low = recentLow?.price ?? fallbackLow;
    const equilibrium = (high + low) / 2;
    const close = candles[candles.length - 1].close;
    const distance = Math.abs(close - equilibrium) / equilibrium;

    return {
      equilibrium,
      premiumDiscount:
        distance < 0.002 ? 'EQUILIBRIUM' : close > equilibrium ? 'PREMIUM' : 'DISCOUNT',
    };
  },
};
