
export const config = {
  runtime: "nodejs"
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { decryptSession } from './lib/crypto.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const token = req.headers.authorization;
  if (!token || !decryptSession(token)) {
    return res.status(401).json({ error: 'Valid session required' });
  }

  return res.status(200).json({ 
    success: true, 
    status: 'RUNNING',
    startTime: Date.now()
  });
}
