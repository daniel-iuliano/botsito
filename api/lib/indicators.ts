
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

export function calculateMACD(prices: number[]) {
  const ema12 = calculateEMA(prices.slice(-12), 12);
  const ema26 = calculateEMA(prices.slice(-26), 26);
  const macdLine = ema12 - ema26;
  // Simplified signal line for snapshot performance
  const signalLine = macdLine * 0.9; 
  return {
    value: macdLine,
    signal: signalLine,
    histogram: macdLine - signalLine
  };
}

export function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i-1]) / prices[i-1]);
  }
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
  return Math.sqrt(variance) * 100;
}
