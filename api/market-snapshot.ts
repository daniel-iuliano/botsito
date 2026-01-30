
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMarketTickers } from './lib/coinex';
import { calculateRSI } from './lib/indicators';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const tickers = await getMarketTickers();
    const marketList = Object.keys(tickers);
    
    // 1. High-level filtering (Volume > $500k)
    const candidates = marketList
      .map(symbol => ({
        symbol,
        ...tickers[symbol],
        volUSD: parseFloat(tickers[symbol].vol) * parseFloat(tickers[symbol].last)
      }))
      .filter(m => m.volUSD > 500000 && m.symbol.endsWith('USDT'))
      .sort((a, b) => b.volUSD - a.volUSD)
      .slice(0, 15);

    // 2. Score Calculation
    const opportunities = candidates.map(c => {
      const last = parseFloat(c.last);
      const buy = parseFloat(c.buy);
      const sell = parseFloat(c.sell);
      const spread = ((sell - buy) / last) * 100;
      
      // Mocked RSI for the snapshot - in production, we would fetch K-lines here
      const rsi = 30 + Math.random() * 40; 
      
      let score = 50;
      if (rsi < 35) score += 25;
      if (spread < 0.05) score += 15;
      if (parseFloat(c.vol) > 1000000) score += 10;

      return {
        symbol: c.symbol,
        price: last,
        score: Math.min(100, score),
        spread,
        indicators: { rsi, volatility: 1.2 },
        reason: rsi < 35 ? "Oversold RSI Reversal" : "High Liquidity Momentum"
      };
    });

    return res.status(200).json({
      timestamp: Date.now(),
      opportunities: opportunities.sort((a, b) => b.score - a.score)
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
