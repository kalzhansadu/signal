import { Router } from 'express';
import { analysisService } from '../services/analysisService.js';

export const signalsRouter = Router();

signalsRouter.get('/', (req, res) => {
  res.json(
    analysisService.listSignals({
      status: req.query.status?.toString(),
      symbol: req.query.symbol?.toString(),
      min_score: req.query.min_score ? Number(req.query.min_score) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      offset: req.query.offset ? Number(req.query.offset) : undefined,
    }),
  );
});

signalsRouter.get('/:id', (req, res) => {
  const signal = analysisService.listSignals({ limit: 1000 }).find((item) => item.id === req.params.id);
  if (!signal) {
    res.status(404).json({ message: 'Signal not found' });
    return;
  }
  res.json(signal);
});
