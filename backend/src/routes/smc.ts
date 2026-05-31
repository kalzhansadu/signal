import { Router } from 'express';
import { analysisService } from '../services/analysisService.js';
import type { Timeframe } from '../types/domain.js';

export const smcRouter = Router();

smcRouter.get('/:symbol/:timeframe/summary', async (req, res, next) => {
  try {
    const { smc } = await analysisService.analyze(req.params.symbol.toUpperCase(), req.params.timeframe as Timeframe);
    res.json(smc);
  } catch (error) {
    next(error);
  }
});

smcRouter.get('/:symbol/:timeframe/structure', async (req, res, next) => {
  try {
    const { smc } = await analysisService.analyze(req.params.symbol.toUpperCase(), req.params.timeframe as Timeframe);
    res.json({ bias: smc.bias, structure: smc.structure });
  } catch (error) {
    next(error);
  }
});

smcRouter.get('/:symbol/:timeframe/orderblocks', async (req, res, next) => {
  try {
    const { smc } = await analysisService.analyze(req.params.symbol.toUpperCase(), req.params.timeframe as Timeframe);
    res.json(smc.orderBlocks);
  } catch (error) {
    next(error);
  }
});

smcRouter.get('/:symbol/:timeframe/fvg', async (req, res, next) => {
  try {
    const { smc } = await analysisService.analyze(req.params.symbol.toUpperCase(), req.params.timeframe as Timeframe);
    res.json(smc.fairValueGaps);
  } catch (error) {
    next(error);
  }
});

smcRouter.get('/:symbol/:timeframe/liquidity', async (req, res, next) => {
  try {
    const { smc } = await analysisService.analyze(req.params.symbol.toUpperCase(), req.params.timeframe as Timeframe);
    res.json(smc.liquidity);
  } catch (error) {
    next(error);
  }
});
