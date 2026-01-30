
export enum BotStatus {
  OFF = 'OFF',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR'
}

export enum TradingMode {
  SIMULATION = 'SIMULATION',
  REAL = 'REAL'
}

export enum ConnectionStatus {
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  AUTH_FAILED = 'AUTH_FAILED'
}

export interface Indicators {
  rsi: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
  ema3: number;
  ema9: number;
  ema21: number;
  volatility: number;
}

export interface MarketOpportunity {
  symbol: string;
  score: number; // 0-100
  price: number;
  change24h: number;
  volume24h: number;
  spread: number;
  indicators: Indicators;
  reason: string;
}

export interface TradingConfig {
  mode: TradingMode;
  maxBalanceUsagePercent: number;
  maxRiskPerTradePercent: number;
  takeProfitPercent: number;
  stopLossPercent: number;
  trailingStopEnabled: boolean;
  cooldownSeconds: number;
  maxOpenPositions: number;
  minVolumeUSD: number;
  minOpportunityScore: number;
  rsiOversold: number;
  rsiOverbought: number;
}

export interface MarketData {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  volume24h: number;
  spread: number;
  timestamp: number;
}

export interface Trade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
  pnl: number;
  pnlPercent: number;
  entryTime: number;
  exitTime?: number;
  isSimulated: boolean;
}

export interface LogEntry {
  timestamp: number;
  level: 'INFO' | 'WARN' | 'ERROR' | 'TRADE';
  message: string;
}

export interface BotState {
  status: BotStatus;
  connection: ConnectionStatus;
  accountName?: string;
  config: TradingConfig;
  opportunities: MarketOpportunity[];
  trades: Trade[];
  logs: LogEntry[];
  balance: number;
  equity: number[];
  startTime?: number;
}
