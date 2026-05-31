import type { Candle, SmcSummary } from '../../types/domain.js';
import { fvgService } from './fvgService.js';
import { liquidityService } from './liquidityService.js';
import { orderBlockService } from './orderBlockService.js';
import { premiumDiscountService } from './premiumDiscountService.js';
import { structureService } from './structureService.js';

export const smcService = {
  analyze(candles: Candle[], swingLookback = 3): SmcSummary {
    const confirmed = candles.slice(0, -1);
    const swings = structureService.findSwings(confirmed, swingLookback);
    const structure = structureService.detectStructure(confirmed, swings);
    const orderBlocks = orderBlockService.find(confirmed, structure.events);
    const fairValueGaps = fvgService.find(confirmed);
    const liquidity = liquidityService.find(confirmed, swings);
    const pd = premiumDiscountService.classify(confirmed, swings);

    return {
      bias: structure.bias,
      premiumDiscount: pd.premiumDiscount,
      equilibrium: pd.equilibrium,
      swings,
      structure: structure.events,
      orderBlocks,
      fairValueGaps,
      liquidity,
    };
  },
};
