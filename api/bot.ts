
export const config = {
  runtime: "nodejs"
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { decryptSession } from './lib/crypto.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = req.headers.authorization;
  if (!token || !decryptSession(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    const { action } = req.body || {};
    if (action === 'START') {
      return res.status(200).json({ success: true, status: 'RUNNING', startTime: Date.now() });
    } else {
      return res.status(200).json({ success: true, status: 'OFF', endTime: Date.now() });
    }
  }

  return res.status(405).end();
}
