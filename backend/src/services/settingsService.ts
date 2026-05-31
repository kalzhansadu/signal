import { env } from '../config/env.js';
import type { Settings } from '../types/domain.js';

let settings: Settings = {
  symbols: ['XAUUSD'],
  timeframes: ['15m', '1h', '4h'],
  scanIntervalMin: env.scanIntervalMin,
  rsiPeriod: 14,
  atrMultiplier: 1.5,
  riskRewardRatio: 2,
  swingLookback: 3,
  minQualityScore: env.minQualityScore,
  liquiditySweepLookback: 20,
  telegramQualityThreshold: 75,
};

export const settingsService = {
  get: () => settings,
  update: (patch: Partial<Settings>) => {
    settings = { ...settings, ...patch };
    return settings;
  },
};
