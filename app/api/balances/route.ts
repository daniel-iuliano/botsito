
export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import { coinexRequest } from '@/lib/coinex';

export async function GET(req: Request) {
  const token = req.headers.get('Authorization');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const info = await coinexRequest('/v1/balance/info', {}, token);
    const balances = Object.keys(info.data).map(asset => ({
      asset,
      available: parseFloat(info.data[asset].available),
      frozen: parseFloat(info.data[asset].frozen),
      total: parseFloat(info.data[asset].available) + parseFloat(info.data[asset].frozen)
    })).filter(b => b.total > 0);

    return NextResponse.json({ success: true, balances });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
