import { Router } from 'express';
import { settingsService } from '../services/settingsService.js';

export const settingsRouter = Router();

settingsRouter.get('/', (_req, res) => {
  res.json(settingsService.get());
});

settingsRouter.put('/', (req, res) => {
  res.json(settingsService.update(req.body));
});
