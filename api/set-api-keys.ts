
export const config = {
  runtime: "nodejs"
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { coinexRequest } from './lib/coinex.js';
import { encryptSession } from './lib/crypto.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  
  const { apiKey, apiSecret } = req.body || {};
  if (!apiKey || !apiSecret) {
    return res.status(400).json({ success: false, message: "Missing API credentials" });
  }

  try {
    const tempToken = encryptSession({ apiKey, apiSecret });
    // Verify credentials by fetching account info
    const info = await coinexRequest('/v1/account/info', {}, tempToken);
    
    const username = info.data?.user || `User_${apiKey.slice(0, 4)}`;
    const finalToken = encryptSession({ apiKey, apiSecret, username });

    return res.status(200).json({
      success: true,
      username,
      token: finalToken
    });
  } catch (error: any) {
    console.error("[Auth Error]", error);
    return res.status(401).json({ 
      success: false, 
      message: error.message || "Invalid CoinEx API keys or signing error" 
    });
  }
}
