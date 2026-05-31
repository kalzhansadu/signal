import { Router } from 'express';
import { analysisService } from '../services/analysisService.js';
import type { Timeframe } from '../types/domain.js';

export const marketRouter = Router();

marketRouter.get('/:symbol/:timeframe', async (req, res, next) => {
  try {
    const result = await analysisService.analyze(req.params.symbol.toUpperCase(), req.params.timeframe as Timeframe);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
