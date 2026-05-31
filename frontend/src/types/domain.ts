export type Timeframe = '5m' | '15m' | '1h' | '4h' | '1d';
export type Direction = 'LONG' | 'SHORT';
export type Bias = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorSnapshot {
  rsi: number | null;
  macd: number | null;
  macdSignal: number | null;
  ema20: number | null;
  ema50: number | null;
  bbUpper: number | null;
  bbMiddle: number | null;
  bbLower: number | null;
  atr: number | null;
  volumeMa20: number | null;
}

export interface StructureEvent {
  id: string;
  type: 'BOS_BULL' | 'BOS_BEAR' | 'CHOCH_BULL' | 'CHOCH_BEAR';
  priceLevel: number;
  candleIndex: number;
  timestamp: number;
}

export interface OrderBlockZone {
  id: string;
  type: 'BULL' | 'BEAR';
  high: number;
  low: number;
  timestamp: number;
  status: 'UNMITIGATED' | 'MITIGATED' | 'BROKEN';
}

export interface FairValueGapZone {
  id: string;
  type: 'BULL' | 'BEAR';
  high: number;
  low: number;
  timestamp: number;
  status: 'OPEN' | 'PARTIAL' | 'FILLED';
}

export interface LiquidityZone {
  id: string;
  type: 'BSL' | 'SSL';
  priceLevel: number;
  swept: boolean;
  sweptAt?: number;
}

export interface SmcSummary {
  bias: Bias;
  premiumDiscount: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM';
  equilibrium: number;
  structure: StructureEvent[];
  orderBlocks: OrderBlockZone[];
  fairValueGaps: FairValueGapZone[];
  liquidity: LiquidityZone[];
}

export interface Signal {
  id: string;
  symbol: string;
  timeframe: Timeframe;
  direction: Direction;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  riskPercent: number;
  rsiValue: number | null;
  macdValue: number | null;
  atrValue: number | null;
  smcStructure: Bias;
  smcEvent: 'BOS' | 'CHOCH';
  obHigh?: number;
  obLow?: number;
  liquidityTarget?: number;
  qualityScore: number;
  premiumDiscount: SmcSummary['premiumDiscount'];
  entryType: 'OB' | 'FVG' | 'OB_FVG';
  status: 'ACTIVE' | 'HIT_TP' | 'HIT_SL' | 'EXPIRED';
  createdAt: number;
  pnlPercent?: number;
}

export interface MarketResponse {
  candles: Candle[];
  indicators: IndicatorSnapshot[];
  smc: SmcSummary;
  signal: Signal | null;
}

export interface StatsResponse {
  totalSignals: number;
  activeSignals: number;
  winRate: number;
  averageQualityScore: number;
  averagePnlPercent: number;
  bestSignal: Signal | null;
  signals: Signal[];
}

export interface Settings {
  symbols: string[];
  timeframes: Timeframe[];
  scanIntervalMin: number;
  rsiPeriod: number;
  atrMultiplier: number;
  riskRewardRatio: number;
  swingLookback: number;
  minQualityScore: number;
  liquiditySweepLookback: number;
  telegramToken?: string;
  telegramChatId?: string;
  telegramQualityThreshold: number;
}
