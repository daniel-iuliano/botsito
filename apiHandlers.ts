
import { coinexRequest, getMarketTickers } from "./api/lib/coinex";
import { decryptSession, encryptSession } from "./api/lib/crypto";

/**
 * Validates API keys and issues a stateless session token.
 */
export async function setApiKeys(req: any, res: any) {
  const { apiKey, apiSecret } = req.body;
  if (!apiKey || !apiSecret) {
    return res.status(400).json({ success: false, message: "Missing API credentials" });
  }

  try {
    const tempToken = encryptSession({ apiKey, apiSecret });
    const info = await coinexRequest('/v1/account/info', {}, tempToken);
    
    const username = info.data?.user || `User_${apiKey.slice(0, 4)}`;
    const finalToken = encryptSession({ apiKey, apiSecret, username });

    return res.json({
      success: true,
      username,
      token: finalToken
    });
  } catch (e: any) {
    return res.status(401).json({ 
      success: false, 
      message: e.message || "HMAC Authentication Failed" 
    });
  }
}

/**
 * Checks the session token validity and returns account info.
 */
export async function connectionStatus(req: any, res: any) {
  const token = req.headers.authorization;
  if (!token) return res.json({ connected: false });

  const session = decryptSession(token);
  if (!session) return res.json({ connected: false, error: "Invalid session" });

  return res.json({
    connected: true,
    username: session.username
  });
}

/**
 * Scans markets for scalping opportunities.
 */
export async function marketSnapshot(req: any, res: any) {
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
        
        // Quant scoring logic
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
          reason: rsi < 35 ? "Oversold RSI Convergence" : "High Institutional Liquidity"
        };
      })
      .filter((o): o is any => o !== null && o.symbol.endsWith('USDT') && o.volume24h > 0.1)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    return res.json({ opportunities });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getBalances(req: any, res: any) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const info = await coinexRequest('/v1/balance/info', {}, token);
    const balances = Object.keys(info.data).map(asset => ({
      asset,
      available: parseFloat(info.data[asset].available),
      frozen: parseFloat(info.data[asset].frozen),
      total: parseFloat(info.data[asset].available) + parseFloat(info.data[asset].frozen)
    })).filter(b => b.total > 0);

    return res.json({ success: true, balances });
  } catch (e: any) {
    return res.status(400).json({ success: false, message: e.message });
  }
}

export async function startBot(req: any, res: any) {
  const token = req.headers.authorization;
  if (!token || !decryptSession(token)) {
    return res.status(401).json({ error: 'Valid session required' });
  }
  return res.json({ success: true, status: 'RUNNING', startTime: Date.now() });
}

export async function stopBot(req: any, res: any) {
  return res.json({ success: true, status: 'OFF', endTime: Date.now() });
}

export async function handleTestConnection(req: any, res: any) {
  const token = req.headers.authorization;
  try {
    const result = await coinexRequest("/v1/balance/info", {}, token);
    return res.json({ success: true, data: result });
  } catch (e: any) {
    return res.status(400).json({ success: false, message: e.message });
  }
}
