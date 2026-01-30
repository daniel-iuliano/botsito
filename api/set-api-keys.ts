
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { coinexRequest } from './lib/coinex';
import { encryptSession } from './lib/crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  
  const { apiKey, apiSecret } = req.body || {};
  if (!apiKey || !apiSecret) {
    return res.status(400).json({ success: false, message: "Missing API credentials" });
  }

  try {
    // 1. Create a temporary token to test the connection
    const tempToken = encryptSession({ apiKey, apiSecret });
    
    // 2. Validate by fetching account info
    const info = await coinexRequest('/v1/account/info', {}, tempToken);
    
    // 3. Extract user info
    const username = info.data?.user || `User_${apiKey.slice(0, 4)}`;

    // 4. Issue the final stateless session token containing the keys and username
    const finalToken = encryptSession({ apiKey, apiSecret, username });

    return res.status(200).json({
      success: true,
      username,
      token: finalToken
    });
  } catch (error: any) {
    return res.status(401).json({ 
      success: false, 
      message: error.message || "Invalid CoinEx API keys or signing error" 
    });
  }
}
