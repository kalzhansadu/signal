import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT ?? 3000),
  binanceBaseUrl: process.env.BINANCE_BASE_URL ?? 'https://api.binance.com',
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
  scanIntervalMin: Number(process.env.SCAN_INTERVAL_MIN ?? 15),
  minQualityScore: Number(process.env.MIN_QUALITY_SCORE ?? 40),
};
