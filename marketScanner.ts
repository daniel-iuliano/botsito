
import { getAllMarkets, getTicker } from "./coinexClient";

export const marketState: Record<string, any> = {};

export async function scanMarkets() {
  try {
    const markets = await getAllMarkets();
    
    // In a production environment, we'd use WebSockets for real-time updates.
    // Here we poll the top candidates or a subset to stay within rate limits.
    const limitedMarkets = markets.slice(0, 20); 

    for (const symbol of limitedMarkets) {
      const ticker = await getTicker(symbol);

      marketState[symbol] = {
        price: parseFloat(ticker.last),
        volume: parseFloat(ticker.vol),
        bid: parseFloat(ticker.buy),
        ask: parseFloat(ticker.sell),
        spread: parseFloat(ticker.sell) - parseFloat(ticker.buy),
        updatedAt: Date.now()
      };
    }
  } catch (error) {
    console.error("Market scanning error:", error);
  }
}
