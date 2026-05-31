import { clamp, id, round } from '../../lib/number.js';
import type { IndicatorSnapshot, Signal, SmcSummary, Timeframe } from '../../types/domain.js';

const scoreSignal = (direction: Signal['direction'], smc: SmcSummary, indicators: IndicatorSnapshot) => {
  let score = 35;
  if ((direction === 'LONG' && smc.bias === 'BULLISH') || (direction === 'SHORT' && smc.bias === 'BEARISH')) {
    score += 20;
  }
  if ((direction === 'LONG' && smc.premiumDiscount === 'DISCOUNT') || (direction === 'SHORT' && smc.premiumDiscount === 'PREMIUM')) {
    score += 15;
  }
  if (indicators.rsi !== null && ((direction === 'LONG' && indicators.rsi < 55) || (direction === 'SHORT' && indicators.rsi > 45))) {
    score += 10;
  }
  if (indicators.ema20 !== null && indicators.ema50 !== null) {
    if ((direction === 'LONG' && indicators.ema20 > indicators.ema50) || (direction === 'SHORT' && indicators.ema20 < indicators.ema50)) {
      score += 10;
    }
  }
  if (smc.liquidity.some((zone) => zone.swept)) score += 10;
  return clamp(Math.round(score), 0, 100);
};

export const smcSignalService = {
  generate(
    symbol: string,
    timeframe: Timeframe,
    close: number,
    indicators: IndicatorSnapshot,
    smc: SmcSummary,
    minQualityScore: number,
    atrMultiplier: number,
    riskRewardRatio: number,
  ): Signal | null {
    const latestEvent = [...smc.structure].reverse()[0];
    if (!latestEvent || smc.bias === 'NEUTRAL') return null;

    const direction: Signal['direction'] = smc.bias === 'BULLISH' ? 'LONG' : 'SHORT';
    const matchingOb = [...smc.orderBlocks].reverse().find((ob) => ob.type === (direction === 'LONG' ? 'BULL' : 'BEAR'));
    const matchingFvg = [...smc.fairValueGaps].reverse().find((gap) => gap.type === (direction === 'LONG' ? 'BULL' : 'BEAR') && gap.status !== 'FILLED');
    const atr = indicators.atr ?? close * 0.01;
    const risk = atr * atrMultiplier;
    const entry = close;
    const stopLoss = direction === 'LONG' ? entry - risk : entry + risk;
    const takeProfit = direction === 'LONG' ? entry + risk * riskRewardRatio : entry - risk * riskRewardRatio;
    const score = scoreSignal(direction, smc, indicators);

    if (score < minQualityScore) return null;

    return {
      id: id('sig', [symbol, timeframe, latestEvent.id]),
      symbol,
      timeframe,
      direction,
      entryPrice: round(entry, 4) ?? entry,
      stopLoss: round(stopLoss, 4) ?? stopLoss,
      takeProfit: round(takeProfit, 4) ?? takeProfit,
      riskPercent: round((Math.abs(entry - stopLoss) / entry) * 100, 2) ?? 0,
      rsiValue: indicators.rsi,
      macdValue: indicators.macd,
      atrValue: indicators.atr,
      smcStructure: smc.bias,
      smcEvent: latestEvent.type.includes('CHOCH') ? 'CHOCH' : 'BOS',
      obHigh: matchingOb?.high,
      obLow: matchingOb?.low,
      liquidityTarget: [...smc.liquidity].reverse().find((zone) => !zone.swept)?.priceLevel,
      qualityScore: score,
      premiumDiscount: smc.premiumDiscount,
      entryType: matchingOb && matchingFvg ? 'OB_FVG' : matchingOb ? 'OB' : 'FVG',
      status: 'ACTIVE',
      createdAt: Date.now(),
    };
  },
};
