
export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import { coinexRequest } from '@/lib/coinex';
import { encryptSession, decryptSession } from '@/lib/crypto';

export async function GET(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return NextResponse.json({ connected: false });
  
  const session = decryptSession(authHeader);
  if (!session) return NextResponse.json({ connected: false });
  
  return NextResponse.json({ connected: true, username: session.username });
}

export async function POST(req: Request) {
  try {
    const { apiKey, apiSecret } = await req.json();
    if (!apiKey || !apiSecret) return NextResponse.json({ error: "Missing keys" }, { status: 400 });

    const tempToken = encryptSession({ apiKey, apiSecret });
    const info = await coinexRequest('/v1/account/info', {}, tempToken);
    
    const username = info.data?.user || `User_${apiKey.slice(0, 4)}`;
    const token = encryptSession({ apiKey, apiSecret, username });

    return NextResponse.json({ success: true, username, token });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
