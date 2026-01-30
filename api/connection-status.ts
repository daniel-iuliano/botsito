
export const config = {
  runtime: "nodejs"
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { decryptSession } from './lib/crypto.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(200).json({ connected: false });
  }

  try {
    const session = decryptSession(token);
    if (!session) {
      return res.status(200).json({ connected: false, error: 'Invalid Session' });
    }

    return res.status(200).json({
      connected: true,
      username: session.username
    });
  } catch (error) {
    return res.status(200).json({ connected: false });
  }
}
