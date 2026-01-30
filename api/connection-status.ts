
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { decryptSession } from './lib/crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(200).json({ connected: false });
  }

  const session = decryptSession(token);
  if (!session) {
    return res.status(200).json({ connected: false, error: 'Session expired' });
  }

  return res.status(200).json({
    connected: true,
    username: session.username || "Nexus_Quant_User"
  });
}
