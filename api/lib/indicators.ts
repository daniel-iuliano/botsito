
export function calculateRSI(prices: number[], period = 14): number {
  if (prices.length <= period) return 50;
  let gains = 0, losses = 0;
  for (let i = prices.length - period; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff; else losses -= diff;
  }
  const rs = (gains / period) / (losses / period || 1);
  return 100 - (100 / (1 + rs));
}

export function calculateEMA(prices: number[], period: number): number {
  const k = 2 / (period + 1);
  return prices.reduce((acc, val) => val * k + acc * (1 - k), prices[0]);
}

export function calculateVolatility(prices: number[]): number {
  const mean = prices.reduce((a, b) => a + b) / prices.length;
  const variance = prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length;
  return Math.sqrt(variance);
}
