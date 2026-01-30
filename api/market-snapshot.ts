
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMarketDataSnapshot } from './lib/coinex';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const tickers = await getMarketDataSnapshot();
    const marketList = Object.keys(tickers);
    
    const opportunities = marketList
      .map(symbol => {
        const t = tickers[symbol];
        const last = parseFloat(t.last);
        const buy = parseFloat(t.buy);
        const sell = parseFloat(t.sell);
        const volUSD = parseFloat(t.vol) * last;
        const spread = ((sell - buy) / last) * 100;
        
        // Quant scoring engine
        // Prefer: High volume, Low spread, Recent dip (mocked RSI)
        const rsi = 30 + (Math.random() * 40); 
        let score = 50;
        
        if (rsi < 35) score += 30;
        if (spread < 0.04) score += 20;
        if (volUSD > 1000000) score += 10;
        if (spread > 0.2) score -= 40;

        return {
          symbol,
          price: last,
          change24h: ((last - parseFloat(t.open)) / parseFloat(t.open)) * 100,
          volume24h: volUSD / 1000000, // in Millions
          score: Math.min(100, Math.max(0, Math.round(score))),
          spread,
          indicators: {
            rsi,
            volatility: 1.5,
            macd: { value: 0, signal: 0, histogram: 0 },
            ema3: last,
            ema9: last,
            ema21: last
          },
          reason: rsi < 35 ? "Oversold RSI Convergence" : spread < 0.04 ? "High-Liquidity Scalp Zone" : "Momentum Trend"
        };
      })
      .filter(o => o.symbol.endsWith('USDT') && o.volume24h > 0.2)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    return res.status(200).json({ opportunities });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
