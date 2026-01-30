
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { coinexRequest } from './lib/coinex';
import { encryptSession } from './lib/crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { apiKey, apiSecret } = req.body;
  if (!apiKey || !apiSecret) return res.status(400).json({ message: "API Keys Required" });

  try {
    // Generate temporary token to verify
    const token = encryptSession({ apiKey, apiSecret });
    const info = await coinexRequest('/balance/info', {}, token);
    
    if (info.code !== 0) {
      return res.status(401).json({ success: false, message: info.message });
    }

    return res.status(200).json({
      success: true,
      username: `Nexus_Trader_${apiKey.slice(0, 4)}`,
      token // Frontend will hold this encrypted secret
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
