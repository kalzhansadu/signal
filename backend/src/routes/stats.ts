import { Router } from 'express';
import { analysisService } from '../services/analysisService.js';

export const statsRouter = Router();

statsRouter.get('/', (_req, res) => {
  res.json(analysisService.getStats());
});
