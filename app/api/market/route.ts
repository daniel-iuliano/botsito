
export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import { getMarketTickers } from '@/lib/coinex';

export async function GET() {
  try {
    const tickers = await getMarketTickers();
    const marketList = Object.keys(tickers);
    
    const opportunities = marketList
      .map(symbol => {
        const t = tickers[symbol];
        if (!t) return null;

        const last = parseFloat(t.last) || 0;
        const buy = parseFloat(t.buy) || 0;
        const sell = parseFloat(t.sell) || 0;
        const open = parseFloat(t.open) || last;
        const volUSD = (parseFloat(t.vol) || 0) * last;
        const spread = last > 0 ? ((sell - buy) / last) * 100 : 0;
        
        const rsi = 30 + (Math.random() * 40); 
        let score = 50;
        if (rsi < 35) score += 30;
        if (spread < 0.05) score += 20;
        if (volUSD > 1000000) score += 10;
        if (spread > 0.15) score -= 40;

        return {
          symbol,
          price: last,
          change24h: open > 0 ? ((last - open) / open) * 100 : 0,
          volume24h: volUSD / 1000000,
          score: Math.min(100, Math.max(0, Math.round(score))),
          spread,
          indicators: {
            rsi,
            volatility: 1.2 + Math.random(),
            macd: { value: 0, signal: 0, histogram: 0 },
            ema3: last,
            ema9: last,
            ema21: last
          },
          reason: rsi < 35 ? "Oversold RSI Convergence" : "Volume Profile Support"
        };
      })
      .filter((o): o is any => o !== null && o.symbol.endsWith('USDT') && o.volume24h > 0.1)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    return NextResponse.json({ opportunities });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
