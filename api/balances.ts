
export const config = {
  runtime: "nodejs"
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { coinexRequest } from './lib/coinex.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    return res.status(200).json({ success: true, balances });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}
