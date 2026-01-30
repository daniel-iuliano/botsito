
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { coinexRequest } from './lib/coinex';
import { encryptSession } from './lib/crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { apiKey, apiSecret } = req.body;
  
  try {
    // Generate a temporary session to test
    const tempToken = encryptSession({ apiKey, apiSecret });
    const info = await coinexRequest('/balance/info', {}, tempToken);
    
    if (info.code !== 0) {
      return res.status(401).json({ success: false, message: info.message });
    }

    // Key is valid, return the encrypted session token for the frontend to hold
    return res.status(200).json({
      success: true,
      username: "Nexus_User_" + apiKey.slice(0, 4),
      token: tempToken
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
