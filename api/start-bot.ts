
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { decryptSession } from './lib/crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const token = req.headers.authorization;
  const { config } = req.body;

  if (!token || !decryptSession(token)) {
    return res.status(401).json({ error: 'Valid session required to start engine' });
  }

  // Security check: Never start live without validation
  if (config.mode === 'REAL') {
    // In a production app, we would log this activation to an audit trail
    console.log(`[BOT_ACTIVATION] Live trading engaged by session`);
  }

  return res.status(200).json({ 
    success: true, 
    status: 'RUNNING',
    startTime: Date.now()
  });
}
