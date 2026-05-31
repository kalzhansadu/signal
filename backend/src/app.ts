import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { marketRouter } from './routes/market.js';
import { scanRouter } from './routes/scan.js';
import { settingsRouter } from './routes/settings.js';
import { signalsRouter } from './routes/signals.js';
import { smcRouter } from './routes/smc.js';
import { statsRouter } from './routes/stats.js';

export const createApp = () => {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.frontendOrigin }));
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ ok: true, timestamp: Date.now() }));
  app.use('/api/signals', signalsRouter);
  app.use('/api/stats', statsRouter);
  app.use('/api/smc', smcRouter);
  app.use('/api/market', marketRouter);
  app.use('/api/scan', scanRouter);
  app.use('/api/settings', settingsRouter);

  app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(500).json({ message: error.message });
  });

  return app;
};
