import { Router } from 'express';
import { schedulerService } from '../services/scheduler/schedulerService.js';

export const scanRouter = Router();

scanRouter.post('/', async (_req, res, next) => {
  try {
    const results = await schedulerService.scan();
    res.json({
      scanned: results.length,
      signals: results.map((result) => result.signal).filter(Boolean),
    });
  } catch (error) {
    next(error);
  }
});
