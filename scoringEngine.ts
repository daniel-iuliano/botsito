
import { calculateRSI } from "./indicators";

export interface MarketAnalysis {
  symbol: string;
  price: number;
  volume: number;
  spread: number;
  rsi: number;
  volumeSpike: boolean;
  maxSpread: number;
}

export function scoreMarket(data: MarketAnalysis) {
  let score = 0;

  // RSI Factor (Oversold preference for scalping)
  if (data.rsi < 30) score += 40;
  else if (data.rsi < 45) score += 20;

  // Spread Factor (Liquidity)
  const spreadPct = (data.spread / data.price) * 100;
  if (spreadPct < 0.05) score += 30;
  else if (spreadPct < 0.1) score += 15;

  // Volume Spike Factor
  if (data.volumeSpike) score += 20;

  // Absolute limit: if spread is too wide, penalize heavily
  if (spreadPct > 0.5) score -= 50;

  return Math.max(0, Math.min(100, score));
}
