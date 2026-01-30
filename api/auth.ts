
export const config = {
  runtime: "nodejs"
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { coinexRequest } from './lib/coinex.js';
import { encryptSession, decryptSession } from './lib/crypto.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(200).json({ connected: false });
    const session = decryptSession(authHeader);
    if (!session) return res.status(200).json({ connected: false });
    return res.status(200).json({ connected: true, username: session.username });
  }

  if (req.method === 'POST') {
    try {
      const { apiKey, apiSecret } = req.body || {};
      if (!apiKey || !apiSecret) return res.status(400).json({ error: "Missing keys" });

      const tempToken = encryptSession({ apiKey, apiSecret });
      const info = await coinexRequest('/v1/account/info', {}, tempToken);
      
      const username = info.data?.user || `User_${apiKey.slice(0, 4)}`;
      const token = encryptSession({ apiKey, apiSecret, username });

      return res.status(200).json({ success: true, username, token });
    } catch (err: any) {
      return res.status(401).json({ error: err.message });
    }
  }

  return res.status(405).end();
}
